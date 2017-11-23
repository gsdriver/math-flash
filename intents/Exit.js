//
// Exit the skill
//

'use strict';

const utils = require('../utils');

module.exports = {
  handleIntent: function() {
    utils.emitResponse(this.emit, null, 'Goodbye');
  },
};
