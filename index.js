// Entry point for our skill

'use strict';

const AWS = require('aws-sdk');
const Alexa = require('alexa-sdk');
const Launch = require('./intents/Launch');
const Test = require('./intents/Test');
const Answer = require('./intents/Answer');
const Help = require('./intents/Help');
const Exit = require('./intents/Exit');
const utils = require('./utils');

const APP_ID = 'amzn1.ask.skill.8a9b50de-2dce-49d0-88b1-bed45e7f10b0';

const handlers = {
  'NewSession': function() {
    if (this.event.request.type === 'IntentRequest') {
      this.emit(this.event.request.intent.name);
    } else {
      this.emit('LaunchRequest');
    }
  },
  'LaunchRequest': Launch.handleIntent,
  'PracticeIntent': Test.handlePracticeIntent,
  'TestIntent': Test.handleTestIntent,
  'AnswerIntent': Answer.handleIntent,
  'AMAZON.StopIntent': Exit.handleIntent,
  'AMAZON.CancelIntent': Exit.handleIntent,
  'AMAZON.HelpIntent': Help.handleIntent,
  'SessionEndedRequest': function() {
    utils.emitResponse(this.emit, null, 'Goodbye');
  },
  'Unhandled': function() {
    utils.emitResponse(this.emit, null, null, 'Sorry, I didn\'t get that. Try saying help.', 'Try saying help.');
  },
};

exports.handler = function(event, context) {
  AWS.config.update({region: 'us-east-1'});
  const alexa = Alexa.handler(event, context);

  alexa.appId = APP_ID;
  alexa.dynamoDBTableName = 'FlashCardsUserData';
  alexa.registerHandlers(handlers);
  alexa.execute();
};
