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
      utils.emitResponse.call(this, this.t('NAME_NONAME'));
    } else {
      // Confirm that this is their name
      const speech = this.t('NAME_WELCOME').replace('{0}', nameSlot.value);
      const reprompt = this.t('NAME_WELCOME_REPROMPT');
      this.handler.state = 'CONFIRMNAME';
      this.attributes.nameToConfirm = nameSlot.value;
      utils.emitResponse.call(this, speech, reprompt);
    }
  },
};
