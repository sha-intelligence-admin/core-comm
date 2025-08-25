import OpenAI from 'openai';
import { CONFIG } from '../config/config.js';
import ResponseCache from './ResponseCache.js';
import logger from './LoggingService.js';

class OpenAIService {
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: CONFIG.OPENAI_TIMEOUT,
    });
    this.model = CONFIG.OPENAI_MODEL;
    this.cache = new ResponseCache(1000, CONFIG.CACHE_DURATION);
    this.systemPrompt = this.getOptimizedSystemPrompt();
    this.commonResponses = this.loadCommonResponses();
  }

  getOptimizedSystemPrompt() {
    return `
[ROLE]
You are the AI assistant for Sha Intelligence on phone calls and live chat. Your job is to clearly, briefly, and helpfully represent the company while protecting user privacy.

[CONTEXT: COMPANY FACTS]
- Name: Sha Intelligence
- Mission: Build AI systems that are safe, secure, and privacy-first—designed to serve people, not exploit them.
- Vision: A future where AI empowers humanity with trust, safety, and purpose.
- Founded by: Ibrahim BK (Founder & CEO), Ibrahim B Balogun (Head of Security), Yaqub Ja'e (Co-Founder & CTO), Neemah Lawal (Co-Founder & COO)
- Business Model: Scalable B2B—subscription services, enterprise licensing, and custom API deployments.
- Revenue: $150k+ from pilot subscriptions and API access on Core Comm.
- Market: AI market projected to reach $3.68T by 2034 (Precedence Research).
- User Growth: 45.86% growth rate; 100+ users onboarded.
- Solution: Decentralized, safety-first AI systems.
- Services: Signal AI for telcos, custom API deployments for fintechs/banks, subscription services.
- Contact: shaintelligence.com | info@shaintelligence.com | +44 7853 257472

[PRIMARY GOALS]
1) Answer questions about Sha Intelligence, products, and security posture.
2) Build trust (privacy-first, safety, alignment).
3) Capture intent and next steps (book a demo, send deck, connect to sales).
4) Redirect anything unrelated to Sha Intelligence to official contact channels.

[STYLE & TONE]
- Phone-friendly, conversational, and concise.
- Plain language; avoid heavy jargon unless asked.
- Be transparent about uncertainties; never guess.
- Respect privacy; don't request sensitive data.

[HARD RULES]
- Pricing: Say "pricing is available upon request" and offer to connect to sales.
- Scope: Stay on Sha Intelligence topics. If outside scope, politely redirect to contact info.
- Privacy: Do not collect sensitive personal data. If shared, acknowledge and treat as confidential.
- No hallucinations: If unsure, say so and offer to follow up via contact channels.
- Security: Never share internal processes, credentials, or non-public details.

[OUTPUT FORMAT]
- Default answer in 2-5 sentences.
- Structure answers as:
  1) Direct, brief answer.
  2) One helpful detail or example (optional).
  3) Offer a next step (demo, email, call).
- Use bullet points only when listing options.
- Mirror the user's language (default to clear English).
- No emojis unless the user uses them first.

[REDIRECT TEMPLATE]
"I'm focused on Sha Intelligence topics. For {request}, please reach us at info@shaintelligence.com or +44 7853 257472."

[NEXT-STEP OPTIONS]
- Book a demo
- Send product deck / security overview
- Intro to sales/partnerships
- Share contact email to continue the thread (optional, never required)

[FEW-SHOT EXAMPLES]

Q: "What does Sha Intelligence do?"
A: "We build safe, secure, privacy-first AI systems for enterprises. Our offering includes Signal AI for telcos, custom API deployments for fintechs and banks, and subscription services. Would you like a brief deck or to book a 20-minute demo?"

Q: "How much does Signal AI cost?"
A: "Pricing is available upon request and depends on volume and deployment model. I can loop in sales at info@shaintelligence.com or set up a quick call at +44 7853 257472—what works for you?"

Q: "Can you integrate with our bank's private cloud?"
A: "Yes—our deployments support on-prem and private cloud with strict security controls. We can share a short security overview and discuss your requirements on a demo. Should I send the overview to your email?"

Q: "Is your data safe?"
A: "Yes—privacy is core to our design. We minimize data collection, support decentralized patterns, and align with strict security practices. If you'd like, I can share our high-level security overview or set a call with our team."

Q: "Help me debug my Python code?"
A: "I'm focused on Sha Intelligence products and services. For coding help, please use your internal channels. If you're exploring our APIs, I can connect you with our team at info@shaintelligence.com."

Q: "Who founded the company?"
A: "Our founders are Ibrahim BK (CEO), Ibrahim B Balogun (Head of Security), Yaqub Ja'e (CTO), and Neemah Lawal (COO). Would you like a short company one-pager?"

[ESCALATION]
If the user requests info you don't have or asks for detailed pricing/SLAs: be transparent, then offer to connect them with sales or schedule a demo.

[END OF SYSTEM PROMPT]
`;
  }

  loadCommonResponses() {
    return new Map([
      [
        'company info',
        "We're Sha Intelligence, focused on safe, secure AI systems that prioritize privacy and serve people without exploitation.",
      ],
      [
        'services',
        'We offer Signal AI for telcos, custom API deployments for fintechs/banks, and subscription-based AI services.',
      ],
      [
        'contact',
        'You can reach us at info@shaintelligence.com or through our website for more information.',
      ],
      [
        'founders',
        "Founded by Ibrahim BK as CEO, with team members Ibrahim B Balogun, Yaqub Ja'e, and Neemah Lawal.",
      ],
    ]);
  }

  async generateResponse(prompt, conversationHistory = [], options = {}) {
    const startTime = Date.now();

    try {
      // Quick pattern matching for common questions
      const quickResponse = this.getQuickResponse(prompt);
      if (quickResponse) {
        logger.info('Using quick response pattern match', {
          prompt: prompt.substring(0, 50),
          responseTime: Date.now() - startTime,
        });
        return { response: quickResponse, cached: true, source: 'pattern' };
      }

      // Check cache first
      if (CONFIG.ENABLE_RESPONSE_CACHING) {
        const cacheKey = this.cache.generateKey(
          prompt,
          JSON.stringify(conversationHistory.slice(-2)) // Only last 2 messages for context
        );

        const cachedResponse = this.cache.get(cacheKey);
        if (cachedResponse) {
          logger.info('Using cached response', {
            prompt: prompt.substring(0, 50),
            responseTime: Date.now() - startTime,
          });
          return { response: cachedResponse, cached: true, source: 'cache' };
        }
      }

      const {
        systemPrompt = this.systemPrompt,
        temperature = CONFIG.OPENAI_TEMPERATURE,
        maxTokens = CONFIG.OPENAI_MAX_TOKENS,
        timeout = CONFIG.OPENAI_TIMEOUT,
      } = options;

      // Build optimized messages array
      const messages = [{ role: 'system', content: systemPrompt }];

      // Limit conversation history more aggressively
      const limitedHistory = conversationHistory.slice(
        -CONFIG.MAX_CONVERSATION_HISTORY
      );
      messages.push(...limitedHistory);
      messages.push({ role: 'user', content: prompt });

      // Create completion with timeout
      const completionPromise = this.client.chat.completions.create({
        model: this.model,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: false,
      });

      // Race with timeout
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('OpenAI timeout')), timeout)
      );

      const completion = await Promise.race([
        completionPromise,
        timeoutPromise,
      ]);
      const response = completion.choices[0]?.message?.content;

      if (!response) {
        throw new Error('No response content from OpenAI');
      }

      // Truncate if too long
      const finalResponse =
        CONFIG.MAX_RESPONSE_LENGTH &&
        response.length > CONFIG.MAX_RESPONSE_LENGTH
          ? response.substring(0, CONFIG.MAX_RESPONSE_LENGTH) + '...'
          : response;

      // Cache successful responses
      if (CONFIG.ENABLE_RESPONSE_CACHING) {
        const cacheKey = this.cache.generateKey(
          prompt,
          JSON.stringify(conversationHistory.slice(-2))
        );
        this.cache.set(cacheKey, finalResponse);
      }

      const responseTime = Date.now() - startTime;
      logger.info('OpenAI response generated', {
        responseTime,
        responseLength: finalResponse.length,
        tokensUsed: completion.usage?.total_tokens,
        cached: false,
      });

      return {
        response: finalResponse,
        usage: completion.usage,
        responseTime,
        cached: false,
        source: 'openai',
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      logger.error('OpenAI API error', {
        error: error.message,
        responseTime,
        prompt: prompt.substring(0, 50),
      });

      // Fast fallback response
      return {
        response:
          "I'm having trouble processing that. Could you rephrase your question?",
        error: error.message,
        fallback: true,
        responseTime,
      };
    }
  }

  getQuickResponse(prompt) {
    const lowerPrompt = prompt.toLowerCase();

    // Quick pattern matching for instant responses
    if (lowerPrompt.includes('company') || lowerPrompt.includes('about')) {
      return this.commonResponses.get('company info');
    }
    if (lowerPrompt.includes('service') || lowerPrompt.includes('offer')) {
      return this.commonResponses.get('services');
    }
    if (lowerPrompt.includes('contact') || lowerPrompt.includes('reach')) {
      return this.commonResponses.get('contact');
    }
    if (lowerPrompt.includes('founder') || lowerPrompt.includes('ceo')) {
      return this.commonResponses.get('founders');
    }

    return null;
  }

  // Optimized call ending detection
  async detectCallEnding(transcript, conversationHistory = []) {
    const startTime = Date.now();

    // Quick regex check first
    const quickCheck = this.quickEndingCheck(transcript);
    if (quickCheck.confidence >= 0.9) {
      return {
        ...quickCheck,
        responseTime: Date.now() - startTime,
        source: 'regex',
      };
    }

    try {
      // Use minimal system prompt for speed
      const systemPrompt = `Detect if user wants to end phone call. Respond JSON: {"isEnding": boolean, "confidence": 0.0-1.0, "reason": "string"}`;

      const result = await this.generateResponse(
        `User said: "${transcript}". End call intent?`,
        [], // No history for speed
        {
          systemPrompt,
          temperature: 0.1,
          maxTokens: 50,
          timeout: 3000, // Faster timeout for ending detection
        }
      );

      const analysis = JSON.parse(result.response);

      return {
        isEnding: analysis.isEnding,
        confidence: analysis.confidence,
        reason: analysis.reason,
        responseTime: Date.now() - startTime,
        source: 'openai',
      };
    } catch (error) {
      // Fallback to regex on any error
      return {
        ...quickCheck,
        responseTime: Date.now() - startTime,
        source: 'fallback',
      };
    }
  }

  quickEndingCheck(transcript) {
    const text = transcript.toLowerCase().trim();

    if (/^(bye|goodbye|bye bye)$/i.test(text)) {
      return { isEnding: true, confidence: 0.95, reason: 'explicit_goodbye' };
    }

    if (/(thank you.*bye|thanks.*goodbye)/i.test(text)) {
      return { isEnding: true, confidence: 0.9, reason: 'thanking_goodbye' };
    }

    if (/(that's all|i'm done|end call)/i.test(text)) {
      return { isEnding: true, confidence: 0.85, reason: 'completion_signal' };
    }

    return { isEnding: false, confidence: 0.1, reason: 'no_ending_detected' };
  }

  getCacheStats() {
    return this.cache.getStats();
  }
}

export default OpenAIService;
