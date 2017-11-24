//
// Exit the skill
//

'use strict';

const utils = require('../utils');

module.exports = {
  handleIntent: function() {
    utils.emitResponse(this.emit, null, this.t('EXIT_GOODBYE'));
  },
};
