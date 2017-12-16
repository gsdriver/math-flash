//
// Give them more time to answer
//

'use strict';

const utils = require('../utils');

module.exports = {
  handleIntent: function() {
    // Repeat the question for them
    const player = this.attributes[this.attributes.lastPlayer];
    const speechResponse = this.t('MORE_QUESTION').replace('{0}', player.questions[player.lastQuestion].question);

    utils.emitResponse.call(this, speechResponse, this.t('TEST_QUESTION_REPROMPT'));
  },
};
