// For stable node-nlp v4
import pkg from 'node-nlp';
const { NlpManager } = pkg;

const manager = new NlpManager({ languages: ['en'], forceNER: true });

// BUSINESS MODEL - Enhanced with deck details
manager.addDocument('en', 'What is your business model?', 'business.model');
manager.addDocument('en', 'Tell me about your business model', 'business.model');
manager.addDocument('en', 'How do you make money?', 'business.model');
manager.addDocument('en', 'business model', 'business.model');
manager.addDocument('en', 'how do you generate revenue', 'business.model');
manager.addDocument('en', 'revenue streams', 'business.model');
manager.addDocument('en', 'subscription model', 'business.model');
manager.addDocument('en', 'B2B model', 'business.model');

// REVENUE & TRACTION - Enhanced with specific metrics
manager.addDocument('en', 'What is your revenue?', 'company.revenue');
manager.addDocument('en', 'How much revenue do you have?', 'company.revenue');
manager.addDocument('en', 'Tell me about your traction', 'company.revenue');
manager.addDocument('en', 'revenue', 'company.revenue');
manager.addDocument('en', 'traction', 'company.revenue');
manager.addDocument('en', 'sales', 'company.revenue');
manager.addDocument('en', 'early revenue', 'company.revenue');
manager.addDocument('en', 'pilot subscriptions', 'company.revenue');
manager.addDocument('en', 'API access revenue', 'company.revenue');
manager.addDocument('en', 'Core Comm revenue', 'company.revenue');

// MARKET SIZE - Enhanced with specific data
manager.addDocument('en', 'What is the market size for AI?', 'market.size');
manager.addDocument('en', 'How big is the AI market?', 'market.size');
manager.addDocument('en', 'market size', 'market.size');
manager.addDocument('en', 'market', 'market.size');
manager.addDocument('en', 'AI market growth', 'market.size');
manager.addDocument('en', 'market opportunity', 'market.size');
manager.addDocument('en', 'precedence research', 'market.size');
manager.addDocument('en', '3.68 trillion', 'market.size');
manager.addDocument('en', 'annual growth rate', 'market.size');

// TEAM - Enhanced with specific roles and LinkedIn profiles
manager.addDocument('en', 'Who is on your team?', 'company.team');
manager.addDocument('en', 'Tell me about your founders', 'company.team');
manager.addDocument('en', 'Who are the team members?', 'company.team');
manager.addDocument('en', 'team', 'company.team');
manager.addDocument('en', 'founders', 'company.team');
manager.addDocument('en', 'Ibrahim BK', 'company.team');
manager.addDocument('en', 'Yaqub Jae', 'company.team');
manager.addDocument('en', 'Ibrahim B Balogun', 'company.team');
manager.addDocument('en', 'Neemah Lawal', 'company.team');
manager.addDocument('en', 'CEO', 'company.team');
manager.addDocument('en', 'CTO', 'company.team');
manager.addDocument('en', 'COO', 'company.team');
manager.addDocument('en', 'head of security', 'company.team');

// CONTACT - Same as before
manager.addDocument('en', 'How can I contact you?', 'company.contact');
manager.addDocument('en', 'What is your contact information?', 'company.contact');
manager.addDocument('en', 'contact', 'company.contact');
manager.addDocument('en', 'email', 'company.contact');
manager.addDocument('en', 'phone', 'company.contact');
manager.addDocument('en', 'website', 'company.contact');
manager.addDocument('en', 'reach out', 'company.contact');

// PRICING - Same as before
manager.addDocument('en', 'What is your pricing?', 'company.pricing');
manager.addDocument('en', 'How much does it cost?', 'company.pricing');
manager.addDocument('en', 'pricing', 'company.pricing');
manager.addDocument('en', 'cost', 'company.pricing');
manager.addDocument('en', 'price', 'company.pricing');

// USER GROWTH - Enhanced with specific metrics
manager.addDocument('en', 'How is your user growth?', 'company.growth');
manager.addDocument('en', 'Tell me about your growth', 'company.growth');
manager.addDocument('en', 'user growth', 'company.growth');
manager.addDocument('en', 'growth', 'company.growth');
manager.addDocument('en', 'growth rate', 'company.growth');
manager.addDocument('en', 'users onboarded', 'company.growth');
manager.addDocument('en', '45 percent growth', 'company.growth');
manager.addDocument('en', 'month on month growth', 'company.growth');

// PROBLEM STATEMENT - Enhanced with deck language
manager.addDocument('en', 'What is the problem you are solving?', 'company.problem');
manager.addDocument('en', 'What problem do you solve?', 'company.problem');
manager.addDocument('en', 'problem', 'company.problem');
manager.addDocument('en', 'problem statement', 'company.problem');
manager.addDocument('en', 'AI safety issues', 'company.problem');
manager.addDocument('en', 'privacy concerns', 'company.problem');
manager.addDocument('en', 'human alignment', 'company.problem');
manager.addDocument('en', 'AI risks', 'company.problem');

// SOLUTION - Enhanced with specific approach
manager.addDocument('en', 'What is the solution?', 'company.solution');
manager.addDocument('en', 'How do you solve this problem?', 'company.solution');
manager.addDocument('en', 'solution', 'company.solution');
manager.addDocument('en', 'decentralized AI', 'company.solution');
manager.addDocument('en', 'privacy-first AI', 'company.solution');
manager.addDocument('en', 'safe AI systems', 'company.solution');
manager.addDocument('en', 'secure AI', 'company.solution');
manager.addDocument('en', 'human values', 'company.solution');

// COMPANY ABOUT - Enhanced with mission and vision
manager.addDocument('en', 'What is Sha Intelligence?', 'company.about');
manager.addDocument('en', 'Tell me about Sha Intelligence', 'company.about');
manager.addDocument('en', 'about', 'company.about');
manager.addDocument('en', 'sha intelligence', 'company.about');
manager.addDocument('en', 'what do you do', 'company.about');
manager.addDocument('en', 'company overview', 'company.about');

// NEW CATEGORIES FROM DECK

// PURPOSE & MISSION
manager.addDocument('en', 'What is your purpose?', 'company.purpose');
manager.addDocument('en', 'What is your mission?', 'company.purpose');
manager.addDocument('en', 'mission', 'company.purpose');
manager.addDocument('en', 'purpose', 'company.purpose');
manager.addDocument('en', 'company mission', 'company.purpose');

// VISION
manager.addDocument('en', 'What is your vision?', 'company.vision');
manager.addDocument('en', 'vision', 'company.vision');
manager.addDocument('en', 'future goals', 'company.vision');
manager.addDocument('en', 'long term vision', 'company.vision');

// WHY NOW
manager.addDocument('en', 'Why now?', 'company.timing');
manager.addDocument('en', 'Why is this the right time?', 'company.timing');
manager.addDocument('en', 'timing', 'company.timing');
manager.addDocument('en', 'market timing', 'company.timing');
manager.addDocument('en', 'urgency', 'company.timing');

// SERVICES & PRODUCTS
manager.addDocument('en', 'What services do you offer?', 'company.services');
manager.addDocument('en', 'enterprise licensing', 'company.services');
manager.addDocument('en', 'API deployments', 'company.services');
manager.addDocument('en', 'custom deployments', 'company.services');
manager.addDocument('en', 'Signal AI', 'company.services');
manager.addDocument('en', 'telcos', 'company.services');
manager.addDocument('en', 'fintechs', 'company.services');
manager.addDocument('en', 'banks', 'company.services');
manager.addDocument('en', 'services', 'company.services');

// Add comprehensive answers with deck information
manager.addAnswer('en', 'business.model', 'Our business model is a scalable B2B model that generates revenue through a multi-faceted approach: subscription-based services, enterprise licensing for Signal AI to telcos and large institutions, and custom API deployments for fintechs, banks, and secure environments.');

manager.addAnswer('en', 'company.revenue', 'We have generated over $150,000 in revenue through pilot subscriptions and API access, specifically on Core Comm. This demonstrates strong early traction in the market.');

manager.addAnswer('en', 'market.size', 'According to Precedence Research, the AI market is projected to reach $3.68 trillion by 2034, with a 19.20% annual growth rate. This represents a massive opportunity for safe, secure, and privacy-first AI solutions.');

manager.addAnswer('en', 'company.team', 'Our experienced team includes Ibrahim BK as Founder and CEO, Yaqub Ja\'e as Co-Founder and CTO, Ibrahim B Balogun as Head of Security, and Neemah Lawal as Co-Founder and COO. As industry experts, our team offers strategic guidance and support.');

manager.addAnswer('en', 'company.contact', 'You can reach us through our website at https://www.shaintelligence.com, email us at info@shaintelligence.com, or call us at +44 7853 257472.');

manager.addAnswer('en', 'company.pricing', 'Pricing is available upon request. Please contact us for detailed pricing information tailored to your specific needs.');

manager.addAnswer('en', 'company.growth', 'We have achieved impressive growth with a 45.86% month-on-month user growth rate and have successfully onboarded over 100 users so far.');

manager.addAnswer('en', 'company.problem', 'The problem we\'re addressing is that most AI systems today overlook safety, privacy, and human alignment, putting people and organizations at significant risk. Trust is missing in AI, and we need AI that keeps us safe.');

manager.addAnswer('en', 'company.solution', 'We build decentralized AI systems that are safe, secure, and privacy-first by design. Our solution puts people in control and aligns intelligence with human values, ensuring AI serves people rather than exploiting them.');

manager.addAnswer('en', 'company.about', 'Sha Intelligence builds the next generation of intelligence: safe, secure, and privacy-first AI systems by design. We create AI that amplifies your intelligence while maintaining trust, safety, and purpose.');

// NEW ANSWERS FROM DECK
manager.addAnswer('en', 'company.purpose', 'Our mission is to build AI systems that are safe, secure, and privacy-first, designed to serve people, not exploit them. We build safe, secure, and privacy-first AI systems by design.');

manager.addAnswer('en', 'company.vision', 'Our vision is to shape a future where AI empowers humanity with trust, safety, and purpose. We envision a world where AI amplifies human intelligence while maintaining ethical standards.');

manager.addAnswer('en', 'company.timing', 'Now is the critical time to build trustworthy AI. AI is growing fast, but trust is missing. We need AI that keeps us safe, respects our privacy, and puts us in control. We must build it now, before it\'s too late.');

manager.addAnswer('en', 'company.services', 'We offer three main service categories: subscription-based models, enterprise licensing of Signal AI for telecommunications companies and large institutions, and custom API deployments for fintech companies, banks, and secure environments.');

// Train and save the model
await manager.train();
manager.save();

// Create a wrapper to match existing API
const qna = {
  async getBestAnswer(language, question) {
    try {
      const response = await manager.process(language, question);
      if (response.answer && response.score > 0.5) {
        return { answer: response.answer, score: response.score };
      }
      return null;
    } catch (error) {
      console.error('Error processing NLP query:', error);
      return null;
    }
  }
};

export default qna;