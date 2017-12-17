//
// Provides help
//

'use strict';

const utils = require('../utils');
const speechUtils = require('alexa-speech-utils')();

module.exports = {
  handleIntent: function() {
    // The user is starting a practice round
    // they need to specify a category that they would like to play
    const player = this.attributes[this.attributes.lastPlayer];
    const intent = this.event.request.intent;
    const categorySlot = intent.slots.Category;
    let error;

    if (!categorySlot || !categorySlot.value) {
      error = this.t('TEST_UNKNOWN_QUIZ').replace('{0}', utils.listQuizzes(this.attributes));
      utils.emitResponse.call(this, error);
    } else {
      // Prompt for the level of play
      readLevels.call(this, categorySlot.value, (err, category, speech) => {
        if (err) {
          utils.emitResponse.call(this, this.t('TEST_CANT_START_QUIZ').replace('{0}', categorySlot.value));
        } else {
          this.handler.state = 'PICKLEVEL';
          player.levelPrompt = speech;
          player.currentCategory = category;
          utils.emitResponse.call(this, speech, this.t('TEST_QUESTION_REPROMPT'));
        }
      });
    }
  },
};

const readLevels = function(category, callback) {
  let matchedCategory;
  let item;
  const levels = [];

  // First let's go thru and find which one this is
  for (item in this.attributes.categories) {
    if (item) {
      if (this.attributes.categories[item].indexOf(category) > -1) {
        matchedCategory = item;
        break;
      }
    }
  }

  if (matchedCategory) {
    utils.readQuestions(matchedCategory, (err, allQuestions) => {
      if (err) {
        callback(err, matchedCategory);
      } else {
        // Now, read each level and description
        allQuestions.levels.forEach((level) => {
          levels.push(this.t('TEST_LEVEL')
            .replace('{0}', level.level)
            .replace('{1}', level.description));
        });


        callback(null, matchedCategory, this.t('TEST_LEVEL_SELECT').replace('{0}', speechUtils.or(levels)));
      }
    });
  } else {
    console.log('Couldn\'t load cateogry ' + category);
    process.nextTick(() => {
      callback('Couldn\'t load category ' + category);
    });
  }
};

