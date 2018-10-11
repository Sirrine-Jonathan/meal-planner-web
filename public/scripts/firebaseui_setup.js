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


// Initialize Firebase Auth UI
let uiConfig = {
    callbacks: {
        signInSuccessWithAuthResult: function(authResult, redirectUrl){
            if (authResult.user){
                //handleSignedInUser(authResult.user);
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

function getWidgetUrl() {
    return '/widget#recaptcha=' + getRecaptchaMode();
}

let signInWithRedirect = function() {
    window.location.assign(getWidgetUrl());
};

let signInWithPopup = function() {
    window.open(getWidgetUrl(), 'Sign In', 'width=985,height=735');
};

let handleSignedInUser = function(user) {
    if (user) {


        //remove hide from home page & nav
        document.getElementById('home').classList.remove('hidden');
        document.getElementById('nav').classList.remove('hidden');

        //add hide to intro page
        document.getElementById('introduction').classList.add('hidden');

        //update welcome
        document.getElementById('welcome').innerHTML = "Welcome, " + user.displayName;

        window.user = user;

        let userData = firebase.database().ref('users/' + user.uid);
        userData.once('value', function(snapshot) {
            let Data = snapshot.val();

            if (Data != null)
            {
                if (Data.ingredientList)
                {
                    localData.ingredientList = Data.ingredientList;
                }

                if (Data.recipes)
                {
                    localData.recipes = Data.recipes;
                }

                if (Data.savedShoppingLists)
                {
                    localData.savedShoppingLists = Data.savedShoppingLists;
                }

                if (Data.pantryItemList)
                {
                    localData.pantryItemList = Data.pantryItemList;
                }

            } else {
                updateData();
                //firebase.auth().signOut();
            }


        }).then(function(){
            updateCommunityRecipes();
            let selectsArr = document.getElementsByClassName('unitsSelect');
            setupUnitSelects(unitsArr, selectsArr);
            //run main found at bottom of script

            //calls setup with appropriate parameters
            ingredientBankMain();
            communityIngredientBankMain();

            updateBank(document.getElementById('ingredientBank'), localData.ingredientList);
            updateCommunityBank(document.getElementById('communityIngredientBank'), localData.ingredientList);
        })
    }
    else {
        document.getElementById('introduction').classList.remove('hidden');
        document.getElementById('nav').classList.add('hidden');
        document.getElementById('home').classList.add('hidden');
    }
};

let logOutUser = function(){
    firebase.auth().signOut();
    document.getElementById('introduction').classList.remove('hidden');
    document.getElementById('nav').classList.add('hidden');
    document.getElementById('home').classList.add('hidden');
    ui.start('#firebaseui-auth-container', uiConfig);
};

let deleteUser = function(user){
    firebase.removeUser({
        email : user.email,
        password : user.password
    }, function(error) {
        if (error === null) {
            console.log("User remove successfully");
        } else {
            console.log("Error removing user: ", error);
        }
    });
};


document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', logOutUser);

/*
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    deleteAccountBtn.addEventListener('click', function(user){
        deleteUser(user);
    });
*/

    firebase.auth().onAuthStateChanged(function(user) {
        handleSignedInUser(user)
    });

    //window.signInWithRedirect = firebase.auth().signInWithRedirect;
});