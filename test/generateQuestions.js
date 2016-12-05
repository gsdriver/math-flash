/*
 * This file generates questions to be asked
 * The output is a JSON object that can directly be placed in the FlashCards folder
 */

function CreateAdditionCards()
{
    // For addition, just go through 0-9, a total of 100 cards
    var addition = {description: "Add", cards:[]};

    var i, j;

    for (i = 0; i < 10; i++)
    {
        for (j = 0; j < 10; j++)
        {
            addition.cards.push({question: (i + " plus " + j), answers: [(i+j).toString()]});
        }
    }

    console.log("module.exports = " + JSON.stringify(addition) + ";");
}

function CreateMinusCards()
{
    var minus = {description: "Subtract", cards:[]};

    var i, j;

    for (i = 0; i < 10; i++)
    {
        for (j = 0; j <= i; j++)
        {
            minus.cards.push({question: (i + " minus " + j), answers: [(i-j).toString()]});
        }
    }

    console.log("module.exports = " + JSON.stringify(minus) + ";");
}

function CreateTimesCards()
{
    // For times, just go through 0-9, a total of 100 cards
    var times = {description: "Times", cards:[]};

    var i, j;

    for (i = 0; i < 10; i++)
    {
        for (j = 0; j < 10; j++)
        {
            times.cards.push({question: (i + " times " + j), answers: [(i*j).toString()]});
        }
    }

    console.log("module.exports = " + JSON.stringify(times) + ";");
}

function CreateDivisionCards()
{
    // For division, it's like multiplication but we exclude 0 and we multiply to come
    // up with the question
    var division = {description: "Divide", cards:[]};

    var i, j;

    for (i = 1; i < 10; i++)
    {
        for (j = 1; j < 10; j++)
        {
            division.cards.push({question: ((i*j) + " divided by " + j), answers: [i.toString()]});
        }
    }

    console.log("module.exports = " + JSON.stringify(division) + ";");
}

//CreateAdditionCards();
//CreateMinusCards();
//CreateTimesCards();
CreateDivisionCards();