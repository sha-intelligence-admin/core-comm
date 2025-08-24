import OpenAI from 'openai';
import logger from './LoggingService.js';

class OpenAIService {
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    this.systemPrompt = `You are an AI assistant representing Sha Intelligence, a company that builds safe, secure, and privacy-first AI systems. 

Company Information:
- Founded by: Ibrahim BK (Founder & CEO), Ibrahim B Balogun (Head of Security), Yaqub Ja'e (Co-Founder & CTO), and Neemah Lawal (Co-Founder & COO)
- Business Model: Scalable B2B model with subscription-based services, enterprise licensing, and custom API deployments
- Revenue: Over $150,000 from pilot subscriptions and API access on Core Comm
- Market: AI market projected to reach $3.68 trillion by 2034 (Precedence Research)
- User Growth: 45.86% growth rate with over 100 users onboarded
- Problem: Most AI systems today overlook safety, privacy, and human alignment
- Solution: Decentralized AI systems that are safe, secure, and privacy-first
- Contact: website: shaintelligence.com, email: info@shaintelligence.com, phone: +44 7853 257472
- Mission: To build AI systems that are safe, secure, and privacy-first, designed to serve people, not exploit them
- Vision: To shape a future where AI empowers humanity with trust, safety, and purpose
- Services: Signal AI for telcos, custom API deployments for fintechs/banks, subscription services
- Why Now: AI is growing fast but trust is missing - we need to build trustworthy AI before it's too late

Guidelines:
- Keep responses conversational and natural for phone calls
- Be helpful and informative but concise
- If asked about pricing, say it's available upon request
- Stay focused on Sha Intelligence topics
- For questions outside your knowledge, politely redirect to company contact information
- Maintain a professional but friendly tone`;
  }

  async generateResponse(userInput, conversationHistory = []) {
    try {
      const messages = [
        { role: 'system', content: this.systemPrompt },
        ...conversationHistory,
        { role: 'user', content: userInput }
      ];

      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini', // gpt-4 no longer available in the open ai api
        messages: messages,
        max_tokens: 250,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      });

      const assistantResponse = response.choices[0]?.message?.content?.trim();
      
      if (!assistantResponse) {
        throw new Error('No response generated from OpenAI');
      }

      // Log the AI conversation
      logger.info('AI Conversation', {
        userInput: userInput,
        aiResponse: assistantResponse,
        tokensUsed: response.usage?.total_tokens || 0,
        inputLength: userInput.length,
        responseLength: assistantResponse.length
      });

      logger.info('OpenAI response generated', {
        inputLength: userInput.length,
        responseLength: assistantResponse.length,
        tokensUsed: response.usage?.total_tokens || 0
      });

      return {
        response: assistantResponse,
        usage: response.usage
      };

    } catch (error) {
      logger.error('Error generating OpenAI response', {
        error: error.message,
        userInput: userInput.substring(0, 50)
      });
      
      return {
        response: "I'm sorry, I'm having trouble processing that right now. Please try again or contact us directly at info@shaintelligence.com",
        usage: null
      };
    }
  }

  async generateStreamingResponse(userInput, conversationHistory = [], onChunk) {
    try {
      const messages = [
        { role: 'system', content: this.systemPrompt },
        ...conversationHistory,
        { role: 'user', content: userInput }
      ];

      const stream = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',  // gpt-4 no longer available in the open ai api
        messages: messages,
        max_tokens: 150,
        temperature: 0.7,
        stream: true,
      });

      let fullResponse = '';
      
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullResponse += content;
          if (onChunk) {
            onChunk(content, fullResponse);
          }
        }
      }

      // Log the streaming conversation
      logger.info('AI Streaming Conversation', {
        userInput: userInput,
        aiResponse: fullResponse,
        inputLength: userInput.length,
        responseLength: fullResponse.length
      });

      logger.info('OpenAI streaming response completed', {
        inputLength: userInput.length,
        responseLength: fullResponse.length
      });

      return fullResponse;

    } catch (error) {
      logger.error('Error generating streaming OpenAI response', {
        error: error.message,
        userInput: userInput.substring(0, 50)
      });
      
      const fallbackResponse = "I'm sorry, I'm having trouble processing that right now. Please try again or contact us directly at info@shaintelligence.com";
      if (onChunk) {
        onChunk(fallbackResponse, fallbackResponse);
      }
      return fallbackResponse;
    }
  }

  extractKnowledgeFromInput(userInput) {
    const knowledgeKeywords = {
      'business_model': ['business model', 'how do you make money', 'revenue model'],
      'company_revenue': ['revenue', 'traction', 'sales', 'earnings'],
      'market_size': ['market size', 'market', 'industry size'],
      'team': ['team', 'founders', 'who', 'people'],
      'contact': ['contact', 'email', 'phone', 'website', 'reach'],
      'pricing': ['pricing', 'cost', 'price', 'how much'],
      'growth': ['growth', 'users', 'customers'],
      'problem': ['problem', 'issue', 'challenge'],
      'solution': ['solution', 'solve', 'approach'],
      'about': ['about', 'sha intelligence', 'company']
    };

    const lowerInput = userInput.toLowerCase();
    const matchedTopics = [];

    for (const [topic, keywords] of Object.entries(knowledgeKeywords)) {
      if (keywords.some(keyword => lowerInput.includes(keyword))) {
        matchedTopics.push(topic);
      }
    }

    return matchedTopics;
  }
}

export default OpenAIService;