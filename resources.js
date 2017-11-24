// Localized resources

const resources = {
  'en-US': {
    'translation': {
      // From index.js
      'UNHANDLED_INTENT': 'Sorry, I didn\'t get that. Try saying help.',
      'UNHANDLED_INTENT_REPROMPT': 'Try saying help.',
      'SAYNAME_UNHANDLED_INTENT': 'Sorry, I didn\'t get that. Try saying your name.',
      'SAYNAME_UNHANDLED_INTENT_REPROMPT': 'Try saying your name.',
      // From Launch.js
      'LAUNCH_WELCOMEBACK': 'Welcome back {0}. You can either practice or take a test, or say Change Player if you are not {1} ... Now, what can I help you with?',
      'LAUNCH_WELCOMEBACK_REPROMPT': 'For instructions on what you can say, please say help me.',
      'LAUNCH_NEWPLAYER': 'Welcome to Private Tutor. What is your name?',
      'LAUNCH_NEWPALYER_REPROMPT': 'What is your name?',
      // From Name.js
      'NAME_NONAME': 'Sorry, I didn\'t catch your name. Please try saying your name again.',
      'NAME_WELCOME': 'Welcome {0}. You can either practice or take a test ... Now, what can I help you with?',
      'NAME_WELCOME_REPROMPT': 'For instructions on what you can say, please say help me.',
      // From Exit.js
      'EXIT_GOODBYE': 'Goodbye.',
      // From Answer.js
      'ANSWER_NOANSWER': 'I\'m sorry, I didn\'t understand your answer. Please try again.',
      'ANSWER_INVALID_MODE': 'Please say Practice to start a practice round or Test to start a test.',
      'ANSWER_WRONG_ANSWER': 'Sorry, {0} was incorrect. The correct answer is {1}.',
      'ANSWER_RIGHT_ANSWER': 'That\'s right!',
      'ANSWER_NEXT_QUESTION': ' Next question ... {0}',
      'ANSWER_COMPLETED_MINUTES': ' Congratulations, you are done with the practice round. It took {1} minutes and {0} seconds to complete.',
      'ANSWER_COMPLETED_NO_MINUTES': ' Congratulations, you are done with the practice round. It took {0} seconds to complete.',
      'ANSWER_COMPLETED_TEST': ' You finished the test with {0} correct answers out of {1} questions asked.',
    },
  },
};

module.exports = {
  languageStrings: resources,
};
