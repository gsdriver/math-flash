var mainApp = require('../src/index');
var plus = require('../flashcards/plus');

function Foo(varMe)
{
try {
    var fooman = require('../flashcards/' + varMe);
    }
catch(err) {
    console.log("file not found");
}
}

function BuildEvent(argv)
{
    // Templates that can fill in the intent
    var practiceIntent = {"name": "PracticeIntent", "slots": {"Category": {"name": "Category", "value": ""}, "NumQuestion": {"name": "NumQuestion", "value": ""}}};
    var testIntent = {"name": "TestIntent", "slots": {"Category": {"name": "Category", "value": ""}, "NumQuestion": {"name": "NumQuestion", "value": ""}}};
    var answerIntent = {"name": "AnswerIntent", "slots": {"Answer": {"name": "Answer", "value": ""}}};

    var lambda = {
       "session": {
         "sessionId": "SessionId.c88ec34d-28b0-46f6-a4c7-120d8fba8fa7",
         "application": {
           "applicationId": "amzn1.ask.skill.8a9b50de-2dce-49d0-88b1-bed45e7f10b0"
         },
         "attributes": {},
         "user": {
           "userId": "amzn1.ask.account.AFLJ4RYNI3X6MQMX4KVH52CZKDSI6PMWCQWRBHSPJJPR2MKGDNJHW36XF2ET6I2BFUDRKH3SR2ACZ5VCRLXLGJFBTQGY4RNYZA763JED57USTK6F7IRYT6KR3XYO2ZTKK55OM6ID2WQXQKKXJCYMWXQ74YXREHVTQ3VUD5QHYBJTKHDDH5R4ALQAGIQKPFL52A3HQ377WNCCHYI"
         },
         "new": true
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
         "sessionId": "SessionId.c88ec34d-28b0-46f6-a4c7-120d8fba8fa7",
         "application": {
           "applicationId": "amzn1.ask.skill.8a9b50de-2dce-49d0-88b1-bed45e7f10b0"
         },
         "attributes": {},
         "user": {
           "userId": "amzn1.ask.account.AFLJ4RYNI3X6MQMX4KVH52CZKDSI6PMWCQWRBHSPJJPR2MKGDNJHW36XF2ET6I2BFUDRKH3SR2ACZ5VCRLXLGJFBTQGY4RNYZA763JED57USTK6F7IRYT6KR3XYO2ZTKK55OM6ID2WQXQKKXJCYMWXQ74YXREHVTQ3VUD5QHYBJTKHDDH5R4ALQAGIQKPFL52A3HQ377WNCCHYI"
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

    // If there is no argument, then we'll just ask for the rules
    if ((argv.length <= 2) || (argv[2] == "open"))
    {
        return openEvent;
    }
    else if (argv[2] == "practice")
    {
        lambda.request.intent = practiceIntent;
        practiceIntent.slots.Category.value = (argv.length > 3) ? argv[3] : "";
        practiceIntent.slots.NumQuestion.value = (argv.length > 4) ? argv[4] : "";
    }
    else if (argv[2] == "test")
    {
        lambda.request.intent = testIntent;
        testIntent.slots.Category.value = (argv.length > 3) ? argv[3] : "";
        testIntent.slots.NumQuestion.value = (argv.length > 4) ? argv[4] : "";
    }
    else if (argv[2] == "answer")
    {
        lambda.request.intent = answerIntent;
        answerIntent.slots.Answer.value = (argv.length > 3) ? argv[3] : "";
    }
    else
    {
        console.log("Sorry, that wasn't a valid command line option");
        return null;
    }

    return lambda;
}

// Simple response - just print out what I'm given
function myResponse(appId) {
    this._appId = appId;
}

myResponse.succeed = function(result) {
    console.log(result.response.outputSpeech.text);
    console.log("The session " + ((!result.response.shouldEndSession) ? "stays open." : "closes."));
}

// Build the event object and call the app
mainApp.handler(BuildEvent(process.argv), myResponse);