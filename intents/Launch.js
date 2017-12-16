//
// Launch the skill
//

'use strict';

const utils = require('../utils');

module.exports = {
  handleIntent: function() {
    let speech;
    let reprompt;

    // Read available categories
    utils.readCategories((err, categories) => {
      if (err) {
        // Oops - something went wrong
        utils.emitResponse.call(this, this.t('LAUNCH_ERROR'));
      } else {
        this.attributes.categories = categories;

        // Do we have a current player?  If so, welcome them back with an option
        // to switch to another player. Otherwise, ask for their name
        if (this.attributes.lastPlayer) {
          // Welcome back!
          speech = this.t('LAUNCH_WELCOMEBACK')
            .replace('{0}', this.attributes.lastPlayer)
            .replace('{1}', utils.listQuizzes(this.attributes))
            .replace('{2}', this.attributes.lastPlayer);
          reprompt = this.t('LAUNCH_WELCOMEBACK_REPROMPT');
          this.handler.state = '';
          delete this.attributes.STATE;
        } else {
          speech = this.t('LAUNCH_NEWPLAYER');
          reprompt = this.t('LAUNCH_NEWPLAYER_REPROMPT');
          this.handler.state = 'SAYNAME';
        }

        utils.emitResponse.call(this, speech, reprompt);
      }
    });
  },
};
