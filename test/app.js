var mainApp = require('../index');

const attributeFile = 'attributes.txt';

const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
const dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

const sessionId = "SessionId.c88ec34d-28b0-46f6-a4c7-120d8fba8fb4";
const USERID = 'not-amazon';

function BuildEvent(argv)
{
  // Templates that can fill in the intent
  var practiceIntent = {'name': 'PracticeIntent', 'slots': {'Category': {'name': 'Category', 'value': ''}, 'NumQuestion': {'name': 'NumQuestion', 'value': ''}}};
  var testIntent = {'name': 'TestIntent', 'slots': {'Category': {'name': 'Category', 'value': ''}, 'NumQuestion': {'name': 'NumQuestion', 'value': ''}}};
  var answerIntent = {'name': 'AnswerIntent', 'slots': {'Answer': {'name': 'Answer', 'value': ''}}};
  var nameIntent = {'name': 'NameIntent', 'slots': {'Name': {'name': 'Name', 'value': ''}}};
  var changeIntent = {'name': 'ChangePlayerIntent', 'slots': {}};
  var yes = {'name': 'AMAZON.YesIntent', 'slots': {}};
  var no = {'name': 'AMAZON.NoIntent', 'slots': {}};
  var help = {'name': 'AMAZON.HelpIntent', 'slots': {}};
  var stop = {'name': 'AMAZON.StopIntent', 'slots': {}};
  var cancel = {'name': 'AMAZON.CancelIntent', 'slots': {}};
  var highScore = {'name': 'HighScoreIntent', 'slots': {}};

  var lambda = {
    "session": {
      "sessionId": sessionId,
      "application": {
        "applicationId": "amzn1.ask.skill.8a9b50de-2dce-49d0-88b1-bed45e7f10b0"
      },
      "attributes": {},
      "user": {
        "userId": USERID,
      },
      "new": false
    },
    "request": {
      "type": "IntentRequest",
      "requestId": "EdwRequestId.26405959-e350-4dc0-8980-14cdc9a4e921",
      "locale": "en-US",
      "timestamp": "2016-11-03T21:31:08Z",
      "intent": {}
    },
    "version": "1.0"
  };

  var openEvent = {
    "session": {
      "sessionId": sessionId,
      "application": {
        "applicationId": "amzn1.ask.skill.8a9b50de-2dce-49d0-88b1-bed45e7f10b0"
      },
      "attributes": {},
      "user": {
        "userId": USERID,
      },
      "new": true
    },
    "request": {
      "type": "LaunchRequest",
      "requestId": "EdwRequestId.26405959-e350-4dc0-8980-14cdc9a4e921",
      "locale": "en-US",
      "timestamp": "2016-11-03T21:31:08Z",
      "intent": {}
    },
    "version": "1.0"
  };

  var endEvent = {
                   "session": {
                     "sessionId": sessionId,
                     "application": {
                       "applicationId": "amzn1.ask.skill.8a9b50de-2dce-49d0-88b1-bed45e7f10b0"
                     },
                     "attributes": {},
                     "user": {
                       "userId": USERID,
                     },
                     "new": false
                   },
                   "request": {
                     "type": "SessionEndedRequest",
                     "requestId": "EdwRequestId.97c42d5b-86ef-4e3c-8655-2e06aec98e7e",
                     "locale": "en-US",
                     "timestamp": "2017-06-04T13:16:51Z",
                     "reason": "USER_INITIATED"
                   },
                   "version": "1.0"
                 };

  // If there is an attributes.txt file, read the attributes from there
  const fs = require('fs');
  if (fs.existsSync(attributeFile)) {
    data = fs.readFileSync(attributeFile, 'utf8');
    if (data) {
      lambda.session.attributes = JSON.parse(data);
      openEvent.session.attributes = JSON.parse(data);
    }
  }

  // If there is no argument, then we'll just return
  if (argv.length <= 2) {
    console.log('I need some parameters');
    return null;
  }
  else if (argv[2] == 'practice') {
    lambda.request.intent = practiceIntent;
    practiceIntent.slots.Category.value = (argv.length > 3) ? argv[3] : '';
    practiceIntent.slots.NumQuestion.value = (argv.length > 4) ? argv[4] : '';
  } else if (argv[2] == 'test') {
    lambda.request.intent = testIntent;
    testIntent.slots.Category.value = (argv.length > 3) ? argv[3] : '';
    testIntent.slots.NumQuestion.value = (argv.length > 4) ? argv[4] : '';
  } else if (argv[2] == 'answer') {
    lambda.request.intent = answerIntent;
    answerIntent.slots.Answer.value = (argv.length > 3) ? argv[3] : '';
  } else if (argv[2] == 'name') {
    lambda.request.intent = nameIntent;
    nameIntent.slots.Name.value = (argv.length > 3) ? argv[3] : '';
  } else if (argv[2] == 'change') {
    lambda.request.intent = changeIntent;
  } else if (argv[2] == 'exit') {
    return endEvent;
  } else if (argv[2] == 'launch') {
    return openEvent;
  } else if (argv[2] == 'yes') {
    lambda.request.intent = yes;
  } else if (argv[2] == 'no') {
    lambda.request.intent = no;
  } else if (argv[2] == 'help') {
    lambda.request.intent = help;
  } else if (argv[2] == 'stop') {
    lambda.request.intent = stop;
  } else if (argv[2] == 'cancel') {
    lambda.request.intent = cancel;
  }
  else {
    console.log(argv[2] + ' was not valid');
    return null;
  }

  return lambda;
}

// Simple response - just print out what I'm given
function myResponse(appId) {
  this._appId = appId;
}

myResponse.succeed = function(result) {
  if (result.response.outputSpeech.ssml) {
    console.log('AS SSML: ' + result.response.outputSpeech.ssml);
  } else {
    console.log(result.response.outputSpeech.text);
  }
  if (result.response.card && result.response.card.content) {
    console.log('Card Content: ' + result.response.card.content);
  }
  console.log('The session ' + ((!result.response.shouldEndSession) ? 'stays open.' : 'closes.'));
  if (result.sessionAttributes) {
    // Output the attributes too
    const fs = require('fs');
    fs.writeFile(attributeFile, JSON.stringify(result.sessionAttributes), (err) => {
      if (!process.env.NOLOG) {
        console.log('attributes:' + JSON.stringify(result.sessionAttributes) + ',');
      }
    });
  }
}

myResponse.fail = function(e) {
  console.log(e);
}

// Build the event object and call the app
if ((process.argv.length == 3) && (process.argv[2] == 'clear')) {
  const fs = require('fs');

  // Clear is a special case - delete this entry from the DB and delete the attributes.txt file
  dynamodb.deleteItem({TableName: 'FlashCardsUserData', Key: { userId: {S: USERID}}}, function (error, data) {
    console.log("Deleted " + error);
    if (fs.existsSync(attributeFile)) {
      fs.unlinkSync(attributeFile);
    }
  });
} else {
  var event = BuildEvent(process.argv);
  if (event) {
      mainApp.handler(event, myResponse);
  }
}
