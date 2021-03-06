// Entry point for our skill

'use strict';

const AWS = require('aws-sdk');
const Alexa = require('alexa-sdk');
const Launch = require('./intents/Launch');
const Test = require('./intents/Test');
const Answer = require('./intents/Answer');
const Help = require('./intents/Help');
const Exit = require('./intents/Exit');
const Name = require('./intents/Name');
const Change = require('./intents/Change');
const More = require('./intents/More');
const Confirm = require('./intents/Confirm');
const Level = require('./intents/Level');
const utils = require('./utils');
const resources = require('./resources');

const APP_ID = 'amzn1.ask.skill.8a9b50de-2dce-49d0-88b1-bed45e7f10b0';

const confirmNameHandlers = Alexa.CreateStateHandler('CONFIRMNAME', {
  'NewSession': function() {
    this.handler.state = '';
    delete this.attributes.STATE;
    this.emitWithState('NewSession');
  },
  'AMAZON.YesIntent': Confirm.handleYesIntent,
  'AMAZON.NoIntent': Confirm.handleNoIntent,
  'AMAZON.HelpIntent': Help.handleIntent,
  'AMAZON.StopIntent': Exit.handleIntent,
  'AMAZON.CancelIntent': Exit.handleIntent,
  'SessionEndedRequest': function() {
    utils.emitResponse.call(this, this.t('EXIT_GOODBYE'));
  },
  'Unhandled': function() {
    utils.emitResponse.call(this, this.t('SAYNAME_UNHANDLED_INTENT'), this.t('SAYNAME_UNHANDLED_INTENT_REPROMPT'));
  },
});

const sayNameHandlers = Alexa.CreateStateHandler('SAYNAME', {
  'NewSession': function() {
    this.handler.state = '';
    delete this.attributes.STATE;
    this.emitWithState('NewSession');
  },
  'NameIntent': Name.handleIntent,
  'AMAZON.HelpIntent': Help.handleIntent,
  'AMAZON.StopIntent': Exit.handleIntent,
  'AMAZON.CancelIntent': Exit.handleIntent,
  'SessionEndedRequest': function() {
    utils.emitResponse.call(this, this.t('EXIT_GOODBYE'));
  },
  'Unhandled': function() {
    utils.emitResponse.call(this, this.t('SAYNAME_UNHANDLED_INTENT'), this.t('SAYNAME_UNHANDLED_INTENT_REPROMPT'));
  },
});

const levelHandlers = Alexa.CreateStateHandler('PICKLEVEL', {
  'NewSession': function() {
    this.handler.state = '';
    delete this.attributes.STATE;
    this.emitWithState('NewSession');
  },
  'LevelIntent': Level.handleIntent,
  'AnswerIntent': Level.handleIntent,
  'AMAZON.HelpIntent': Help.handleIntent,
  'AMAZON.StopIntent': Exit.handleIntent,
  'AMAZON.CancelIntent': Exit.handleIntent,
  'SessionEndedRequest': function() {
    utils.emitResponse.call(this, this.t('EXIT_GOODBYE'));
  },
  'Unhandled': function() {
    utils.emitResponse.call(this, this.t('LEVEL_UNHANDLED_INTENT'), this.t('LEVEL_UNHANDLED_INTENT_REPROMPT'));
  },
});

const handlers = {
  'NewSession': function() {
    if (this.event.request.type === 'IntentRequest') {
      this.emit(this.event.request.intent.name);
    } else {
      this.emit('LaunchRequest');
    }
  },
  'LaunchRequest': Launch.handleIntent,
  'PracticeIntent': Test.handleIntent,
  'AnswerIntent': Answer.handleIntent,
  'MoreTimeIntent': More.handleIntent,
  'ChangePlayerIntent': Change.handleIntent,
  'AMAZON.StopIntent': Exit.handleIntent,
  'AMAZON.CancelIntent': Exit.handleIntent,
  'AMAZON.HelpIntent': Help.handleIntent,
  'SessionEndedRequest': function() {
    utils.emitResponse.call(this, this.t('EXIT_GOODBYE'));
  },
  'Unhandled': function() {
    utils.emitResponse.call(this, this.t('UNHANDLED_INTENT'), this.t('UNHANDLED_INTENT_REPROMPT'));
  },
};

exports.handler = function(event, context) {
  AWS.config.update({region: 'us-east-1'});
  const alexa = Alexa.handler(event, context);

  alexa.appId = APP_ID;
  alexa.dynamoDBTableName = 'FlashCardsUserData';
  alexa.resources = resources.languageStrings;
  alexa.registerHandlers(handlers, sayNameHandlers, levelHandlers, confirmNameHandlers);
  alexa.execute();
};
