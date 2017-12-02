//
// Handles changing to a different player
//

'use strict';

const utils = require('../utils');

module.exports = {
  handleIntent: function() {
    this.handler.state = 'SAYNAME';
    utils.emitResponse.call(this, this.t('CHANGE_SAYNANE'), this.t('CHANGE_SAYNANE_REPROMPT'));
  },
};
