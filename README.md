# math-flash
Alexa skill that allows you to practice basic math skills via a series of
flash cards and tests.  The code is plugable, allowing future extensibility for
different types of math facts.  The core system pulls in different JSON files, which
contain the basic questions to be asked.  These JSON objects have two fields, `description`
which contains a text-based description of the flash cards, and `cards` which is an array 
of cards for Alexa to iterate through.  Each card in the array has two fields, `question`
which is the question to ask and `answer`, which is an array of acceptable answers.

Users interact with the skill by listening to and selecting available categories of cards
as described above.  They can go through the cards in either practice mode or test mode.
In practice mode, they may select how many cards they want to answer (default 20), and go
through those cards.  If they get a card wrong, the skill remembers the missed card and
returns to it after the user has completed the other cards.  This continues until they get
all of the selected cards right or stop the interaction.  The total amount of time to get
through all of the cards is recorded and the user is told how they did against this
"high score."

In test mode, the user again selects how many cards they want for their test (default 20).
In this mode, the questions are only presented once.  At the end, the user is told how many
they got correct and how long it took them to go through the cards.  A history of test scores
is saved and the user can see how they are doing over time (comparing to the last few scores
from a test in the previous category).  Unlike practice rounds which focus on completion 
time, tests focus on the total score.

The user's state is stored in a DynamoDB table with the following columns:

* `userID` - The table index, storing the userID sent from Alexa
* `questions` - An array of the questions that the user is attempting to answer - each question
                has a `status` field which is `right`, `wrong`, or `undefined` storing how the user
                has done when presented this question
* `lastQuestion` - Index into the `questions` array indicating which was the last question asked
* `mode` - Either `practice` or `test` depending on the user's mode
* `practiceTimes` - A history of the best times during practice rounds.  This JSON object has fields
                    named `category:#` (e.g. `minus:20`) indicating the category and number of questions
* `testScores` - A full history of the user's test scores

While practice rounds only save the best times, a full history of test scores is saved.  The `testScores`
field is an array of objects with the following fields:

* `category` - The category of the test
* `questionsAsked` - The number of questions which were asked
* `score` - The number of questions which were correctly answered
* `date` - The date that the test was taken

Note that only scores for completed tests are saved
