/*
*
*
*
*
*/




/*
* Adds event listener to form submit button
* @param1: data object holding ingredients
* @param2: html for new ingredient form submit button
* @param3: html for new ingredient unit
* @param4: html for new ingredient name
* @param5: html for msg for validation
*/
function communitySetup(ingArr, formBtn, newIngHTML, newUnitHTML, msg)
{
	formBtn.addEventListener('click', function(){
		if(addNewIngredientToList(ingArr, newIngHTML, newUnitHTML))
		{	
			msg.innerHTML = "";
			updateCommunityBank(document.getElementById('communityIngredientBank'), localData.ingredientList);
		}
		else
			msg.innerHTML = "Ingredient already in bank";
	});
}

/*
	Adds the new form ingredient data to a new object in the ingredient array
	@param1: ingredient list object
	@param2: html for ingredient name
	@param3: html for ingredient unit
*/
function addNewIngredientToList(ingArr, newIngHTML, newUnitHTML){
	var ingredient = {
		'name': newIngHTML.value,
		'unit': newUnitHTML.value
	}
	
	//check that ingredient isn't already found in data
	var alreadyIn = false;
	ingArr.forEach(function(curObj){
		if(curObj.name.toLowerCase() == ingredient.name.toLowerCase() && 
		   curObj.unit.toLowerCase() == ingredient.unit.toLowerCase())
			alreadyIn = true;
	})
	if(alreadyIn)
		return false;
	
	localData.ingredientList.push(ingredient);
	updateData();
	
	return true;
}

/*
	@param1: html div which will contain the ingredients
	@param2: 
*/
function updateCommunityBank(bankHTML, ingArr, sortFn = 'az'){
	
	//sort the objects in the array by name alphabetically
	if (ingArr && sortFn == 'az')
		ingArr.sort(compareAlpha);
	else if (ingArr && sortFn == 'za')
		ingArr.sort(compareReverseAlpha);
	
	//setup initial bank html
	if (ingArr.length > 0)
		bankHTML.innerHTML = '';
	else
		bankHTML.innerHTML = "You have no ingredients in your bank";
	
	//loop through ingredients in data to add to bank
	ingArr.forEach(function(curObj, ind, arr){
		
		//builds the ingredients div
		var ingDiv = document.createElement('div');
		ingDiv.classList.add('oneCommunityIngredient');
		ingDiv.setAttribute('draggable', true);
		ingDiv.setAttribute('ondragstart', "ondragstart_HandlerCommunity(event)");
		
		//sets up the text for the ingredient
		var id = curObj.name + ' ' + '('+curObj.unit+')'
		var textNode;
		
		//if a unit was chosen
		if(curObj.unit !== '-none-')
		{
			//the text and the id will be the same
			textNode = document.createTextNode(id);
			ingDiv.setAttribute('id', id);
			ingDiv.appendChild(textNode);
		}
		
		//if no unit was chosen
		else 
		{
			//we set the id with '-none-' as the unit 
			ingDiv.setAttribute('id', id);			
			
			//then get a cleaner version for our text
			var text = curObj.name;
			textNode = document.createTextNode(text);
			ingDiv.appendChild(textNode);
		}

		
		//creates a remove button with its functionality in
		//the ingredients bank
		var removeBtn = document.createElement('input');
		removeBtn.setAttribute('type', 'button');
		removeBtn.value = 'x';
		removeBtn.classList.add('removeIngFromRecipe');
		removeBtn.addEventListener('click', function(e){
			console.log(ingDiv);
			ingDiv.parentElement.removeChild(ingDiv);
			ingArr.splice(ind, 1);
			localData.ingredientList = ingArr;
			updateData();
			
			
			
			if(ingArr.length <= 0)
			{
				bankHTML.innerHTML = "You have no ingredients in your bank";
			}
		})
		ingDiv.appendChild(removeBtn);
		
		//creates a add button with its functionality in 
		//the ingredients bank
		var addBtn = document.createElement('input');
		addBtn.setAttribute('type', 'button');
		addBtn.value = '+';
		addBtn.classList.add('addIngToRecipe');
		addBtn.addEventListener('click', function(e){
			placeInginCommunityIngredients(ingDiv.id);
		})
		ingDiv.appendChild(addBtn);
		
		//add the ingredient to the bank
		bankHTML.appendChild(ingDiv);
	})
}

//DRAG AND DROP SECTION

var lastParent;
function ondragstart_HandlerCommunity(ev){
	ev.dataTransfer.setData("text/plain", ev.target.id);
	lastParent = ev.target.parentElement.id;
}

function ondrop_HandlerCommunity(ev){
	ev.preventDefault();

	var data = ev.dataTransfer.getData("text");
	placeInginCommunityIngredients(data);
};

function ondragover_HandlerCommunity(ev){
	ev.preventDefault();
};

function placeInginCommunityIngredients(id){
	
		if(document.getElementById('communityIngredients').children.length == 0)
		{
			document.getElementById('communityIngredients').innerHTML = '';
		}

		var div = document.createElement('div');
		div.classList.add('oneCommunityIngredient');
		div.setAttribute('id', id);
		div.innerHTML = document.getElementById(id).innerHTML;	
		
		//add amount input
		var amountIn = document.createElement('input');
		amountIn.setAttribute('type', 'number');
		amountIn.setAttribute('step', 0.25);
		amountIn.setAttribute('value', 1);
		amountIn.classList.add('amountInput');
		div.appendChild(amountIn);
		
		//remove ingredient from recipe
		div.children[0].addEventListener('click', function(e){
			this.parentElement.parentElement.removeChild(div);
			if(document.getElementById('communityIngredients').children.length == 0)
			{
				document.getElementById('communityIngredients').innerHTML = 'Get ingredients for your recipe from the ingredients bank';
			}
		});
		div.removeChild(div.children[1]);
		
		document.getElementById('communityIngredients').appendChild(div);
}

/*
* SCRIPT MAIN FUNCTION
*/
function communityIngredientBankMain()
{
	communitySetup(localData.ingredientList,							            //ingredients array     //@param1
		  document.getElementById('submitNewCommunityIngredient'),      //submit button			//@param2
		  document.getElementById('newCommunityIngredient'),	        //new ingredient name	//@param3
		  document.getElementById('communityUnit'), 					//new ingredient unit	//@param4
		  document.getElementById('communityIngredientMsg')			    //err msg				//@param5
		  );
		  
	updateCommunityBank(document.getElementById('communityIngredientBank'), localData.ingredientList, 'az');
}

document.getElementById('searchCommunityIngInput').addEventListener('input', function(){
	activeSearchCommunityIng(this.value);
})
function activeSearchCommunityIng(searchCriteria){
	
	var searchCriteriaArr = searchCriteria.trim().split('').map(function (ch, i, array) { return ch == ' ' ? array[i - 1] + ' ' : ch });
	var numOfLetters = searchCriteriaArr.length;
	var results = [];
	
	//data loop
	localData.ingredientList.forEach(function(ingObj, ind, arr){
		var testPass = true;
		var testString = ingObj.name + ' (' + ingObj.unit + ')'; 	 
		var testArr = testString.trim().split('').map(function (ch, i, array) { return ch == ' ' ? array[i - 1] + ' ' : ch });
		for (var i = 0; i < numOfLetters; i++)
		{
			if(testArr[i].toUpperCase() != searchCriteriaArr[i].toUpperCase())
				testPass = false;
		}
		if(testPass)
			results.push(ingObj);
	})
	updateCommunityBank(document.getElementById('communityIngredientBank'), results, document.getElementById('ingredientSort').value);
}

document.getElementById('communityIngredientSort').addEventListener('change', function(){
	updateCommunityBank(document.getElementById('communityIngredientBank'), localData.ingredientList, document.getElementById('communityIngredientSort').value);
});
