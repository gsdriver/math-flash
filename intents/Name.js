//
// Handles the user saying their name
//

'use strict';

const utils = require('../utils');

module.exports = {
  handleIntent: function() {
    const nameSlot = this.event.request.intent.slots.Name;

    // We need a name
    if (!nameSlot || !nameSlot.value) {
      utils.emitResponse(this.emit, this.t('NAME_NONAME'));
    } else {
      // Great, save the name and let's play
      this.handler.state = '';
      delete this.attributes.STATE;
      this.attributes.lastPlayer = nameSlot.value;
      if (!this.attributes[this.attributes.lastPlayer]) {
        this.attributes[this.attributes.lastPlayer] = {};
      }

      const speech = this.t('NAME_WELCOME').replace('{0}', this.attributes.lastPlayer);
      const reprompt = this.t('NAME_WELCOME_REPROMPT');
      utils.emitResponse(this.emit, null, null, speech, reprompt);
    }
  },
};
