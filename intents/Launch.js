//
// Launch the skill
//

'use strict';

const utils = require('../utils');

module.exports = {
  handleIntent: function() {
    let speech;
    let reprompt;

    // Do we have a current player?  If so, welcome them back with an option
    // to switch to another player. Otherwise, ask for their name
    if (this.attributes.lastPlayer) {
      // Welcome back!
      speech = this.t('LAUNCH_WELCOMEBACK').replace('{0}', this.attributes.lastPlayer).replace('{1}', this.attributes.lastPlayer);
      reprompt = this.t('LAUNCH_WELCOMEBACK_REPROMPT');
      this.handler.state = '';
      delete this.attributes.STATE;
    } else {
      speech = this.t('LAUNCH_NEWPLAYER');
      reprompt = this.t('LAUNCH_NEWPLAYER_REPROMPT');
      this.handler.state = 'SAYNAME';
    }

    utils.emitResponse(this.emit, null, null, speech, reprompt);
  },
};
