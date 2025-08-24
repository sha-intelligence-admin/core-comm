// Secure Knowledge Base - Simple pattern matching without vulnerable dependencies
import logger from '../services/LoggingService.js';

class SecureKnowledgeBase {
  constructor() {
    this.knowledgeBase = {
      'business.model': {
        patterns: ['business model', 'how do you make money', 'revenue model', 'monetize'],
        answer: 'Our business model is a scalable B2B model that generates revenue through a multi-faceted approach, including a subscription-based model, enterprise licensing, and custom API deployments.'
      },
      'company.revenue': {
        patterns: ['revenue', 'traction', 'sales', 'earnings', 'money'],
        answer: 'So far, we have generated over $150,000 in revenue from pilot subscriptions and API access, specifically on Core Comm.'
      },
      'market.size': {
        patterns: ['market size', 'market', 'industry size', 'ai market'],
        answer: 'According to Precedence Research, the market size for AI is projected to reach $3.68 trillion by 2034.'
      },
      'company.team': {
        patterns: ['team', 'founders', 'who', 'people', 'staff', 'employees'],
        answer: 'Our team includes Ibrahim BK as Founder and CEO, Ibrahim B Balogun as Head of Security, Yaqub Ja\'e as Co-Founder and CTO, and Neemah Lawal as Co-Founder and COO.'
      },
      'company.contact': {
        patterns: ['contact', 'email', 'phone', 'website', 'reach', 'call', 'get in touch'],
        answer: 'You can find more information on our website at shaintelligence.com, email us at info@shaintelligence.com, or call us at +44 7853 257472.'
      },
      'company.pricing': {
        patterns: ['pricing', 'cost', 'price', 'how much', 'expense', 'fee'],
        answer: 'Pricing is available upon request.'
      },
      'company.growth': {
        patterns: ['growth', 'users', 'customers', 'user growth'],
        answer: 'We have a user growth rate of 45.86% and have onboarded over 100 users so far.'
      },
      'company.problem': {
        patterns: ['problem', 'issue', 'challenge', 'solving'],
        answer: 'The problem is that most AI systems today overlook safety, privacy, and human alignment, which puts people and organizations at risk.'
      },
      'company.solution': {
        patterns: ['solution', 'solve', 'approach', 'how'],
        answer: 'The solution is to build decentralized AI systems that are safe, secure, and privacy-first. This puts people in control and aligns intelligence with human values.'
      },
      'company.about': {
        patterns: ['about', 'sha intelligence', 'company', 'what is', 'who are you'],
        answer: 'Sha Intelligence builds safe, secure, and privacy-first AI systems by design to serve people, not exploit them.'
      }
    };
  }

  async getBestAnswer(language, question) {
    try {
      if (!question || typeof question !== 'string') {
        return null;
      }

      const normalizedQuestion = question.toLowerCase().trim();
      
      // Simple security: limit question length
      if (normalizedQuestion.length > 500) {
        logger.warn('Question too long, truncating', { originalLength: normalizedQuestion.length });
        return null;
      }

      let bestMatch = null;
      let bestScore = 0;

      // Simple pattern matching
      for (const [topic, data] of Object.entries(this.knowledgeBase)) {
        for (const pattern of data.patterns) {
          if (normalizedQuestion.includes(pattern.toLowerCase())) {
            // Simple scoring based on pattern length (longer patterns = more specific)
            const score = pattern.length / normalizedQuestion.length + 0.5;
            if (score > bestScore) {
              bestMatch = {
                topic,
                answer: data.answer,
                score: Math.min(score, 1.0)
              };
              bestScore = score;
            }
          }
        }
      }

      if (bestMatch) {
        logger.info('Knowledge base match found', {
          topic: bestMatch.topic,
          score: bestMatch.score,
          question: normalizedQuestion.substring(0, 50)
        });

        return {
          answer: bestMatch.answer,
          score: bestMatch.score
        };
      }

      return null;

    } catch (error) {
      logger.error('Error in secure knowledge base query', {
        error: error.message,
        question: question ? question.substring(0, 50) : 'undefined'
      });
      return null;
    }
  }

  // Method to add new knowledge (for future expansion)
  addKnowledge(topic, patterns, answer) {
    if (!topic || !patterns || !answer) {
      throw new Error('Topic, patterns, and answer are required');
    }

    // Security validation
    if (typeof topic !== 'string' || !Array.isArray(patterns) || typeof answer !== 'string') {
      throw new Error('Invalid data types for knowledge entry');
    }

    // Sanitize inputs
    const sanitizedTopic = topic.replace(/[^a-zA-Z0-9._-]/g, '');
    const sanitizedPatterns = patterns.map(p => 
      typeof p === 'string' ? p.substring(0, 100).toLowerCase() : ''
    ).filter(p => p.length > 0);
    const sanitizedAnswer = answer.substring(0, 1000);

    this.knowledgeBase[sanitizedTopic] = {
      patterns: sanitizedPatterns,
      answer: sanitizedAnswer
    };

    logger.info('Knowledge added', { topic: sanitizedTopic });
  }

  // Get knowledge base stats
  getStats() {
    const topics = Object.keys(this.knowledgeBase);
    const totalPatterns = topics.reduce((sum, topic) => 
      sum + this.knowledgeBase[topic].patterns.length, 0
    );

    return {
      totalTopics: topics.length,
      totalPatterns,
      topics: topics
    };
  }
}

// Export singleton instance
const secureKB = new SecureKnowledgeBase();
export default secureKB;