// Utility functions

'use strict';

module.exports = {
  emitResponse: function(emit, error, response, speech, reprompt, cardTitle, cardText) {
    if (error) {
      console.log('Speech error: ' + error);
      emit(':ask', error, 'What else can I help with?');
    } else if (response) {
      emit(':tell', response);
    } else if (cardTitle) {
      emit(':askWithCard', speech, reprompt, cardTitle, cardText);
    } else {
      emit(':ask', speech, reprompt);
    }
  },
};
