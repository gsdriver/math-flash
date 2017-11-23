//
// Provides help
//

'use strict';

const utils = require('../utils');

module.exports = {
  handleIntent: function() {
    const speechText = 'You can start a Practice round by saying Start Practice, or you can take a test by saying Start Test, or you can say List Quizzes to hear the available quizzes ... Now, what can I help you with?';
    const repromptText = 'You can say Start Practice, Start Test, or List Quizzes ... Now, what can I help you with?';

    utils.emitResponse(this.emit, null, null, speechText, repromptText);
  },
};
