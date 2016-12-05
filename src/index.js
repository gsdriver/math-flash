/*
 * MIT License

 * Copyright (c) 2016 Garrett Vargas

 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:

 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.

 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

'use strict';

var AlexaSkill = require('./AlexaSkill');
var storage = require('./storage');

var APP_ID = undefined; //"amzn1.ask.skill.8fb6e399-d431-4943-a797-7a6888e7c6ce";

var FlashTest = function () {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
FlashTest.prototype = Object.create(AlexaSkill.prototype);
FlashTest.prototype.constructor = FlashTest;

FlashTest.prototype.eventHandlers.onLaunch = function (launchRequest, session, response)
{
    var speechText = "Welcome to Math Flash cards. You can either practice or take a test ... Now, what can I help you with?";
    
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    var repromptText = "For instructions on what you can say, please say help me.";

    // I don't care if this succeeds or not
    response.ask(speechText, repromptText);
};

FlashTest.prototype.intentHandlers = {
    // Practice Intent
    "PracticeIntent": function (intent, session, response) {
        HandleTestIntent(intent, session, response, false);
    },
    // Test Intent
    "TestIntent": function (intent, session, response) {
        HandleTestIntent(intent, session, response, true);
    },
    // Answer intent
    "AnswerIntent": function (intent, session, response) {
        // Get the answer and compare to the question asked
        var answerSlot = intent.slots.Answer;
        var error;

        if (!answerSlot || !answerSlot.value)
        {
            error = "I'm sorry, I didn't understand your answer. Please try again.";
            SendAlexaResponse(error, null, null, null, response);
        }
        else
        {
            // Get the correct answer from storage (or the session) and compare
            var speechResponse = "";

            storage.loadUserData(session, (userData) => {
                // Let's make sure they are in a practice round or test
                if (((userData.mode != "practice") && (userData.mode != "test")) ||
                    (userData.questions.length == 0) ||
                    ((userData.lastQuestion == -1) || (userData.lastQuestion >= userData.questions.length)))
                {
                    // No, this is not valid
                    SendAlexaResponse("Please say Practice to start a practice round or Test to start a test.", null, null, null, response);
                    return;
                }

                var correctAnswers = userData.questions[userData.lastQuestion].answers;
                var correct = false;

                correctAnswers.forEach(answer => {
                    if (answer == intent.slots.Answer.value)
                    {
                        correct = true;
                    }});

                // Did we get it?
                if (!correct)
                {
                    speechResponse += "Sorry, " + intent.slots.Answer.value + " was incorrect. The correct answer is " + correctAnswers[0] + ".";
                    userData.questions[userData.lastQuestion].status = "wrong";
                }
                else
                {
                    speechResponse += "That's right!";
                    userData.questions[userData.lastQuestion].status = "right";
                }

                // Get the next question - we may have to loop back through the list
                userData.lastQuestion = GetNextQuestion(userData.questions, userData.lastQuestion, (userData.mode == "practice"));
                userData.save((err) =>
                {
                    if (userData.lastQuestion != -1)
                    {
                        // OK, let's ask this one
                        speechResponse += " Next question ... " + userData.questions[userData.lastQuestion].question;
                        SendAlexaResponse(null, null, speechResponse, userData.questions[userData.lastQuestion].question, response);
                    }
                    else
                    {
                        // They are done - the messaging differs between practice and test
                        if (userData.mode == "practice")
                        {
                            var completeTime = Math.floor((Date.now() - userData.startTime) / 1000);

                            speechResponse += " Congratulations, you are done with the practice round. It took ";
                            if (completeTime > 60)
                            {
                                speechResponse += (Math.floor(completeTime / 60) + " minutes and ");
                            }
                            speechResponse += ((completeTime % 60) + " seconds to complete.");
                        }
                        else
                        {
                            var numCorrect = 0;

                            userData.questions.forEach((question) => {
                                if (question.status == "right")
                                {
                                    numCorrect++;
                                }
                            });

                            // Tell them how many they got correct - time doesn't matter
                            speechResponse += " You finished the test with ";
                            speechResponse += (numCorrect + " correct answers out of ");
                            speechResponse += (userData.questions.length + " questions asked.");
                        }

                        SendAlexaResponse(null, speechResponse, null, null, response);
                    }
                });
            });
        }
    },
    // Stop intent
    "AMAZON.StopIntent": function (intent, session, response) {
        var speechOutput = "Goodbye";
        response.tell(speechOutput);
    },
    // Cancel intent - for now we are session-less so does the same as goodbye
    "AMAZON.CancelIntent": function (intent, session, response) {
        var speechOutput = "Goodbye";
        response.tell(speechOutput);
    },
    // Help intent - provide help
    "AMAZON.HelpIntent": function (intent, session, response) {
        var speechText = "You can start a Practice round by saying Start Practice, or you can take a test by saying Start Test, or you can say List Quizzes to hear the available quizzes ... Now, what can I help you with?";
        var repromptText = "You can say Start Practice, Start Test, or List Quizzes ... Now, what can I help you with?";
        var speechOutput = {
            speech: speechText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        var repromptOutput = {
            speech: repromptText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        response.ask(speechOutput, repromptOutput);
    }
};

/*
 * Sends a response to Alexa - you would expect one of speechError,
 * speechResponse, or speechQuestion to be set.  repromptQuestion
 * will be set if speechQuestion is set and will be a shorter form
 * of the speechQuestion (just asking what they want to do rather than
 * giving a full game status)
 */
function SendAlexaResponse(speechError, speechResponse, speechQuestion, repromptQuestion, response)
{
    var speechOutput;
    var repromptOutput;
    var cardTitle = "Flash Cards";

    if (speechError)
    {
        speechOutput = {
            speech: speechError,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        repromptOutput = {
            speech: "What else can I help with?",
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        response.ask(speechOutput, repromptOutput);
    }
    else if (speechResponse) {
        speechOutput = {
            speech: speechResponse,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        response.tellWithCard(speechOutput, cardTitle, speechResponse);
    }
    else {
        speechOutput = {
            speech: speechQuestion,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        repromptOutput = {
            speech: repromptQuestion,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        response.askWithCard(speechOutput, repromptOutput, cardTitle, speechQuestion);
    }
}

function ListQuizzes()
{
    // List all quiz types from the flashcards folder
    return "Add, Subtract, Times, or Divide";
}

function PickQuestions(category, numberOfQuestions)
{
    var questions = [];
    var allQuestions;
    var picked = [];
    var i, j;
    var oneQuestion;

    // Find the right JSON array
    try {
        allQuestions = require('../flashcards/' + category);
    } catch(error) {
        // File not found
        console.log("Couldn't load cateogry " + category);
        return null;
    }

    if (numberOfQuestions > allQuestions.cards.length)
    {
        numberOfQuestions = allQuestions.cards.length;
    }

    // Picked will store each index, and as we pick one, we'll remove it
    for (i = 0; i < allQuestions.cards.length; i++)
    {
        picked.push(i);
    }

    for (i = 0; i < numberOfQuestions; i++)
    {
        j = Math.floor(Math.random() * picked.length);

        oneQuestion = new Object();
        oneQuestion.question = allQuestions.cards[picked[j]].question;
        oneQuestion.answers = allQuestions.cards[picked[j]].answers;
        questions.push(oneQuestion);

        // We picked this index, so remove it
        picked.splice(j, 1);
    }

    return questions;
}

function GetNextQuestion(questions, lastQuestion, practiceRound)
{
    var nextQuestion;

    if (practiceRound)
    {
        // OK, find the next question that isn't answered "right"
        // We may need to loop through the list - if all questions have been
        // marked as "right" then we return -1
        nextQuestion = -1;
        for (let i = 1; i <= questions.length; i++)
        {
            if (questions[(lastQuestion + i) % questions.length].status != "right")
            {
                // Use this one
                nextQuestion = (lastQuestion + i) % questions.length;
                break;
            }
        }
    }
    else
    {
        // In a test, it's linear - go to the next question and once you have
        // gone through the full list, we're done
        nextQuestion = lastQuestion + 1;
        if (nextQuestion >= questions.length)
        {
            // No, this won't work
            nextQuestion = -1;
        }
    }

    return nextQuestion;
}

function HandleTestIntent(intent, session, response, test)
{
    // The user is starting a practice round - they need to specify a category that they would like to play
    var categorySlot = intent.slots.Category;
    var error;

    if (!categorySlot || !categorySlot.value)
    {
        error = "I'm sorry, I didn't catch the quiz you would like to practice.  You can say " + ListQuizzes();
        SendAlexaResponse(error, null, null, null, response);
    }
    else
    {
        // OK, let's pick out 20 random questions and start the quiz!
        // Since we have to store a timer, we will save the current time in the session
        storage.loadUserData(session, (userData) => {
            var questions = PickQuestions(categorySlot.value, 3);
            if (!questions)
            {
                SendAlexaResponse("I had trouble starting a quiz for " + categorySlot.value, null, null, null, response);
            }
            else
            {
                // Save the user data - we will start with the first question
                userData.questions = questions;
                userData.lastQuestion = 0;
                userData.mode = ((test) ? "test" : "practice");
                userData.startTime = Date.now();

                userData.save((err) => {
                    // We have the questions, now ask the first one (and mark that we've asked it)
                    SendAlexaResponse(null, null, questions[0].question, questions[0].question, response);
                });
            }
        });
    }
}

exports.handler = function (event, context) 
{
    var flash = new FlashTest();
    flash.execute(event, context);
};
