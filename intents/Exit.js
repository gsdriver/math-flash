//
// Exit the skill
//

'use strict';

const utils = require('../utils');

module.exports = {
  handleIntent: function() {
    utils.emitResponse.call(this, this.t('EXIT_GOODBYE'));
  },
};
