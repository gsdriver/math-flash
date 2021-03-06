//
// Handles the user saying their name
//

'use strict';

const utils = require('../utils');

module.exports = {
  handleNoIntent: function() {
    this.handler.state = 'SAYNAME';
    utils.emitResponse.call(this, this.t('CHANGE_SAYNANE'), this.t('CHANGE_SAYNANE_REPROMPT'));
  },
  handleYesIntent: function() {
    // Great, save the name and let's play
    this.attributes.lastPlayer = this.attributes.nameToConfirm;
    this.attributes.nameToConfirm = undefined;
    if (!this.attributes[this.attributes.lastPlayer]) {
      this.attributes[this.attributes.lastPlayer] = {};
    }

    const speech = this.t('CONFIRM_WELCOME')
      .replace('{0}', this.attributes.lastPlayer)
      .replace('{1}', utils.listQuizzes(this.attributes));

    const reprompt = this.t('CONFIRM_WELCOME_REPROMPT');
    this.handler.state = '';
    delete this.attributes.STATE;
    utils.emitResponse.call(this, speech, reprompt);
  },
};
