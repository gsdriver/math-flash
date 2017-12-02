// Utility functions

'use strict';

const AWS = require('aws-sdk');
const s3 = new AWS.S3({apiVersion: '2006-03-01'});
const VoiceLabs = require('voicelabs')('064de1c0-d712-11a7-161f-02f814b60257');

module.exports = {
  emitResponse: function(speech, reprompt, error, cardTitle, cardText) {
    let name;
    let slots;
    if (this.event.request.type === 'IntentRequest') {
      name = this.event.request.intent.name;
      slots = this.event.request.intent.slots;
    } else {
      name = 'LaunchRequest';
      slots = {};
    }

    VoiceLabs.track(this.event.session, name, slots, null, (vlErr, vlResponse) => {
      if (error) {
        console.log('Speech error: ' + error);
        this.emit(':ask', error, this.t('SPEECH_ERROR'));
      } else if (speech && !reprompt) {
        this.emit(':tell', speech);
      } else if (cardTitle) {
        this.emit(':askWithCard', speech, reprompt, cardTitle, cardText);
      } else {
        this.emit(':ask', speech, reprompt);
      }
    });
  },
  readCategories: function(callback) {
    s3.getObject({Bucket: 'private-tutor-data', Key: 'index.json'}, (err, data) => {
      if (err) {
        console.log(err, err.stack);
        callback(err, null);
      } else {
        const categories = JSON.parse(data.Body.toString('ascii'));

        callback(null, categories);
      }
    });
  },
  readQuestions: function(category, callback) {
    s3.getObject({Bucket: 'private-tutor-data', Key: category + '.json'}, (err, data) => {
      if (err) {
        console.log(err, err.stack);
        callback(err, null);
      } else {
        const questions = JSON.parse(data.Body.toString('ascii'));

        callback(null, questions);
      }
    });
  },
};
