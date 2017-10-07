const functions = require('firebase-functions');
//Require Google Translate
const Translate = require('@google-cloud/translate');
//Create a reference to the project name, as stated in .firebaserc
const projectID = 'fb-movies-ef050';
//Call the translate function and pass in the project name
const translateClient = Translate({projectId: projectID});
//Export the translate function
exports.translateToRussian = functions.database.ref('/trollbox/{messageID}').onWrite(event => {
    //Create a boolean and an if clause to ensure translation happens only once
    const translated = event.data.val().translated;
    if (!translated) {
        const origTxt = event.data.val().message;
        const root = event.data.ref.root;
        const translate_promise = translateClient.translate(origTxt, 'ru')
            .then((results) => {
                //the first element of the array is the translated message
                const translation = results[0];
                return translation;
            })
            .catch((err) => {
                console.error('ERROR: ', err);
            });
        const completed_promise = translate_promise.then(ruText => {
            //Assemble a new message object for the database.
            const postData = {
                message: ruText,
                troll: event.data.val().troll,
                date: event.data.val().date,
                translated: true
            };
            //Get a key from firebase for the new childnode
            var newPostKey = root.child('/trollbox').push().key;
            //Use the key to store the new translated text
            root.child('/trollbox/' + newPostkey).set(postData);
        });
        //Returning this lets cloud rsrcx know this is done.
        return completed_promise;
    }
    //if all else fails, return null
    return null;
});


// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
