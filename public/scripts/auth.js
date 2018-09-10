document.addEventListener('DOMContentLoaded', function() {

	const logoutBtn = document.getElementById('logoutBtn');
	
	logoutBtn.addEventListener('click', function(){
		firebase.auth().signOut();
	});
	
	/*REMOVE USER, NEEDS DELETE ACCOUNT BUTTON
	const deleteAccountBtn = document.getElementById('deleteAccountBtn');
	
	deleteAccountBtn.addEventListener('click', function(){
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
	});
	*/
	
	firebase.auth().onAuthStateChanged(function(user) {

		if (user) {
		

				//remove hide from home page & nav
				document.getElementById('home').classList.remove('hidden');
				document.getElementById('nav').classList.remove('hidden');
				
				//add hide to intro page
				document.getElementById('introduction').classList.add('hidden');
				
				//update welcome
				document.getElementById('welcome').innerHTML = "Welcome, " + user.displayName;

				window.user = user;
				
				var userData = firebase.database().ref('users/' + user.uid);
				userData.once('value', function(snapshot) {
					var Data = snapshot.val();
					console.log(Data);
					
					/*
						if there are ingredientsList set the localData ingredient array to those ingredients
						if there are recipes set the localData recipes to those recipes
						if there are shopping lists set the local data to those lists
						if there are pantryItemList
						
						else	
						leave them at default
					*/
					if(Data == null)
						updateData();
					else
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
						
					}

					
				}).then(function(){
					updateCommunityRecipes();
					var selectsArr = document.getElementsByClassName('unitsSelect');
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
				
				//remove hide from intro page
				document.getElementById('introduction').classList.remove('hidden');
				
				//add hide to home page & nav
				document.getElementById('nav').classList.add('hidden');
				document.getElementById('home').classList.add('hidden');


			}

	});

	window.signInWithRedirect = firebase.auth().signInWithRedirect;

	
});



