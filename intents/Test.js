//
// Provides help
//

'use strict';

const utils = require('../utils');

const NUMBER_OF_QUESTIONS = 5;

module.exports = {
  handlePracticeIntent: function() {
    startTest(this.emit, this.event.request.intent, this.event.session,
             this.attributes, false);
  },
  handleTestIntent: function() {
    startTest(this.emit, this.event.request.intent, this.event.session,
             this.attributes, true);
  },
};

function startTest(emit, intent, session, attributes, test) {
  // The user is starting a practice round
  // they need to specify a category that they would like to play
  const categorySlot = intent.slots.Category;
  let error;

  if (!categorySlot || !categorySlot.value) {
    error = 'I\'m sorry, I didn\'t catch the quiz you would like to practice.  You can say ' + listQuizzes();
    utils.emitResponse(emit, error);
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
      utils.emitResponse(emit, 'I had trouble starting a quiz for ' + categorySlot.value);
    } else {
      // Add these to the attributes
      attributes.questions = questions;
      attributes.lastQuestion = 0;
      attributes.mode = ((test) ? 'test' : 'practice');
      attributes.startTime = Date.now();

      // We have the questions, now ask the first one (and mark that we've asked it)
      utils.emitResponse(emit, null, null, questions[0].question, questions[0].question);
    }
  }
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
    allQuestions = require('../flashcards/' + categoryMapping[category]);
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

function listQuizzes() {
  // List all quiz types from the flashcards folder
  return 'Add, Subtract, Times, or Divide';
}
