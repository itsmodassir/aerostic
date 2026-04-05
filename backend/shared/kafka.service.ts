import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Kafka, Producer, Consumer, EachMessageHandler } from "kafkajs";
import { KafkaTopic, KafkaEvent, KafkaMessagePayload } from "./kafka-events.constants";

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaService.name);
  private kafka: Kafka;
  private producer: Producer;
  private consumers: Consumer[] = [];
  public isConnected = false;

  constructor(private configService: ConfigService) {
    this.kafka = new Kafka({
      clientId: "aerostic-orchestrator",
      brokers: this.configService
        .get<string>("KAFKA_BROKERS", "localhost:9092")
        .split(","),
      retry: {
        initialRetryTime: 300,
        retries: 5,
      },
    });
    this.producer = this.kafka.producer();
  }

  async onModuleInit() {
    try {
      await this.producer.connect();
      this.isConnected = true;
      this.logger.log("Kafka Core Producer connected and active.");
    } catch (error) {
       this.isConnected = false;
       this.logger.error("Kafka Core Infrastructure Unavailable - Degrading Event Engine...");
       this.logger.debug(`Kafka error context: ${error.message}`);
    }
  }

  async onModuleDestroy() {
    try {
      await this.producer.disconnect();
      for (const consumer of this.consumers) {
        await consumer.disconnect();
      }
      this.isConnected = false;
      this.logger.log("Internal Kafka connections released.");
    } catch (error) {
      this.logger.warn("Kafka disconnect failed during teardown.");
    }
  }

  /**
   * Emit a standardized event to the Kafka cluster
   */
  async emit<T = any>(
    topic: KafkaTopic, 
    event: KafkaEvent, 
    data: T, 
    tenantId?: string,
    metadata?: Record<string, any>
  ) {
    if (!this.isConnected) {
        this.logger.warn(`Kafka Offline - Dropping event ${event} to topic ${topic}.`);
        return;
    }

    const payload: KafkaMessagePayload<T> = {
        event,
        data,
        tenantId,
        timestamp: new Date().toISOString(),
        metadata
    };

    try {
      await this.producer.send({
        topic,
        messages: [{ 
            value: JSON.stringify(payload),
            key: tenantId || 'system-event'
        }],
      });
      this.logger.debug(`Dispatched event: ${event} -> ${topic}`);
    } catch (err) {
      this.logger.error(`Dispatch failure for event ${event} to topic ${topic}`, err.stack);
    }
  }

  /**
   * Internal wrapper for direct JSON emission (legacy support)
   */
  async rawEmit(topic: string, message: any) {
    try {
      await this.producer.send({
        topic,
        messages: [{ value: JSON.stringify(message) }],
      });
    } catch (err) {
      this.logger.error(`Failed to emit raw event to ${topic}`, err.stack);
    }
  }

  /**
   * Register a consumer for higher-level event orchestration
   */
  async subscribe(
    groupId: string,
    topic: string,
    onMessage: EachMessageHandler,
  ) {
    try {
        const consumer = this.kafka.consumer({ groupId });
        await consumer.connect();
        await consumer.subscribe({ topic, fromBeginning: false });
        await consumer.run({ eachMessage: onMessage });
        this.consumers.push(consumer);
        this.logger.log(`Active Kafka Consumer registered for topic: ${topic} in group: ${groupId}`);
    } catch (error) {
        this.logger.error(`Failed to register consumer for topic ${topic}`, error.stack);
    }
  }
}
