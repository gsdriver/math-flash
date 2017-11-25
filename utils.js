// Utility functions

'use strict';

const AWS = require('aws-sdk');
const s3 = new AWS.S3({apiVersion: '2006-03-01'});

module.exports = {
  emitResponse: function(emit, error, response, speech, reprompt, cardTitle, cardText) {
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
