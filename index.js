/*
 * MIT License

 * Copyright (c) 2016 Garrett Vargas

 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the 'Software'), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:

 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.

 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

'use strict';

const AWS = require('aws-sdk');
const Alexa = require('alexa-sdk');

const APP_ID = 'amzn1.ask.skill.8a9b50de-2dce-49d0-88b1-bed45e7f10b0';
const NUMBER_OF_QUESTIONS = 5;

const handlers = {
  'NewSession': function() {
    if (this.event.request.type === 'IntentRequest') {
      this.emit(this.event.request.intent.name);
    } else {
      this.emit('LaunchRequest');
    }
  },
  'LaunchRequest': function() {
    const speechText = 'Welcome to Math Flash cards. You can either practice or take a test ... Now, what can I help you with?';
    const repromptText = 'For instructions on what you can say, please say help me.';

    // I don't care if this succeeds or not
    emitResponse(this.emit, null, null, speechText, repromptText);
  },
  'SessionEndedRequest': function() {
    emitResponse(this.emit, null, 'Goodbye');
  },
  // Practice Intent
  'PracticeIntent': function() {
    handleTestIntent(this.emit, this.event.request.intent, this.event.session,
          this.attributes, false);
  },
  // Test Intent
  'TestIntent': function() {
    handleTestIntent(this.emit, this.event.request.intent, this.event.session,
          this.attributes, true);
  },
  // Answer intent
  'AnswerIntent': function() {
    // Get the answer and compare to the question asked
    const answerSlot = this.event.request.intent.slots.Answer;

    if (!answerSlot || !answerSlot.value) {
      emitResponse(this.emit, 'I\'m sorry, I didn\'t understand your answer. Please try again.');
    } else {
      // Compare the correct answer
      let speechResponse = '';

      // Let's make sure they are in a practice round or test
      if (((this.attributes.mode !== 'practice') && (this.attributes.mode !== 'test')) ||
        (this.attributes.questions.length == 0) ||
        ((this.attributes.lastQuestion === -1) ||
        (this.attributes.lastQuestion >= this.attributes.questions.length))) {
        // No, this is not valid
        emitResponse(this.emit, 'Please say Practice to start a practice round or Test to start a test.');
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
      this.attributes.lastQuestion = GetNextQuestion(this.attributes.questions, this.attributes.lastQuestion, (this.attributes.mode == 'practice'));
      if (this.attributes.lastQuestion != -1) {
        // OK, let's ask this one
        speechResponse += ' Next question ... ' + this.attributes.questions[this.attributes.lastQuestion].question;
        emitResponse(this.emit, null, null, speechResponse,
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

        emitResponse(this.emit, null, speechResponse, null, null);
      }
    }
  },
  // Stop intent
  'AMAZON.StopIntent': function() {
    emitResponse(this.emit, null, 'Goodbye');
  },
  // Cancel intent - for now we are session-less so does the same as goodbye
  'AMAZON.CancelIntent': function() {
    emitResponse(this.emit, null, 'Goodbye');
  },
  // Help intent - provide help
  'AMAZON.HelpIntent': function() {
    const speechText = 'You can start a Practice round by saying Start Practice, or you can take a test by saying Start Test, or you can say List Quizzes to hear the available quizzes ... Now, what can I help you with?';
    const repromptText = 'You can say Start Practice, Start Test, or List Quizzes ... Now, what can I help you with?';
    emitResponse(this.emit, null, null, speechText, repromptText);
  },
  'Unhandled': function() {
    emitResponse(this.emit, null, null, 'Sorry, I didn\'t get that. Try saying help.', 'Try saying help.');
  },
};

function emitResponse(emit, error, response, speech, reprompt, cardTitle, cardText) {
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
}

function listQuizzes() {
  // List all quiz types from the flashcards folder
  return 'Add, Subtract, Times, or Divide';
}

function pickQuestions(category, numberOfQuestions) {
  const categoryMapping = {
      'plus': 'plus', 'add': 'plus', 'addition': 'plus', 'sum': 'plus',
      'minus': 'minus', 'subtract': 'minus', 'subtraction': 'minus',
      'times': 'times', 'multiply': 'times', 'multiplication': 'times',
      'divide': 'divide', 'divides': 'divide', 'division': 'divide'};
  const questions = [];
  let allQuestions;
  const picked = [];
  let i;
  let j;
  let questionsToPick = numberOfQuestions;

  // Find the right JSON array
  try {
    allQuestions = require('./flashcards/' + categoryMapping[category]);
  } catch(error) {
    // File not found
    console.log('Couldn\'t load cateogry ' + category);
    return null;
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

  return questions;
}

function GetNextQuestion(questions, lastQuestion, practiceRound) {
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

function handleTestIntent(emit, intent, session, attributes, test) {
  // The user is starting a practice round
  // they need to specify a category that they would like to play
  const categorySlot = intent.slots.Category;
  let error;

  if (!categorySlot || !categorySlot.value) {
    error = 'I\'m sorry, I didn\'t catch the quiz you would like to practice.  You can say ' + listQuizzes();
    emitResponse(emit, error);
  } else {
    // OK, let's pick out random questions and start the quiz!
    // Since we have to store a timer, we will save the current time in the session
    let numberOfQuestions;

    if (intent.slots.NumQuestion && intent.slots.NumQuestion.value) {
      numberOfQuestions = parseInt(intent.slots.NumQuestion.value);
      if (isNaN(numberOfQuestions)) {
        // Default value
        numberOfQuestions = NUMBER_OF_QUESTIONS;
      }
    } else {
      numberOfQuestions = NUMBER_OF_QUESTIONS;
    }

    const questions = pickQuestions(categorySlot.value, numberOfQuestions);
    if (!questions) {
      emitResponse(emit, 'I had trouble starting a quiz for ' + categorySlot.value);
    } else {
      // Add these to the attributes
      attributes.questions = questions;
      attributes.lastQuestion = 0;
      attributes.mode = ((test) ? 'test' : 'practice');
      attributes.startTime = Date.now();

      // We have the questions, now ask the first one (and mark that we've asked it)
      emitResponse(emit, null, null, questions[0].question, questions[0].question);
    }
  }
}

exports.handler = function(event, context) {
  AWS.config.update({region: 'us-east-1'});
  const alexa = Alexa.handler(event, context);

  alexa.appId = APP_ID;
  alexa.dynamoDBTableName = 'FlashCardsUserData';
  alexa.registerHandlers(handlers);
  alexa.execute();
};
