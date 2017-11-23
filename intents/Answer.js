//
// Processes an answer from the user
//

'use strict';

const utils = require('../utils');

module.exports = {
  handleIntent: function() {
    // Get the answer and compare to the question asked
    const answerSlot = this.event.request.intent.slots.Answer;

    if (!answerSlot || !answerSlot.value) {
      utils.emitResponse(this.emit, 'I\'m sorry, I didn\'t understand your answer. Please try again.');
    } else {
      // Compare the correct answer
      let speechResponse = '';

      // Let's make sure they are in a practice round or test
      if (((this.attributes.mode !== 'practice') && (this.attributes.mode !== 'test')) ||
        (this.attributes.questions.length == 0) ||
        ((this.attributes.lastQuestion === -1) ||
        (this.attributes.lastQuestion >= this.attributes.questions.length))) {
        // No, this is not valid
        utils.emitResponse(this.emit, 'Please say Practice to start a practice round or Test to start a test.');
        return;
      }

      const correctAnswers = this.attributes.questions[this.attributes.lastQuestion].answers;
      let correct = false;

      correctAnswers.forEach((answer) => {
        if (answer == answerSlot.value) {
          correct = true;
        }
      });

      // Did we get it?
      if (!correct) {
        speechResponse += 'Sorry, ' + answerSlot.value + ' was incorrect. The correct answer is ' + correctAnswers[0] + '.';
        this.attributes.questions[this.attributes.lastQuestion].status = 'wrong';
      } else {
        speechResponse += 'That\'s right!';
        this.attributes.questions[this.attributes.lastQuestion].status = 'right';
      }

      // Get the next question - we may have to loop back through the list
      this.attributes.lastQuestion = getNextQuestion(this.attributes.questions, this.attributes.lastQuestion, (this.attributes.mode == 'practice'));
      if (this.attributes.lastQuestion != -1) {
        // OK, let's ask this one
        speechResponse += ' Next question ... ' + this.attributes.questions[this.attributes.lastQuestion].question;
        utils.emitResponse(this.emit, null, null, speechResponse,
                this.attributes.questions[this.attributes.lastQuestion].question);
      } else {
        // They are done - the messaging differs between practice and test
        if (this.attributes.mode == 'practice') {
          const completeTime = Math.floor((Date.now() - this.attributes.startTime) / 1000);

          speechResponse += ' Congratulations, you are done with the practice round. It took ';
          if (completeTime > 60) {
            speechResponse += (Math.floor(completeTime / 60) + ' minutes and ');
          }
          speechResponse += ((completeTime % 60) + ' seconds to complete.');
        } else {
          let numCorrect = 0;

          this.attributes.questions.forEach((question) => {
            if (question.status == 'right') {
              numCorrect++;
            }
          });

          // Tell them how many they got correct - time doesn't matter
          speechResponse += ' You finished the test with ';
          speechResponse += (numCorrect + ' correct answers out of ');
          speechResponse += (this.attributes.questions.length + ' questions asked.');
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
