// Localized resources

const resources = {
  'en-US': {
    'translation': {
      // From index.js
      'UNHANDLED_INTENT': 'Sorry, I didn\'t get that. Try saying help.',
      'UNHANDLED_INTENT_REPROMPT': 'Try saying help.',
      'SAYNAME_UNHANDLED_INTENT': 'Sorry, I didn\'t get that. Try saying your name.',
      'SAYNAME_UNHANDLED_INTENT_REPROMPT': 'Try saying your name.',
      'LEVEL_UNHANDLED_INTENT': 'Sorry, I didn\'t get that. Try saying your the level you want to play.',
      'LEVEL_UNHANDLED_INTENT_REPROMPT': 'Try saying the level you want to play.',
      // From Launch.js
      'LAUNCH_WELCOMEBACK': 'Welcome back {0}, would you like to practice {1}? Or say Change Player if you are not {2}. ',
      'LAUNCH_WELCOMEBACK_REPROMPT': 'For instructions on what you can say, please say help me.',
      'LAUNCH_NEWPLAYER': 'Welcome to Private Tutor. What is your name?',
      'LAUNCH_NEWPALYER_REPROMPT': 'What is your name?',
      'LAUNCH_ERROR': 'There was an error launching Private Tutor. Please try again later.',
      // From Name.js
      'NAME_NONAME': 'Sorry, I didn\'t catch your name. Please try saying your name again.',
      'NAME_WELCOME': 'I heard the name {0}. Is this correct?',
      'NAME_WELCOME_REPROMPT': 'Say yes or no.',
      // From Confirm.js
      'CONFIRM_WELCOME': 'Welcome {0}, would you like to practice {1}?',
      'CONFIRM_WELCOME_REPROMPT': 'For instructions on what you can say, please say help me.',
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
      // From Test.js
      'TEST_UNKNOWN_QUIZ': 'I\'m sorry, I didn\'t catch the quiz you would like to practice.  You can say {0}',
      'TEST_CANT_START_QUIZ': 'I had trouble starting a quiz for {0}',
      'TEST_QUESTION_REPROMPT': 'Say more time if you need more time to answer',
      'TEST_LEVEL': 'level {0} <break time=\'200ms\'/> {1}',
      'TEST_LEVEL_SELECT': 'Would you like to play {0}?',
      // From Level.js
      'LEVEL_ERROR': 'Sorry, there was a problem reading questions.',
      'LEVEL_NO_LEVEL': 'Sorry, I didn\'t hear a level. {0}',
      'LEVEL_INVALID_LEVEL': 'Sorry, {0} is an invalid level. {1}',
      'LEVEL_START_TEST': 'Great, this level has {0} questions. First question <break time=\'200ms\'/> {1}',
      // From More.js
      'MORE_QUESTION': 'OK. {0}',
      // From Change.js
      'CHANGE_SAYNANE': 'What is your name?',
      'CHANGE_SAYNANE_REPROMPT': 'What is your name?',
      // From utils.js
      'SPEECH_ERROR': 'What else can I help with?',
    },
  },
};

module.exports = {
  languageStrings: resources,
};
