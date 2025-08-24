multi turn conversation working.


Intent recognition is a core component of NLU. It involves analyzing a user's utterance (the text they say) to determine the user's goal or intent. For example, the phrases "What is the problem Sha Intelligence is solving?" and "Tell me about the problem" both express the intent to learn about the company's problem. A rule-based system, like the old generateSimpleResponse function, relies on exact keywords, which can be brittle and prone to failure with slight variations in user input. An NLU model is trained on a set of example phrases (called utterances) for each intent, allowing it to recognize the intent even when the user speaks a phrase it has never seen before.

NLU Model Choice: NLP.js
    Node.js-based more convinient


nlp-kb.js
    Instead of using if/else statements, a Qna (Question and answer) object is created which will act as the Core Comm deck kb.

    const result = await qna.getBestAnswer('en', lowerTranscript); from the generateSimpleResponse function will use the kb to get answer and return it if confidence level > 0.7.

NEXT STEP:
    Retrieval-Augmented Generation.