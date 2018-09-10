/*
*
*
*
*
*/

//@param1 int
//@param2 int
//@param3 int
function adjustIngAmountToFillNeed(recipeServes, toServe, ingAmount){
	let perPersonAmount = ingAmount / recipeServes;
	return perPersonAmount * toServe;
}

//fires on button press
//no parameters
function scheduleRecipe(){
	
	//find recipe object from html
	var recipeDiv = this.parentElement;
	var recipeObj = JSON.parse(recipeDiv.dataset.json);

	//paranoid check to make sure toServe has been set
	if (!recipeObj.toServe)
		recipeObj.toServe = parseInt(recipeDiv.getElementsByClassName('toServeInput')[0].value);
	
	//push recipe object to schedule recipes
	sessionData.scheduledRecipes.push(recipeObj);
	
	//add recipes ingredients to scheduled ingredients
	//TODO adjust ingredient amount by toServe number and serves number
	recipeObj.ingredients.forEach(function(curIng){
		
		//look in scheduled ingredients for ingredient
		isFound = false;
		sessionData.scheduledIngredients.find(function(ele){
			if(ele.name == curIng.name){
				isFound = true;
				
				//adjust amount recipe calls for by how many people it serves
				//and how many people it needs to serve
				var curIngAmount = adjustIngAmountToFillNeed(recipeObj.serves, recipeObj.toServe, curIng.amount);
				
				//add ingredient amount specified in the recipe
				//to the ingredient amount already scheduled
				ele.amount += curIngAmount;
				ele.need   += curIngAmount;
			}
		});

		if (!isFound){
			
			//create stagedPantryItems property
			curIng.stagedPantryItems = [];
			
			//adjust amount recipe calls for by how many people it serves
			//and how many people it needs to serve
			var curIngAmount = adjustIngAmountToFillNeed(recipeObj.serves, recipeObj.toServe, curIng.amount);
			curIng.amount = curIngAmount;
			
			//create need property
			curIng.need = curIng.amount;
			
			//add the ingredient to the scheduled ingredients array
			sessionData.scheduledIngredients.push(curIng);
		}
	})
	
	//updateShoppingList();
	regenShoppingList();
	updateScheduledRecipesDisplay();
}

//fires on button press
//no parameters
function unscheduleRecipe(){

	//find recipe object from html
	var recipeDiv = this.parentElement;
	var recipeObj = JSON.parse(recipeDiv.dataset.json);
	var index;
	
	//Find index of recipe to be removed in scheduled recipes
	sessionData.scheduledRecipes.forEach(function(curRecipe, ind, arr){
		
		//default is true, that it is found
		//checks assure that it is in scheduled recipes
		/*
		  This gauntlent makes absolutley sure that 
		  curRecipe is in fiact recipeObj
		
		*/
		var recipeFound = true;
		
		//check name
		if (curRecipe.name != recipeObj.name && curRecipe.toServe != recipeObj.toServe)
		{
			recipeFound = false;
		}
		
		//check categories
		if (curRecipe.hasOwnProperty(category))
		{
			curRecipe.category.forEach(function(curCat){
				recipeObj.category.forEach(function(recipeObjCat){
					if (recipeObjCat !== curCat)
						recipeFound = false;
				})
			})
		}
		
		
		
		//scheduled recipes
		//curRecipe is from loop
		//recipeObj is item to be removed
		
		//check ingredients
		if (curRecipe.ingredients.length != recipeObj.ingredients.length)
			recipeFound = false;
		else
		{
			for (var i = 0; i < curRecipe.ingredients.length; i++)
			{
				if (curRecipe.ingredients[i].name != recipeObj.ingredients[i].name)
					recipeFound = false;
			}
		}
		
		/*
		curRecipe.ingredients.forEach(function(recipeObjIng, index){
			if (recipeObjIng[index].name !== curRecipe.ingredients.name &&
				recipeObjIng[index].unit !== curRecipe.ingredients.unit)
				recipeFound = false;
		})
		*/
		
		//check directions
		if (curRecipe.directions !== recipeObj.directions)
			recipeFound = false;
		
		if (recipeFound)
		{
			index = ind;
			return;
		}
	})
	if(index != undefined)
		sessionData.scheduledRecipes.splice(index, 1);
	
	//remove ingredients from scheduled ingredients
	recipeObj.ingredients.forEach(function(curIng){
		sessionData.scheduledIngredients.forEach(function(ele, ind){
			if(ele.name == curIng.name){
				//remove the correct amount from ingredient
				var curIngAmount = adjustIngAmountToFillNeed(recipeObj.serves, recipeObj.toServe, curIng.amount);
				ele.amount -= curIngAmount;
			}
			if(ele.amount <= 0){
				//remove ingredient from list
				sessionData.scheduledIngredients.splice(ind, 1);
			}
		});
	})
	//updateShoppingList();
	regenShoppingList();
	updateScheduledRecipesDisplay()
}

document.getElementById('searchRecipesInput').addEventListener('input', function(){
	activeSearchRecipes(this.value);
})

function activeSearchRecipes(searchCriteria){
	
	var searchCriteriaArr = searchCriteria.trim().split('').map(function (ch, i, array) { return ch == ' ' ? array[i - 1] + ' ' : ch });
	var numOfLetters = searchCriteriaArr.length;
	var results = [];
	
	//data loop
	localData.recipes.forEach(function(recObj, ind, arr){
		var testPass = true;
		var testString = recObj.name; 	 
		var testArr = testString.trim().split('').map(function (ch, i, array) { return ch == ' ' ? array[i - 1] + ' ' : ch });
		for (var i = 0; i < numOfLetters; i++)
		{
			if(testArr[i].toUpperCase() != searchCriteriaArr[i].toUpperCase())
				testPass = false;
		}
		if(testPass)
			results.push(recObj);
	})
	
	console.log(results);
	updateRecipes(results);
}

document.getElementById('recipeSort').addEventListener('change', function(){
	console.log(this.value);
	/*
	switch(this.value){
		case 'az':
			//updateRecipes();
		break;
		case 'za':
			localData.recipes.sort(compareReverseAlpha);
			updateRecipes(localData.recipes, false);
		break;
		default:
			CATEGORY_CRITERIA = this.value;
			var catRec = localData.recipes.filter(findRecipe);
			updateRecipes(catRec);
	}
	*/
})

//fires on button press
//no parameters
function deleteRecipe(){

	var recipeDiv = this.parentElement;
	var recipeObj = JSON.parse(recipeDiv.dataset.json);
	var index = recipeDiv.dataset.index;
	
	localData.recipes.splice(index, 1);
	updateRecipes();
}

function updateScheduledRecipesDisplay()
{
	//wipe recipes div clean
	var node = document.getElementById('scheduledRecipesDisplay');
	while (node.firstChild)
	{
		node.removeChild(node.firstChild);
	}
	
	var tempRecipeArr = [];
	
	//populate tempRecipeArr with scheduled recipes
	sessionData.scheduledRecipes.forEach(function(curRecipe, ind){
		
		var tempRecipeObj = tempRecipeArr.find(function(obj){
			return obj.name == curRecipe.name && obj.toServe == curRecipe.toServe;
		})
		
		if(!tempRecipeObj)
		{	
			//recipe not found, build new obj
			tempRecipeObj = {};
			tempRecipeObj['name'] = curRecipe.name;
			tempRecipeObj['amount'] = 1;
			tempRecipeObj['toServe'] = curRecipe.toServe;
			tempRecipeArr.push(tempRecipeObj);
		}
		else
		{
			//recipe found, increase amount property
			tempRecipeObj['amount']++;
		}
		
	});
	
	//loop through tempRecipeArr to populate node
	tempRecipeArr.forEach(function(curRecipe, ind){
		var recipeDiv = document.createElement('div');
		recipeDiv.classList.add('scheduledRecipeDisplay');
		
		//display name. include amount if greate than one
		if(curRecipe['amount'] > 1)
		    recipeDiv.innerHTML = curRecipe['amount'] + ' ' + curRecipe['name'] + ' to serve ' + curRecipe['toServe'];
	    else
			recipeDiv.innerHTML = curRecipe['name'] + ' to serve ' + curRecipe['toServe'];
		
		node.appendChild(recipeDiv);
	})
}

/*MODAL EVENT LISTENERS*/
document.getElementById('openNewRecipeModal').addEventListener('click', function(){
	document.getElementById('newRecipeModal').style.display = "block";
	document.getElementById('submitNewRecipe').style.display = "inline-block";
});

document.getElementById('closeRecipeModal').addEventListener('click', function(){
	document.getElementById('newRecipeModal').style.display = "none";
	document.getElementById('submitNewRecipe').style.display = "none";
	document.getElementById('updateNewRecipe').style.display = "none";
	clearRecipeForm();
});

