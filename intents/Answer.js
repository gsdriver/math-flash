//
// Processes an answer from the user
//

'use strict';

const utils = require('../utils');

module.exports = {
  handleIntent: function() {
    // Get the answer and compare to the question asked
    const answerSlot = this.event.request.intent.slots.Answer;
    const player = this.attributes[this.attributes.lastPlayer];

    if (!answerSlot || !answerSlot.value) {
      utils.emitResponse(this.emit, this.t('ANSWER_NOANSWER'));
    } else {
      // Compare the correct answer
      let speechResponse = '';

      // Let's make sure they are in a practice round or test
      if (((player.mode !== 'practice') && (player.mode !== 'test')) ||
        (player.questions.length == 0) ||
        ((player.lastQuestion === -1) ||
        (player.lastQuestion >= player.questions.length))) {
        // No, this is not valid
        utils.emitResponse(this.emit, this.t('ANSWER_INVALID_MODE'));
        return;
      }

      const correctAnswers = player.questions[player.lastQuestion].answers;
      let correct = false;

      correctAnswers.forEach((answer) => {
        if (answer == answerSlot.value) {
          correct = true;
        }
      });

      // Did we get it?
      if (!correct) {
        speechResponse += this.t('ANSWER_WRONG_ANSWER').replace('{0}', answerSlot.value).replace('{1}', correctAnswers[0]);
        player.questions[player.lastQuestion].status = 'wrong';
      } else {
        speechResponse += this.t('ANSWER_RIGHT_ANSWER');
        player.questions[player.lastQuestion].status = 'right';
      }

      // Get the next question - we may have to loop back through the list
      player.lastQuestion = getNextQuestion(player.questions, player.lastQuestion, (player.mode == 'practice'));
      if (player.lastQuestion != -1) {
        // OK, let's ask this one
        speechResponse += this.t('ANSWER_NEXT_QUESTION').replace('{0}', player.questions[player.lastQuestion].question);
        utils.emitResponse(this.emit, null, null, speechResponse,
                player.questions[player.lastQuestion].question);
      } else {
        // They are done - the messaging differs between practice and test
        if (player.mode == 'practice') {
          const completeTime = Math.floor((Date.now() - player.startTime) / 1000);
          const timeFormat = (completeTime > 60) ? this.t('ANSWER_COMPLETED_MINUTES') : this.t('ANSWER_COMPLETED_NO_MINUTES');

          speechResponse += timeFormat.replace('{0}', completeTime % 60).replace('{1}', completeTime / 60);
        } else {
          let numCorrect = 0;

          player.questions.forEach((question) => {
            if (question.status == 'right') {
              numCorrect++;
            }
          });

          // Tell them how many they got correct - time doesn't matter
          speechResponse += this.t('ANSWER_COMPLETED_TEST').replace('{0}', numCorrect).replace('{1}', player.questions.length);
        }

        utils.emitResponse(this.emit, null, speechResponse, null, null);
      }
    }
  },
};

function getNextQuestion(questions, lastQuestion, practiceRound) {
  let nextQuestion;

  if (practiceRound) {
    // OK, find the next question that isn't answered 'right'
    // We may need to loop through the list - if all questions have been
    // marked as 'right' then we return -1
    nextQuestion = -1;
    for (let i = 1; i <= questions.length; i++) {
    if (questions[(lastQuestion + i) % questions.length].status != 'right') {
      // Use this one
      nextQuestion = (lastQuestion + i) % questions.length;
      break;
    }
    }
  } else {
    // In a test, it's linear - go to the next question and once you have
    // gone through the full list, we're done
    nextQuestion = lastQuestion + 1;
    if (nextQuestion >= questions.length) {
      // No, this won't work
      nextQuestion = -1;
    }
  }

  return nextQuestion;
}
