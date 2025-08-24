// For stable node-nlp v4
import pkg from 'node-nlp';
const { NlpManager } = pkg;

const manager = new NlpManager({ languages: ['en'], forceNER: true });

// Add training data with more variations for better matching
manager.addDocument('en', 'What is your business model?', 'business.model');
manager.addDocument('en', 'Tell me about your business model', 'business.model');
manager.addDocument('en', 'How do you make money?', 'business.model');
manager.addDocument('en', 'business model', 'business.model');

manager.addDocument('en', 'What is your revenue?', 'company.revenue');
manager.addDocument('en', 'How much revenue do you have?', 'company.revenue');
manager.addDocument('en', 'Tell me about your traction', 'company.revenue');
manager.addDocument('en', 'revenue', 'company.revenue');
manager.addDocument('en', 'traction', 'company.revenue');
manager.addDocument('en', 'sales', 'company.revenue');

manager.addDocument('en', 'What is the market size for AI?', 'market.size');
manager.addDocument('en', 'How big is the AI market?', 'market.size');
manager.addDocument('en', 'market size', 'market.size');
manager.addDocument('en', 'market', 'market.size');

manager.addDocument('en', 'Who is on your team?', 'company.team');
manager.addDocument('en', 'Tell me about your founders', 'company.team');
manager.addDocument('en', 'Who are the team members?', 'company.team');
manager.addDocument('en', 'team', 'company.team');
manager.addDocument('en', 'founders', 'company.team');

manager.addDocument('en', 'How can I contact you?', 'company.contact');
manager.addDocument('en', 'What is your contact information?', 'company.contact');
manager.addDocument('en', 'contact', 'company.contact');
manager.addDocument('en', 'email', 'company.contact');
manager.addDocument('en', 'phone', 'company.contact');
manager.addDocument('en', 'website', 'company.contact');

manager.addDocument('en', 'What is your pricing?', 'company.pricing');
manager.addDocument('en', 'How much does it cost?', 'company.pricing');
manager.addDocument('en', 'pricing', 'company.pricing');
manager.addDocument('en', 'cost', 'company.pricing');
manager.addDocument('en', 'price', 'company.pricing');

manager.addDocument('en', 'How is your user growth?', 'company.growth');
manager.addDocument('en', 'Tell me about your growth', 'company.growth');
manager.addDocument('en', 'user growth', 'company.growth');
manager.addDocument('en', 'growth', 'company.growth');

manager.addDocument('en', 'What is the problem you are solving?', 'company.problem');
manager.addDocument('en', 'What problem do you solve?', 'company.problem');
manager.addDocument('en', 'problem', 'company.problem');

manager.addDocument('en', 'What is the solution?', 'company.solution');
manager.addDocument('en', 'How do you solve this problem?', 'company.solution');
manager.addDocument('en', 'solution', 'company.solution');

manager.addDocument('en', 'What is Sha Intelligence?', 'company.about');
manager.addDocument('en', 'Tell me about Sha Intelligence', 'company.about');
manager.addDocument('en', 'about', 'company.about');
manager.addDocument('en', 'sha intelligence', 'company.about');

// Add answers
manager.addAnswer('en', 'business.model', 'Our business model is a scalable B2B model that generates revenue through a multi-faceted approach, including a subscription-based model, enterprise licensing, and custom API deployments.');
manager.addAnswer('en', 'company.revenue', 'So far, we have generated over $150,000 in revenue from pilot subscriptions and API access, specifically on Core Comm.');
manager.addAnswer('en', 'market.size', 'According to Precedence Research, the market size for AI is projected to reach $3.68 trillion by 2034.');
manager.addAnswer('en', 'company.team', 'Our team includes Ibrahim BK as Founder and CEO, Ibrahim B Balogun as Head of Security, Yaqub Ja\'e as Co-Founder and CTO, and Neemah Lawal as Co-Founder and COO.');
manager.addAnswer('en', 'company.contact', 'You can find more information on our website at shaintelligence.com, email us at info@shaintelligence.com, or call us at +44 7853 257472.');
manager.addAnswer('en', 'company.pricing', 'Pricing is available upon request.');
manager.addAnswer('en', 'company.growth', 'We have a user growth rate of 45.86% and have onboarded over 100 users so far.');
manager.addAnswer('en', 'company.problem', 'The problem is that most AI systems today overlook safety, privacy, and human alignment, which puts people and organizations at risk.');
manager.addAnswer('en', 'company.solution', 'The solution is to build decentralized AI systems that are safe, secure, and privacy-first. This puts people in control and aligns intelligence with human values.');
manager.addAnswer('en', 'company.about', 'Sha Intelligence builds safe, secure, and privacy-first AI systems by design to serve people, not exploit them.');

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