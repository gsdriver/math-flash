/*
 * Handles DynamoDB storage
 */

'use strict';

var AWS = require("aws-sdk");
var config = require("./config");

// Run locally if told to do so
if (config.runDBLocal) {
    AWS.config.update({
      region: "us-west-2",
      endpoint: "http://localhost:8000"
    });
}

var storage = (function () {
    var dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

    /*
     * The UserData class stores all information about the user's test
     */
    function UserData(session, questions, lastQuestion, mode, startTime, practiceTimes, testScores) {
        // Save values or defaults
        this.questions = (questions) ? questions : [];
        this.lastQuestion = (lastQuestion != null) ? parseInt(lastQuestion) : -1;
        this.practiceTimes = (practiceTimes) ? practiceTimes : [];
        this.mode = (mode) ? mode : "";
        this.startTime = (startTime) ? startTime : null;
        this.testScores= (testScores) ? testScores : [];

        // Save the session information
        this._session = session;
    }

    UserData.prototype = {
        save: function (callback) {
            // Save state in the session object, so we can reference that instead of hitting the DB
            this._session.attributes.userData = this.data;
            dynamodb.putItem({
                TableName: 'MathFlashCardsUserData',
                Item: { UserID: {S: this._session.user.userId },
                        questions: {S: JSON.stringify(this.questions)},
                        lastQuestion: {S: this.lastQuestion.toString()},
                        mode: {S: this.mode},
                        startTime: {S: this.startTime.toString()},
                        practiceTimes: {S: JSON.stringify(this.practiceTimes)},
                        testScores: {S: JSON.stringify(this.testScores)}}
            }, function (err, data) {
                // We only need to pass the error back - no other data to return
                if (err)
                {
                    console.log(err, err.stack);
                }
                if (callback)
                {
                    callback(err);
                }
            });
        }
    };

    return {
        loadUserData: function (session, callback) {
            if (session.attributes.userData)
            {
                // It was in the session so no need to hit the DB
                callback(new UserData(session, session.attributes.userData.questions,
                                    session.attributes.userData.lastQuestion,
                                    session.attributes.userData.mode,
                                    session.attributes.userData.startTime,
                                    session.attributes.userData.practiceTimes,
                                    session.attributes.userData.testScores));
            }
            else
            {
                dynamodb.getItem({TableName: 'MathFlashCardsUserData',
                                  Key: { UserID: {S: session.user.userId}}}, function (error, data) {
                    var userData;

                    if (error || (data.Item == undefined))
                    {
                        // No big deal, we'll just start over
                        userData = new UserData(session);
                        session.attributes.userData = userData.data;
                        callback(userData);
                    }
                    else
                    {
                        userData = new UserData(session, JSON.parse(data.Item.questions.S), data.Item.lastQuestion.S,
                                            data.Item.mode.S, data.Item.startTime.S,
                                            JSON.parse(data.Item.practiceTimes.S), JSON.parse(data.Item.testScores.S));
                        session.attributes.userData = userData.data;
                        callback(userData);
                    }
                });
            }
        },
        newUserData: function (session) {
            return new newUserData(session);
        }
    };
})();

module.exports = storage;
