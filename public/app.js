//refer to email login and account buttons
const txtEmail = document.getElementById("txtEmail");
const txtPassword = document.getElementById("txtPassword");
const btnEmailLogin = document.getElementById('btnEmailLogin');
const btnCreateAccount = document.getElementById("btnCreateAccount");
const btnLogout = document.getElementById("btnLogout");
const txtTrollMsg = document.getElementById('txtTrollMsg');
const btnNewTrollMsg = document.getElementById('btnNewTrollMsg');

//SIGN IN GOOGLE USER
//get an instance of an authorization provider, in this case Google.
const provider = new firebase.auth.GoogleAuthProvider();
//reference the login button and create a user variable.
const btnLogin = document.getElementById('btnLogin');
var user;
//This function controls access to data. Loads snapshot of data.
function appInit(){
    //query the movie data by creating a reference to the movies node in the database
    var moviesRef = firebase.database().ref('movies').orderByChild('episode_id');
    moviesRef.once('value', function(snapshot){
        var movieData = ''; //build the display on the client side
        snapshot.forEach(function(childSnapshot){
            movieData += '<b>' + childSnapshot.val().title + '</b><br>';
            movieData += '<b>Episode:</b>' + childSnapshot.val().episode_id;
            movieData += '<p>' + childSnapshot.val().opening_crawl + '</p>';
            movieData += '<div>&nbsp;</div>';
        });
        //inject the data into the page
        document.getElementById('movies').innerHTML = movieData;
    });
    //query the characters data by creating a reference to the characters node in the database
    var charactersRef = firebase.database().ref('characters').orderByChild('episode_id');
    charactersRef.once('value', function(snapshot){
        var charactersData = ''; //build the display on the client side
        snapshot.forEach(function(childSnapshot){
            charactersData += '<b>' + childSnapshot.val().name + '</b><br>';
            charactersData += '<b>Gender:</b> ' + childSnapshot.val().gender + '<br>';
            charactersData += '<b>Height:</b> ' + childSnapshot.val().height + '<br>';
            charactersData += '<b>Birthday:</b> ' + childSnapshot.val().birth_year;
            charactersData += '<div>&nbsp;</div>';
        });
        //inject the data into the page
        document.getElementById('characters').innerHTML = charactersData;
    });
    //query the database for messages and add listener for changes
    var trollBoxRef = firebase.database().ref('trollbox');
    trollBoxRef.on('child_added', function(data){
        updateTrollBox(data.val().message, data.val().troll, data.val().date);        
    });
};//end app init
//add event listener and a callback function to handle the click.
btnLogin.addEventListener('click', e => {
    firebase.auth().signInWithPopup(provider).then(function(result){
        user = result.user;
        const welcome = "Welcome, " + user.displayName;
        document.getElementById("msg").innerHTML = welcome;
        //give access to data
        appInit();
        //console log success
        console.log('logged in user:' + JSON.stringify(user));
    }).catch(function(error){
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log('error message:' + errorCode + '--' + errorMessage);
    });
});
//CREATE ACCOUNT
btnCreateAccount.addEventListener('click', e =>{
    const email = txtEmail.value;
    const password = txtPassword.value;
    firebase.auth().createUserWithEmailAndPassword(email, password).then(function(result){
        var welcome = "Thanks for signing up, " + result.email + "! You can now log in.";
        document.getElementById('msg').innerHTML = welcome;
    }).catch(function(error){
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log('email sign-up error:' + errorCode + '--' + errorMessage);
    });
});
//LOGIN EMAIL USER
btnEmailLogin.addEventListener('click', e =>{
    const email = txtEmail.value;
    const password = txtPassword.value;
    firebase.auth().signInWithEmailAndPassword(email, password).then(function(result){
        user = result;
        document.getElementById('msg').innerHTML = "Welcome, " + user.email;
        document.getElementById("txtEmail").value='';
        document.getElementById("txtPassword").value='';
        //give access to data
        appInit();
        
    }).catch(function(error){
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log('email sign-in error:' + errorCode + '--' + errorMessage);
    });
});

//SIGN OUT USER - THIS WORKS FOR BOTH TYPES OF USERS, GOOGLE AUTH and EMAIL
btnLogout.addEventListener('click', e =>{
    //display name cannot be used because it's only available in google auth user objects
    const goodbye = "Goodbye, " + user.email + "Have a great day!";
    document.getElementById("msg").innerHTML = goodbye;
    firebase.auth().signOut().then(function(){
        user = null;
        document.getElementById('trollbox').innerHTML = '';
        console.log("successful sign out");
    }).catch(function(error){
        //tbd error handling 
    });
});

//UPDATE TROLLBOX - build a variable and inject it into the HTML
function updateTrollBox(message,troll,date){
    var trollData = '<p><b>'+ troll;
    trollData += '</b>said: ' + message;
    trollData += ' - <small>' + date + '</small></p>';
    
    var currentTrollBox = document.getElementById('trollbox').innerHTML;
    document.getElementById('trollbox').innerHTML = currentTrollBox + trollData;
};
//UPDATE TROLL DATABASE - listen for new entries from logged in users and push them into the db.
btnNewTrollMsg.addEventListener('click', e =>{
    if (user) {
        const troll = user.email;
        const msg = txtTrollMsg.value;
        const now = new Date();
        const postData = {
            troll: troll,
            message: msg,
            date: now.toUTCString()
        };
        //get a key for a new child
        var newPostKey = firebase.database().ref().child('trollbox').push().key;
        //use the key to store the new message
        firebase.database().ref('trollbox/' + newPostKey).set(postData);
        //clear the textbox
        document.getElementById('txtTrollMsg').value = '';
    }
});
