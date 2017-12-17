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
    const levelSlot = (intent.slots.Level ? intent.slots.Level : intent.slots.Answer);
    let error;

    if (!levelSlot || !levelSlot.value) {
      error = this.t('LEVEL_NO_LEVEL').replace('{0}', player.levelPrompt);
      utils.emitResponse.call(this, error);
    } else {
      // OK, let's pick out random questions and start the quiz!
      // Since we have to store a timer, we will save the current time in the session
      pickQuestions.call(this, player.currentCategory, levelSlot.value, (err, questions) => {
        if (err) {
          utils.emitResponse.call(this, err);
        } else {
          // Add these to the attributes
          player.questions = questions;
          player.lastQuestion = 0;
          player.mode = 'practice';
          player.startTime = Date.now();

          // We have the questions, now ask the first one (and mark that we've asked it)
          this.handler.state = '';
          delete this.attributes.STATE;
          utils.emitResponse.call(this,
                this.t('LEVEL_START_TEST')
                  .replace('{0}', questions.length)
                  .replace('{1}', questions[0].question),
                this.t('TEST_QUESTION_REPROMPT'));
        }
      });
    }
  },
};

const pickQuestions = function(category, level, callback) {
  const questions = [];
  const picked = [];
  let i;
  let j;
  const player = this.attributes[this.attributes.lastPlayer];

  utils.readQuestions(category, (err, allQuestions) => {
    if (err) {
      callback(this.t('LEVEL_ERROR'));
    } else {
      // Is this level valid?
      if (isNaN(level) || (level > allQuestions.levels.length)) {
        callback(this.t('LEVEL_INVALID_LEVEL')
          .replace('{0}', level)
          .replace('{1}', player.levelPrompt));
      } else {
        // Picked will store each index, and as we pick one, we'll remove it
        const cards = allQuestions.levels[level - 1].cards;
        for (i = 0; i < cards.length; i++) {
          picked.push(i);
        }

        for (i = 0; i < allQuestions.levels[level - 1].questions; i++) {
          const oneQuestion = {};
          j = Math.floor(Math.random() * picked.length);

          oneQuestion.question = cards[picked[j]].question;
          oneQuestion.answers = cards[picked[j]].answers;
          questions.push(oneQuestion);

          // We picked this index, so remove it
          picked.splice(j, 1);
        }
        callback(null, questions);
      }
    }
  });
};

