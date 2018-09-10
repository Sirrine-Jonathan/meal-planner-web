function clearCommunityRecipeForm(){
	document.getElementById('communityRecipeMsg').innerHTML = 'Recipe "'+ document.getElementById('recipeName').value +
	'" Submitted<br />See it on the Home Page';
	document.getElementById('communityRecipeName').value = '';
	document.getElementById('newCommunityDirections').value = '';
	var categories = document.getElementById('communityCategory').children;
	for (var i = 0; i < categories.length; i++)
	{
		categories[i].selected = false;
	}
	var node = document.getElementById('communityIngredients');
	while (node.firstChild)
	{
		node.removeChild(node.firstChild);
	}
}


document.getElementById('submitNewCommunityRecipe').addEventListener('click', function(){
	try
	{
		var checkSuccess = addNewCommunityRecipe();
		
		if(checkSuccess != 'yes')
			throw checkSuccess;
		
		//update recipe list
		updateCommunityRecipes();
		
		//Success message and input clear
		clearCommunityRecipeForm();
				
	}
	catch (err)
	{
		//handle the error passed down from addNewRecipes()
		document.getElementById('communityRecipeMsg').innerHTML = 'Failed to Submit ' + document.getElementById('recipeName').value +
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

function addNewCommunityRecipe(){
   
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
   
   var servesNumber;
   if(!document.getElementById('servesCommunityRecipe').value)
	   servesNumber = 1;
   else
	   servesNumber = document.getElementById('servesCommunityRecipe').value;
   
   //set up recipe obj
   var recipe = {
		'name': document.getElementById('communityRecipeName').value,
		'category': [],
		'ingredients': [],
		'directions': document.getElementById('newCommunityDirections').value,
		'creationDate': Date.now(),
		'submitter': user.displayName,
		'serves': servesNumber
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