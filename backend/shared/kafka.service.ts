import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Kafka, Producer, Consumer, EachMessageHandler } from "kafkajs";

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaService.name);
  private kafka: Kafka;
  private producer: Producer;
  private consumers: Consumer[] = [];

  constructor(private configService: ConfigService) {
    this.kafka = new Kafka({
      clientId: "aerostic-cluster",
      brokers: this.configService
        .get<string>("KAFKA_BROKERS", "localhost:9092")
        .split(","),
      retry: {
        initialRetryTime: 100,
        retries: 8,
      },
    });
    this.producer = this.kafka.producer();
  }

  async onModuleInit() {
    try {
      await this.producer.connect();
      this.logger.log("Kafka Producer connected");
    } catch (error) {
      this.logger.warn(
        "Kafka Producer connection failed - Kafka features will be disabled",
      );
      this.logger.warn(`Kafka error: ${error.message}`);
    }
  }

  async onModuleDestroy() {
    try {
      await this.producer.disconnect();
      for (const consumer of this.consumers) {
        await consumer.disconnect();
      }
      this.logger.log("Kafka connections closed");
    } catch (error) {
      this.logger.warn("Kafka disconnect failed (may not have been connected)");
    }
  }

  /**
   * Send a message to a specific topic
   */
  async emit(topic: string, message: any) {
    try {
      await this.producer.send({
        topic,
        messages: [{ value: JSON.stringify(message) }],
      });
    } catch (err) {
      this.logger.error(`Failed to emit event to ${topic}`, err.stack);
    }
  }

  /**
   * Create and register a consumer for a specific topic/group
   */
  async subscribe(
    groupId: string,
    topic: string,
    onMessage: EachMessageHandler,
  ) {
    const consumer = this.kafka.consumer({ groupId });
    await consumer.connect();
    await consumer.subscribe({ topic, fromBeginning: false });
    await consumer.run({ eachMessage: onMessage });
    this.consumers.push(consumer);
    this.logger.log(
      `Kafka Consumer subscribed to ${topic} in group ${groupId}`,
    );
  }
}
