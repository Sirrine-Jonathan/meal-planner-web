// Initialize Firebase
const CLIENT_ID = "611111003951-68po95dbaqeqk8a1k0qm6ea05k9nkba9.apps.googleusercontent.com";
let config = {
    apiKey: "AIzaSyDAWZu7_18A8Qi4J9bEskl5K-A9hh0JzmQ",
    authDomain: "meal-planner-8738e.firebaseapp.com",
    databaseURL: "https://meal-planner-8738e.firebaseio.com",
    projectId: "meal-planner-8738e",
    storageBucket: "meal-planner-8738e.appspot.com",
    messagingSenderId: "611111003951",
    clientId: CLIENT_ID,
    scopes: [
        "email",
        "profile",
        "https://www.googleapis.com/auth/calendar"
    ],
    discoveryDocs: [
        "https://www.googleapis.com/discover/v1/apis/calendar/v3/rest"
    ]
};
firebase.initializeApp(config);
database = firebase.database();

let uiConfig = {
    callbacks: {
        signInSuccessWithAuthResult: function(authResult, redirectUrl){
            if (authResult.user){
                handleSignedInUser(authResult.user);
            }
            if (authResult.additionalUserInfo){
                console.log((authResult.additionalUserInfo.isNewUser) ?
                    "New User":"Existing User");
            }
            return false;
        },
        uiShown: function(){
            document.getElementById('loader').style.display = 'none';
        }
    },
    signInFlow: 'popup',
    signInOptions: [
        {
            provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
            scopes: config.scopes,
            authMethod: 'https://accounts.google.com',
            clientId: '611111003951-68po95dbaqeqk8a1k0qm6ea05k9nkba9.apps.googleusercontent.com'
        },
        {
            provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
            requireDisplayName: true
        }
    ],
    credentialHelper: (CLIENT_ID &&
        CLIENT_ID !== "611111003951-68po95dbaqeqk8a1k0qm6ea05k9nkba9.apps.googleusercontent.com") ?
        firebaseui.auth.CredentialHelper.GOOGLE_YOLO :
        firebaseui.auth.CredentialHelper.ACCOUNT_CHOOSER_COM
};

// Initialize the FirebaseUI Widget using Firebase.
let ui = new firebaseui.auth.AuthUI(firebase.auth());
ui.disableAutoSignIn();
ui.start('#firebaseui-auth-container', uiConfig);

/**
 * @return {string} The URL of the FirebaseUI standalone widget.
 */
function getWidgetUrl() {
    return '/widget#recaptcha=' + getRecaptchaMode();
}


/**
 * Redirects to the FirebaseUI widget.
 */
let signInWithRedirect = function() {
    window.location.assign(getWidgetUrl());
};


/**
 * Open a popup with the FirebaseUI widget.
 */
let signInWithPopup = function() {
    window.open(getWidgetUrl(), 'Sign In', 'width=985,height=735');
};

let handleSignedInUser = function(user) {
    console.log(user);
};