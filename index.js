/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk');
const https = require('https');

const GetNewFactHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'LaunchRequest'
            || (request.type === 'IntentRequest'
                && request.intent.name === 'GetNewFactIntent');
    },
    handle(handlerInput) {
        let data = httpGet();
        return data.then(response => {
            let entries = response.feed.entry;
            let randomEntry = entries[Math.floor(Math.random()*entries.length)];
            let word = randomEntry.title.$t;
            let meaning = randomEntry.content.$t.split("significato: ")[1];
            const speechOutput = `${GET_FACT_MESSAGE} ${word}, ossia:  ${meaning}`;
            return handlerInput.responseBuilder
                .speak(speechOutput)
                .withSimpleCard(SKILL_NAME, speechOutput)
                .getResponse();
        });
    },
};

const HelpHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest'
            && request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak(HELP_MESSAGE)
            .reprompt(HELP_REPROMPT)
            .getResponse();
    },
};

const ExitHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest'
            && (request.intent.name === 'AMAZON.CancelIntent'
                || request.intent.name === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak(STOP_MESSAGE)
            .getResponse();
    },
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

        return handlerInput.responseBuilder.getResponse();
    },
};

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`Error handled: ${error.message}`);

        return handlerInput.responseBuilder
            .speak('Si è verificato un errore.')
            .reprompt('Si è verificato un errore.')
            .getResponse();
    },
};

const SKILL_NAME = 'Parole Complesse';
const GET_FACT_MESSAGE = 'Ecco la tua parola:';
const HELP_MESSAGE = 'Puoi chiedermi una nuova parola complessa';
const HELP_REPROMPT = 'Con cosa posso aiutarti?';
const STOP_MESSAGE = 'A presto!';

async function httpGet() {
    return new Promise((resolve, reject) => {
        https.get('https://spreadsheets.google.com/feeds/list/12Jk5HR3_pxO7QV4TjAuTN4lTeM8f621VgnITEsX6vzc/od6/public/basic?alt=json', (resp) => {
            let data = '';

            resp.on('data', (chunk) => {
                data += chunk;
            });

            resp.on('end', () => {
                resolve(JSON.parse(data));
            });

        }).on("error", (err) => {
            console.log("Error: " + err.message);
            reject(err);

        });
    })
}

const skillBuilder = Alexa.SkillBuilders.standard();

exports.handler = skillBuilder
    .addRequestHandlers(
        GetNewFactHandler,
        HelpHandler,
        ExitHandler,
        SessionEndedRequestHandler
    )
    .addErrorHandlers(ErrorHandler)
    .lambda();
