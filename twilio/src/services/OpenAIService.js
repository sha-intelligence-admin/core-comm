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
  return `You are the AI assistant for Sha Intelligence on phone calls. Represent the company clearly, briefly, and helpfully while protecting privacy.

COMPANY FACTS:
- Sha Intelligence: Safe, secure, privacy-first AI systems designed to serve people, not exploit them
- Founded by: Ibrahim BK (CEO), Yaqub Ja'e (CTO), Ibrahim B Balogun (Head of Security), Neemah Lawal (COO)
- Business: B2B subscriptions, enterprise licensing, custom API deployments
- Revenue: $150k+ from pilots; 45.86% growth; 100+ users onboarded
- Services: Signal AI for telcos, custom APIs for fintechs/banks, subscription services
- Market: AI projected to reach $3.68T by 2034 (19.20% growth rate)
- Contact: info@shaintelligence.com | +44 7853 257472 | shaintelligence.com

KEY KNOWLEDGE:
Mission: Build AI systems that are safe, secure, privacy-first—serve people, not exploit them
Vision: Future where AI empowers humanity with trust, safety, and purpose
Problem: Most AI systems overlook safety/privacy, putting people at risk. Trust is missing.
Solution: Decentralized AI systems, safe/secure/privacy-first by design, people in control
Timing: Critical time to build trustworthy AI. Must build it now, before it's too late.

RESPONSE STYLE:
- Phone-friendly, conversational, 1-3 sentences default
- Plain language, avoid jargon unless asked
- Structure: Direct answer → helpful detail → next step offer
- Be transparent about uncertainties; redirect off-topic questions to contact info

CORE RULES:
- Pricing: "Available upon request" → connect to sales
- Stay on Sha Intelligence topics or redirect to contact channels  
- No sensitive data collection; treat shared info as confidential
- No hallucinations; if unsure, offer to follow up via contact

EXAMPLE RESPONSES:

Q: "What does Sha Intelligence do?"
A: "We build safe, secure, privacy-first AI systems for enterprises—AI that amplifies your intelligence while maintaining trust and safety. Our services include Signal AI for telcos, custom API deployments for fintechs/banks, and subscription services. Would you like a demo or product overview?"

Q: "Who are the founders?"
A: "Founded by Ibrahim BK as CEO, with Yaqub Ja'e as CTO, Ibrahim B Balogun as Head of Security, and Neemah Lawal as COO. Our experienced team offers strategic guidance and industry expertise. Should I send you a company overview?"

Q: "What's your revenue?"
A: "We've generated over $150k in revenue from pilot subscriptions and API access, with 45.86% month-over-month user growth and 100+ users onboarded. Strong early traction in a $3.68 trillion market. Would you like our growth metrics?"

Q: "How much does it cost?"
A: "Pricing is available upon request and depends on your specific needs and deployment model. I can connect you with sales at info@shaintelligence.com or +44 7853 257472. What works better for you?"

Q: "Help me with my Python code"
A: "I'm focused on Sha Intelligence products and services. For coding help, please use your internal channels or reach us at info@shaintelligence.com for API-related questions."

NEXT STEPS TO OFFER: Demo booking, product deck, security overview, sales intro, or contact email follow-up.`;
}

  loadCommonResponses() {
    return new Map([
      [
        'company info',
        "We're Sha Intelligence, building safe, secure, privacy-first AI systems that amplify your intelligence while maintaining trust, safety, and purpose.",
      ],
      [
        'services',
        'We offer subscription-based models, enterprise licensing of Signal AI for telcos and large institutions, and custom API deployments for fintechs, banks, and secure environments.',
      ],
      [
        'contact',
        'You can reach us at info@shaintelligence.com, visit shaintelligence.com, or call +44 7853 257472.',
      ],
      [
        'founders',
        "Founded by Ibrahim BK as CEO, with Yaqub Ja'e as CTO, Ibrahim B Balogun as Head of Security, and Neemah Lawal as COO.",
      ],
      [
        'business model',
        "Scalable B2B model with subscription services, enterprise licensing, and custom API deployments. We've generated $150k+ in early revenue.",
      ],
      [
        'revenue',
        'We have generated over $150,000 in revenue through pilot subscriptions and API access on Core Comm, demonstrating strong early traction.',
      ],
      [
        'market size',
        'AI market projected to reach $3.68 trillion by 2034 with 19.20% annual growth rate according to Precedence Research.',
      ],
      [
        'growth',
        'We have 45.86% month-on-month user growth rate and have onboarded over 100 users so far.',
      ],
      [
        'problem',
        'Most AI systems overlook safety, privacy, and human alignment, putting people at risk. Trust is missing in AI.',
      ],
      [
        'solution',
        'We build decentralized AI systems that are safe, secure, and privacy-first by design, putting people in control.',
      ],
      [
        'mission',
        'Build AI systems that are safe, secure, and privacy-first, designed to serve people, not exploit them.',
      ],
      [
        'vision',
        'Shape a future where AI empowers humanity with trust, safety, and purpose.',
      ],
      [
        'timing',
        "Now is the critical time to build trustworthy AI. We must build it now, before it's too late.",
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

    // Enhanced quick pattern matching for instant responses
    if (
      lowerPrompt.includes('company') ||
      lowerPrompt.includes('about') ||
      lowerPrompt.includes('sha intelligence')
    ) {
      return this.commonResponses.get('company info');
    }
    if (
      lowerPrompt.includes('service') ||
      lowerPrompt.includes('offer') ||
      lowerPrompt.includes('product')
    ) {
      return this.commonResponses.get('services');
    }
    if (
      lowerPrompt.includes('contact') ||
      lowerPrompt.includes('reach') ||
      lowerPrompt.includes('email') ||
      lowerPrompt.includes('phone')
    ) {
      return this.commonResponses.get('contact');
    }
    if (
      lowerPrompt.includes('founder') ||
      lowerPrompt.includes('ceo') ||
      lowerPrompt.includes('team') ||
      lowerPrompt.includes('ibrahim')
    ) {
      return this.commonResponses.get('founders');
    }
    if (
      lowerPrompt.includes('business model') ||
      lowerPrompt.includes('make money') ||
      lowerPrompt.includes('revenue stream')
    ) {
      return this.commonResponses.get('business model');
    }
    if (
      lowerPrompt.includes('revenue') ||
      lowerPrompt.includes('sales') ||
      lowerPrompt.includes('traction')
    ) {
      return this.commonResponses.get('revenue');
    }
    if (
      lowerPrompt.includes('market size') ||
      lowerPrompt.includes('market') ||
      lowerPrompt.includes('3.68 trillion')
    ) {
      return this.commonResponses.get('market size');
    }
    if (
      lowerPrompt.includes('growth') ||
      lowerPrompt.includes('user growth') ||
      lowerPrompt.includes('45.86')
    ) {
      return this.commonResponses.get('growth');
    }
    if (
      lowerPrompt.includes('problem') ||
      lowerPrompt.includes('solving') ||
      lowerPrompt.includes('ai safety')
    ) {
      return this.commonResponses.get('problem');
    }
    if (
      lowerPrompt.includes('solution') ||
      lowerPrompt.includes('decentralized') ||
      lowerPrompt.includes('privacy-first')
    ) {
      return this.commonResponses.get('solution');
    }
    if (lowerPrompt.includes('mission') || lowerPrompt.includes('purpose')) {
      return this.commonResponses.get('mission');
    }
    if (lowerPrompt.includes('vision') || lowerPrompt.includes('future')) {
      return this.commonResponses.get('vision');
    }
    if (
      lowerPrompt.includes('why now') ||
      lowerPrompt.includes('timing') ||
      lowerPrompt.includes('urgency')
    ) {
      return this.commonResponses.get('timing');
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
