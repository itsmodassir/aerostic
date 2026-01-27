"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const ai_agent_entity_1 = require("./entities/ai-agent.entity");
const messages_service_1 = require("../messages/messages.service");
const config_1 = require("@nestjs/config");
const generative_ai_1 = require("@google/generative-ai");
let AiService = class AiService {
    messagesService;
    configService;
    aiAgentRepo;
    genAI;
    model;
    constructor(messagesService, configService, aiAgentRepo) {
        this.messagesService = messagesService;
        this.configService = configService;
        this.aiAgentRepo = aiAgentRepo;
        const apiKey = this.configService.get('GEMINI_API_KEY');
        if (apiKey) {
            this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
            this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
        }
    }
    async process(tenantId, from, messageBody) {
        console.log(`AI Processing message from ${from}: ${messageBody}`);
        if (!this.model) {
            console.log('AI not configured (GEMINI_API_KEY missing)');
            return;
        }
        try {
            const agent = await this.aiAgentRepo.findOneBy({ tenantId });
            const systemPrompt = agent?.systemPrompt || "You are a helpful and friendly customer support agent for Aerostic, a SaaS platform. Answer concisely.";
            const isActive = agent ? agent.active : true;
            if (!isActive) {
                console.log('AI Agent disabled for tenant');
                return;
            }
            const prompt = `
System: ${systemPrompt}
Instruction: You are an AI agent. If you are not confident you can answer the user's question accurately, or if the user asks to speak to a human, reply exactly with "HANDOFF_TO_AGENT".
User: ${messageBody}
Agent:`;
            const result = await this.model.generateContent(prompt);
            const response = result.response;
            const aiReply = response.text();
            if (aiReply.includes('HANDOFF_TO_AGENT')) {
                console.log(`AI Confidence Low / Handoff triggered for ${from}`);
                return;
            }
            await this.messagesService.send({
                tenantId,
                to: from,
                type: 'text',
                payload: { text: aiReply }
            });
        }
        catch (e) {
            console.error('AI Generation Failed', e);
        }
    }
};
exports.AiService = AiService;
exports.AiService = AiService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, typeorm_1.InjectRepository)(ai_agent_entity_1.AiAgent)),
    __metadata("design:paramtypes", [messages_service_1.MessagesService,
        config_1.ConfigService,
        typeorm_2.Repository])
], AiService);
//# sourceMappingURL=ai.service.js.map