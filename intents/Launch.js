//
// Launch the skill
//

'use strict';

const utils = require('../utils');

module.exports = {
  handleIntent: function() {
    const speechText = 'Welcome to Math Flash cards. You can either practice or take a test ... Now, what can I help you with?';
    const repromptText = 'For instructions on what you can say, please say help me.';

    // I don't care if this succeeds or not
    utils.emitResponse(this.emit, null, null, speechText, repromptText);
  },
};
