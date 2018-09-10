function clearRecipeForm(){
	document.getElementById('recipeMsg').innerHTML = 'Recipe "'+ document.getElementById('recipeName').value +
	'" Submitted<br />See it on the Plan Meals page';
	document.getElementById('recipeName').value = '';
	document.getElementById('newDirections').value = '';
	var categories = document.getElementById('category').children;
	for (var i = 0; i < categories.length; i++)
	{
		categories[i].selected = false;
	}	
	var node = document.getElementById('ingredients');
	while (node.firstChild)
	{
		node.removeChild(node.firstChild);
	}
}

document.getElementById('submitNewRecipe').addEventListener('click', function(){
	try
	{
		var checkSuccess = addNewRecipe()
		
		if(checkSuccess != 'yes')
			throw checkSuccess;
		
		//update recipe list
		updateRecipes();
		
		//Success message and input clear
		clearRecipeForm();
	}
	catch (err)
	{
		//handle the error passed down from addNewRecipes()
		document.getElementById('recipeMsg').innerHTML = 'Failed to Submit ' + document.getElementById('recipeName').value +
		'<br />' + err;
	}
});

document.getElementById('clearIngredientsInRecipe').addEventListener('click', function(){
	var node = document.getElementById('ingredients');
	while (node.firstChild)
	{
		node.removeChild(node.firstChild);
	}
	node.innerHTML = 'Get ingredients for your recipe from the ingredients bank';
});

//gets values from form inputs to add data to storage
function addNewRecipe(){
   
   //basic validation
   if(!document.getElementById('recipeName').value)
	   return 'You forgot to name it';
   
   //assure name is unique
   var isNotUnique = localData.recipes.find(function(obj){
	   return (document.getElementById('recipeName').value == obj.name);
   })
   if (isNotUnique)
	   return 'There is already a recipe with that name';
   
   if(!document.getElementById('newDirections').value)
	   document.getElementById('newDirections').value = "No directions supplied";
   
   var servesNumber;
   if(!document.getElementById('servesNewRecipe').value)
	   servesNumber = 1;
   else
	   servesNumber = document.getElementById('servesNewRecipe').value;
   
   //set up recipe obj
   var recipe = {
		'name': document.getElementById('recipeName').value,
		'category': [],
		'ingredients': [],
		'directions': document.getElementById('newDirections').value,
		'creationDate': Date.now(),
		'submitter': user.displayName,
		'serves': servesNumber
   }

   
   //loop through ingredients
	//make ingredient obj from html
	  //add obj to ingredients array in recipe obj
   var ingredientsDiv = document.getElementById('ingredients').children;
   
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
	var categories = getSelectValues(document.getElementById('category'));
	recipe.category = categories;
	
	//update local data
	localData.recipes.push(recipe);
	
	//update all data
	updateData();
	
	//update recipe list
		
   return 'yes';
}

//updates the recipes div with current data
function updateRecipes(category = "All", sortFn = "az", arrayOfRecipes = localData.recipes){

	//wipe recipes div clean
	var node = document.getElementById('recipes');
	while (node.firstChild)
	{
		node.removeChild(node.firstChild);
	}
	
	if (arrayOfRecipes <= 0)
	{
		var uhoh = document.createElement('h2');
		uhoh.innerHTML = "Uh oh. Looks like you need to add some recipes from" +
		" the community recipes list. Or add them yourself on the 'Add Recipe' tab";
		node.appendChild(uhoh);
		return;
	}
	
	//make new array of only the category specified
	var categorySelectedArray = arrayOfRecipes.filter(function(curVal){
		if (category == "All" || curVal.category.indexOf(category) >= 0)
			return curVal;
	})
    
	//sort the objects in the array by name alphabetically
	if (sortFn == "az")
		categorySelectedArray.sort(compareAlpha);
	else if (sortFn == "za")
		categorySelectedArray.sort(compareReverseAlpha);
	else if (sortFn == "submitter")
		categorySelectedArray.sort(compareSubmitter);
	else if (sortFn == "creationDate")
		categorySelectedArray.sort(compareDate);
	
	if (categorySelectedArray <= 0)
	{
		var uhoh = document.createElement('h2');
		uhoh.innerHTML = "Looks like you haven't added any recipes with this category";
		node.appendChild(uhoh);
		return;
	}
	
	//loop through data to add recipes to list
   categorySelectedArray.forEach(function(curVal,index,arra){
	    if (!curVal.toServe)
			curVal.toServe = 1;

		//make a div to populate recipes div
		var oneRecipe = document.createElement('div');
		oneRecipe.classList.add('oneRecipe');
		oneRecipe.dataset.json = JSON.stringify(curVal);
		oneRecipe.dataset.index = index;
		
		//put recipe name in div
		var nameHTML = document.createElement('h2');
		nameHTML.innerHTML = curVal.name;
		nameHTML.classList.add('oneRecipeName');
		oneRecipe.appendChild(nameHTML);
		
		//make div for number of people are served
		var numServedDiv = document.createElement('div');
		numServedDiv.innerHTML = "Serves " + curVal.serves;
		numServedDiv.classList.add('numServedDiv');
		oneRecipe.appendChild(numServedDiv);
	
		var infoDiv = document.createElement('div');
		
		//put submitter
		var submitter = document.createElement('div');
		submitter.classList.add('submitter');
		submitter.innerHTML = curVal.submitter;
		infoDiv.appendChild(submitter);
		
		//put the creation date
		var creationDate = document.createElement('div');
		creationDate.classList.add('creationDate');
		creationDate.innerHTML = "Last Updated:  " + new Date(curVal.creationDate).toLocaleString();
		infoDiv.appendChild(creationDate);
		
		oneRecipe.appendChild(infoDiv);
		
		//TODO if categories exist, list them

		//make UL for ingredients
		var ingredientsUL = document.createElement('ul');
		ingredientsUL.classList.add('oneRecipeIng');
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
		directionsDiv.classList.add('oneRecipeDirections');
		oneRecipe.appendChild(directionsDiv);
		
		var toServeLabel = document.createElement('label');
		toServeLabel.innerHTML = "To serve: ";
		oneRecipe.appendChild(toServeLabel);
		
		var toServeInput = document.createElement('input');
		toServeInput.setAttribute('type','number');
		toServeInput.setAttribute('min',1);
		toServeInput.classList.add("toServeInput");
		toServeInput.value = 1;
		toServeInput.addEventListener("change",function(){
			curVal.toServe = parseInt(this.value);
			oneRecipe.dataset.json = JSON.stringify(curVal);
		})
		oneRecipe.appendChild(toServeInput);
		
		
		//add the schedule button
		var addButton = document.createElement('input');
		addButton.setAttribute('type','button');
		addButton.value = "Schedule";
		addButton.addEventListener('click', scheduleRecipe);
		oneRecipe.appendChild(addButton);
		
		//remove from schedule
		var removeButton = document.createElement('input');
		removeButton.setAttribute('type', 'button');
		removeButton.value = "Unschedule";
		removeButton.addEventListener('click', unscheduleRecipe);
		oneRecipe.appendChild(removeButton);
		
		//TODO add the edit button
		var editButton = document.createElement('input');
		editButton.setAttribute('type','button');
		editButton.value = "Update";
		editButton.addEventListener('click', function(){
			openUpdateRecipeModal(curVal);
		})
		oneRecipe.appendChild(editButton);

		//TOD add the delete button
		var deleteButton = document.createElement('input');
		deleteButton.setAttribute('type','button');
		deleteButton.value = "X";
		deleteButton.style.backgroundColor = 'crimson';
		deleteButton.style.float = 'right';
		deleteButton.addEventListener('click', deleteRecipe);
		oneRecipe.appendChild(deleteButton);
		
		document.getElementById('recipes').appendChild(oneRecipe);
   });
}

document.getElementById('recipeSort').addEventListener('change', function(){
	sortSettings.user.sortBy = this.value;
	updateRecipes(sortSettings.user.category, this.value);
})

document.getElementById('categorySelect').addEventListener('change', function(){
	sortSettings.user.category = this.value
	updateRecipes(this.value, sortSettings.user.sortBy);
})

function openUpdateRecipeModal(recipeParam){
	updateBank(document.getElementById('ingredientBank'), localData.ingredientList, document.getElementById('ingredientSort').value);
	
	//fill name
	document.getElementById('recipeName').value = recipeParam.name;
	document.getElementById('recipeName').dataset.name = recipeParam.name;
	
	//fill categories
	var categoryChildren = document.getElementById('category').children;
	if (recipeParam.category)
	{
		for (category in categoryChildren)
		{
			if (!recipeParam.category.indexOf(categoryChildren[category].value))
			{
				categoryChildren[category].selected = true;
			}
			else
			{
				categoryChildren[category].selected = false;
			}
		}
	}
	
	//fill ingredients
	var ingredients = document.getElementById('ingredients');
	recipeParam.ingredients.forEach(function(ingObj){
		var string = ingObj.name + " (" + ingObj.unit + ")";
		placeInginIngredients(string, ingObj.amount);
	})
	
	//fill directions
	document.getElementById('newDirections').value = recipeParam.directions;
	
	document.getElementById('servesNewRecipe').value = parseInt(recipeParam.serves);
	
	//open update modal
	document.getElementById('updateNewRecipe').style.display = "inline-block";
	document.getElementById('newRecipeModal').style.display = "block";
}

document.getElementById('updateNewRecipe').addEventListener('click', function(){
	try
	{
		var checkSuccess = updateNewRecipe()
		
		if(checkSuccess != 'yes')
			throw checkSuccess;
		
		//update recipe list
		updateRecipes();
		
		//Success message and input clear
		clearRecipeForm();
	}
	catch (err)
	{
		//handle the error passed down from addNewRecipes()
		document.getElementById('recipeMsg').innerHTML = 'Failed to Submit ' + document.getElementById('recipeName').value +
		'<br />' + err;
	}
})

function updateNewRecipe(){
   
   //basic validation
   if(!document.getElementById('recipeName').value)
	   return 'You forgot to name it';
   
   if(!document.getElementById('newDirections').value)
	   document.getElementById('newDirections').value = "No directions supplied";
   
   var servesNumber;
   if(!document.getElementById('servesNewRecipe').value)
	   servesNumber = 1;
   else
	   servesNumber = document.getElementById('servesNewRecipe').value;
   
   //set up recipe obj
   var recipe = {
		'name': document.getElementById('recipeName').value,
		'category': [],
		'ingredients': [],
		'directions': document.getElementById('newDirections').value,
		'creationDate': Date.now(),
		'submitter': user.displayName,
		'serves': servesNumber
   }

   
   //loop through ingredients
	//make ingredient obj from html
	  //add obj to ingredients array in recipe obj
   var ingredientsDiv = document.getElementById('ingredients').children;
   
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
	var categories = getSelectValues(document.getElementById('category'));
	recipe.category = categories;

	//find the index to the recipe
    var recipeIndex = localData.recipes.findIndex(function(obj){
       return (document.getElementById('recipeName').dataset.name == obj.name);
    })
	
	//update local data
    localData.recipes[recipeIndex] = recipe;
	
	//update server data
	updateData();
	
    return 'yes';
}