import { Qna } from 'node-nlp';

const qna = new Qna();

qna.add('en', 'What is your business model?', 'Our business model is a scalable B2B model that generates revenue through a multi-faceted approach, including a subscription-based model, enterprise licensing, and custom API deployments.', ['business model']);

qna.add('en', 'What is your revenue?', 'So far, we have generated over $150,000 in revenue from pilot subscriptions and API access, specifically on Core Comm.', ['revenue', 'traction', 'sales']);

qna.add('en', 'What is the market size for AI?', 'According to Precedence Research, the market size for AI is projected to reach $3.68 trillion by 2034.', ['market size', 'market']);

qna.add('en', 'Who is on your team?', "Our team includes Ibrahim BK as Founder and CEO, Ibrahim B Balogun as Head of Security, Yaqub Ja'e as Co-Founder and CTO, and Neemah Lawal as Co-Founder and COO.", ['team', 'founders']);

qna.add('en', 'How can I contact you?', 'You can find more information on our website at shaintelligence.com, email us at info@shaintelligence.com, or call us at +44 7853 257472.', ['contact', 'email', 'phone', 'website']);

qna.add('en', 'What is your pricing?', 'Pricing is available upon request.', ['pricing', 'cost', 'price']);

qna.add('en', 'How is your user growth?', 'We have a user growth rate of 45.86% and have onboarded over 100 users so far.', ['user growth', 'growth']);

qna.add('en', 'What is the problem you are solving?', 'The problem is that most AI systems today overlook safety, privacy, and human alignment, which puts people and organizations at risk.', ['problem']);

qna.add('en', 'What is the solution?', 'The solution is to build decentralized AI systems that are safe, secure, and privacy-first. This puts people in control and aligns intelligence with human values.', ['solution']);

qna.add('en', 'What is Sha Intelligence?', 'Sha Intelligence builds safe, secure, and privacy-first AI systems by design to serve people, not exploit them.', ['about', 'sha intelligence']);

export default qna;