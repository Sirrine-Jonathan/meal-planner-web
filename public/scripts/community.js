

function updateCommunityRecipes(category = "All", sortFn = 'az')
{
	//handle how the data should be ordered based on sortFn
	var orderBy = "name";          //default
	if (sortFn == "submitter")
		orderBy = sortFn;
	else if (sortFn == "creationDate")
		orderBy = sortFn;
	
	//get the database reference to Community Recipes
	var cr = database.ref('CommunityRecipes').orderByChild(orderBy);;
	cr.once('value', function(snapshot) {
	    var objOfRecipes = snapshot.val();
	
		//wipe recipes div clean
		var node = document.getElementById('communityRecipes');
		while (node.firstChild)
		{
			node.removeChild(node.firstChild);
		}

		//make array out of recipes in snapshot obj
		var arrayOfRecipes = [];
		for (recipe in objOfRecipes)
		{
			if (category == "All" || objOfRecipes[recipe].category.indexOf(category) >= 0)
				arrayOfRecipes.push(objOfRecipes[recipe]);
		}
		
		//sort alphabetically, other sort options were already handled with orderBy
		if (arrayOfRecipes && sortFn == 'az')
			arrayOfRecipes.sort(compareAlpha);
		if (arrayOfRecipes && sortFn == 'za')
			arrayOfRecipes.sort(compareReverseAlpha);
		
		//make keys array
		var keyArr = Object.keys(objOfRecipes);
		updateCommunityRecipesBySearch(arrayOfRecipes);
   });
}

document.getElementById('communityRecipeSort').addEventListener('change', function(){
	sortSettings.community.sortBy = this.value;
	updateCommunityRecipes(sortSettings.community.category, this.value);
})

document.getElementById('communityCategorySelect').addEventListener('change', function(){
	sortSettings.community.category = this.value;
	updateCommunityRecipes(this.value, sortSettings.community.sortBy);
})

function updateCommunityRecipesBySearch(arrayOfRecipes)
{
	//wipe recipes div clean
	var node = document.getElementById('communityRecipes');
	while (node.firstChild)
	{
		node.removeChild(node.firstChild);
	}	
	
	//loop through data to add recipes to list
	arrayOfRecipes.forEach(function(curVal, index, arra){

		//make a div to populate recipes div
		var oneRecipe = document.createElement('div');
		oneRecipe.classList.add('oneCommunityRecipe');
		oneRecipe.dataset.json = JSON.stringify(curVal);
		oneRecipe.dataset.index = index;
		
		//put recipe name in div
		var nameHTML = document.createElement('h2');
		nameHTML.innerHTML = curVal.name;
		nameHTML.classList.add('oneCommunityRecipeName');
		oneRecipe.appendChild(nameHTML);
		
		//make div for number of people are served
		var numServedDiv = document.createElement('div');
		numServedDiv.innerHTML = "Serves " + curVal.serves;
		numServedDiv.classList.add('numServedDiv');
		oneRecipe.appendChild(numServedDiv);
		
		//put the user info
		var submitter = document.createElement('span');
		submitter.classList.add('communitySubmitter');
		submitter.innerHTML = curVal.submitter;
		oneRecipe.appendChild(submitter);
		
		//put the creation date
		var creationDate = document.createElement('span');
		creationDate.classList.add('communityCreationDate');
		creationDate.innerHTML = new Date(curVal.creationDate).toLocaleString();
		oneRecipe.appendChild(creationDate);
		
		
		//TODO if categories exist, list them
		if (curVal.category)
		{
			var categories = document.createElement('div');
			categories.classList.add('communityCategories');
			
			if (curVal.category.length == 1)
			{
				categories.innerHTML = "Category: " + curVal.category[0];	
			}
			else
			{
				categories.innerHTML = "Categories: ";
				curVal.category.forEach(function(curCat, ind){
					categories.innerHTML += curCat;
					if (ind != curVal.category.length - 1)
						categories.innerHTML += ", ";
				})
			}
			oneRecipe.appendChild(categories);
		}
		
		
		//make UL for ingredients
		var ingredientsUL = document.createElement('ul');
		ingredientsUL.classList.add('oneCommunityRecipeIng');
		curVal.ingredients.forEach(function(curr){
			var tempLi = document.createElement('li');
			
			var needHTML;
			if (curr.amount > 1 && curr.unit != '-none-')
				needHTML = "s ";
			else
				needHTML = " ";
			
			//hanle ingredients with no unit
			var usableUnit;
			if (curr.unit == '-none-')
				usableUnit = '';
			else
				usableUnit = curr.unit;
			
			tempLi.innerHTML = curr.amount + ' ' + usableUnit + needHTML + curr.name;
			ingredientsUL.appendChild(tempLi);
		})
		oneRecipe.appendChild(ingredientsUL);

		//make div for directions
		var directionsDiv = document.createElement('div');
		directionsDiv.innerHTML = curVal.directions;
		directionsDiv.classList.add('oneCommunityRecipeDirections');
		oneRecipe.appendChild(directionsDiv);
		
		//add the schedule button
		var addButton = document.createElement('input');
		addButton.setAttribute('type','button');
		
		//Check if recipe is in user recipes already
		var alreadyFound = false;
		localData.recipes.forEach(function(localCurr){
			if (JSON.stringify(localCurr.name) == JSON.stringify(curVal.name) &&
				JSON.stringify(localCurr.directions) == JSON.stringify(curVal.directions))
				alreadyFound = true;
		})
		
		if (!alreadyFound)
		{				

			//go through ingredients and add them to the user's bank
			curVal.ingredients.forEach(function(currVal){
				//check if its already in users ingredients
				var alreadyFoundIng = false;
				localData.ingredientList.forEach(function(localCurr){
					if (JSON.stringify(currVal.name) == JSON.stringify(localCurr.name) &&
						JSON.stringify(currVal.unit) == JSON.stringify(localCurr.unit))
						alreadyFoundIng = true;
				})
				
				
				//if not add it
				if (!alreadyFoundIng)
				{
					var ing = {
						'name': currVal.name,
						'unit': currVal.unit
					}
					localData.ingredientList.push(ing);
				}
			})

			addButton.value = "Add to your Recipes";
			addButton.addEventListener('click', function(){
				localData.recipes.push(curVal);
				this.value = "Added";
				this.setAttribute('disabled', true);
			});
		}
		else
		{
			addButton.value = "Added";
			addButton.setAttribute('disabled', true);
		}
		oneRecipe.appendChild(addButton);
		node.appendChild(oneRecipe);
	});
}

document.getElementById('searchCommunityRecipes').addEventListener('input', function(){
	
	//get snapshot obj of recipes
	var cr = database.ref('CommunityRecipes').orderByChild("name");
	var searchCriteria = this.value;
	//build array of recipes matching criteria
	var arrayOfRecipes = [];
	cr.once('value', function(snapshot) {
	    var objOfRecipes = snapshot.val();

		//make array
		for (recipe in objOfRecipes)
		{
			arrayOfRecipes.push(objOfRecipes[recipe]);
		}
		activeSearchCommunityRecipes(searchCriteria, arrayOfRecipes);
    });
})

function activeSearchCommunityRecipes(searchCriteria, arrayOfRecipes){
	
	var searchCriteriaArr = searchCriteria.trim().split('').map(function (ch, i, array) { return ch == ' ' ? array[i - 1] + ' ' : ch });
	var numOfLetters = searchCriteriaArr.length;
	var results = [];
	
	//data loop
	arrayOfRecipes.forEach(function(recObj, ind, arr){
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
	
	if(numOfLetters > 0)
		updateCommunityRecipesBySearch(results);
	else
		updateCommunityRecipesBySearch(arrayOfRecipes);
}

/*MODAL EVENT LISTENERS*/
document.getElementById('openNewCommunityModal').addEventListener('click', function(){
	document.getElementById('newCommunityModal').style.display = "block";
});

document.getElementById('closeCommunityModal').addEventListener('click', function(){
	document.getElementById('newCommunityModal').style.display = "none";
	//TODO show hide update submit buttons
	clearCommunityRecipeForm();
});

function addNewComunnityRecipe(){
   
   //basic validation
   if(!document.getElementById('communityRecipeName').value)
	   return 'You forgot to name it';
   
   //assure name is unique
   var isNotUnique = localData.recipes.find(function(obj){
	   return (document.getElementById('communityRecipeName').value == obj.name);
   })
   if (isNotUnique)
	   return 'There is already a recipe with that name';
   
   if(!document.getElementById('newCommunityDirections').value)
	   document.getElementById('newCommunityDirections').value = "No directions supplied";
   
   //set up recipe obj
   var recipe = {
		'name': document.getElementById('communityRecipeName').value,
		'category': [],
		'ingredients': [],
		'directions': document.getElementById('newCommunityDirections').value,
		'creationDate': Date.now(),
		'submitter': user.displayName
   }

   
   //loop through ingredients
	//make ingredient obj from html
	  //add obj to ingredients array in recipe obj
   var ingredientsDiv = document.getElementById('communityIngredients').children;
   
   //more validation
   if(ingredientsDiv.length <= 0)
	   return 'There needs to be at least one ingredient';
   
   for(var i = 0; i < ingredientsDiv.length; i++){
	    var nameArr = ingredientsDiv[i].id.split(' ');
		nameArr.splice(nameArr.length - 1, 1);
		var name = nameArr.join(' ');
		var amount = parseFloat(ingredientsDiv[i].children[1].value);
		var ingObj = localData.ingredientList.find(function(ele){
			if(ele.name == name)
				return ele;
		});
		
		var ingredient = {
			'name': name,
			'amount': amount,
			'unit': ingObj.unit,
		}
		recipe.ingredients.push(ingredient);
   }
   
	function getSelectValues(select) {
	  var result = [];
	  var options = select && select.options;
	  var opt;

	  for (var i=0, iLen=options.length; i<iLen; i++) {
		opt = options[i];

		if (opt.selected) {
		  result.push(opt.value || opt.text);
		}
	  }
	  return result;
	}
	var categories = getSelectValues(document.getElementById('communityCategory'));
	recipe.category = categories;
	

	//update community data
	var cr = database.ref('CommunityRecipes')
	cr.push(recipe).then(function(){
		//update community recipes list
		updateCommunityRecipes();
	});

		
   return 'yes';
}

