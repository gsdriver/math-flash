//
// Provides help
//

'use strict';

const utils = require('../utils');
const speechUtils = require('alexa-speech-utils')();

module.exports = {
  handlePracticeIntent: function() {
    startTest.call(this, false);
  },
  handleTestIntent: function() {
    startTest.call(this, true);
  },
};

const startTest = function(test) {
  // The user is starting a practice round
  // they need to specify a category that they would like to play
  const player = this.attributes[this.attributes.lastPlayer];
  const intent = this.event.request.intent;
  const categorySlot = intent.slots.Category;
  let error;

  if (!categorySlot || !categorySlot.value) {
    error = this.t('TEST_UNKNOWN_QUIZ').replace('{0}', listQuizzes(this.attributes));
    utils.emitResponse.call(this, error);
  } else {
    // OK, let's pick out random questions and start the quiz!
    // Since we have to store a timer, we will save the current time in the session
    let numberOfQuestions;

    if (intent.slots.NumQuestion && intent.slots.NumQuestion.value) {
      numberOfQuestions = parseInt(intent.slots.NumQuestion.value);
      if (isNaN(numberOfQuestions)) {
        numberOfQuestions = undefined;
      }
    }

    pickQuestions.call(this, categorySlot.value, numberOfQuestions, (err, questions) => {
      if (!questions) {
        utils.emitResponse.call(this, this.t('TEST_CANT_START_QUIZ').replace('{0}', categorySlot.value));
      } else {
        // Add these to the attributes
        player.questions = questions;
        player.lastQuestion = 0;
        player.mode = ((test) ? 'test' : 'practice');
        player.startTime = Date.now();

        // We have the questions, now ask the first one (and mark that we've asked it)
        utils.emitResponse.call(this, questions[0].question, questions[0].question);
      }
    });
  }
};

const pickQuestions = function(category, numberOfQuestions, callback) {
  const questions = [];
  const picked = [];
  let i;
  let j;
  let questionsToPick = numberOfQuestions;
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
        if (questionsToPick === undefined) {
          questionsToPick = allQuestions.questions;
        }
        if (questionsToPick > allQuestions.cards.length) {
          questionsToPick = allQuestions.cards.length;
        }

        // Picked will store each index, and as we pick one, we'll remove it
        for (i = 0; i < allQuestions.cards.length; i++) {
          picked.push(i);
        }

        for (i = 0; i < questionsToPick; i++) {
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

function listQuizzes(attributes) {
  // Read all available categories
  let category;
  const catList = [];

  for (category in attributes.categories) {
    if (category) {
      catList.push(category);
    }
  }

  return speechUtils.or(catList);
}
