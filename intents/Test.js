//
// Provides help
//

'use strict';

const utils = require('../utils');

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
      // OK, let's pick out random questions and start the quiz!
      // Since we have to store a timer, we will save the current time in the session
      pickQuestions.call(this, categorySlot.value, (err, questions) => {
        if (!questions) {
          utils.emitResponse.call(this, this.t('TEST_CANT_START_QUIZ').replace('{0}', categorySlot.value));
        } else {
          // Add these to the attributes
          player.questions = questions;
          player.lastQuestion = 0;
          player.mode = 'practice';
          player.startTime = Date.now();

          // We have the questions, now ask the first one (and mark that we've asked it)
          utils.emitResponse.call(this, questions[0].question, this.t('TEST_QUESTION_REPROMPT'));
        }
      });
    }
  },
};

const pickQuestions = function(category, callback) {
  const questions = [];
  const picked = [];
  let i;
  let j;
  let matchedCategory;
  let item;

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
        callback(err, null);
      } else {
        // Picked will store each index, and as we pick one, we'll remove it
        for (i = 0; i < allQuestions.cards.length; i++) {
          picked.push(i);
        }

        for (i = 0; i < allQuestions.questions; i++) {
          const oneQuestion = {};
          j = Math.floor(Math.random() * picked.length);

          oneQuestion.question = allQuestions.cards[picked[j]].question;
          oneQuestion.answers = allQuestions.cards[picked[j]].answers;
          questions.push(oneQuestion);

          // We picked this index, so remove it
          picked.splice(j, 1);
        }
        callback(null, questions);
      }
    });
  } else {
    console.log('Couldn\'t load cateogry ' + category);
    process.nextTick(() => {
      callback('Couldn\'t load category ' + category, null);
    });
  }
};

