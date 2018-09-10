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
function setup(ingArr, formBtn, newIngHTML, newUnitHTML, msg)
{
	formBtn.addEventListener('click', function(){
		if(addNewIngredientToList(ingArr, newIngHTML, newUnitHTML))
		{	
			msg.innerHTML = "";
			updateBank(document.getElementById('ingredientBank'), localData.ingredientList);
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
function updateBank(bankHTML, ingArr, sortFn = 'az'){
	
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
		ingDiv.classList.add('oneIngredient');
		ingDiv.setAttribute('draggable', true);
		ingDiv.setAttribute('ondragstart', "ondragstart_Handler(event)");
		
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
			placeInginIngredients(ingDiv.id);
		})
		ingDiv.appendChild(addBtn);
		
		//add the ingredient to the bank
		bankHTML.appendChild(ingDiv);
	})
}

//DRAG AND DROP SECTION

var lastParent;
function ondragstart_Handler(ev){
	ev.dataTransfer.setData("text/plain", ev.target.id);
	lastParent = ev.target.parentElement.id;
}

function ondrop_Handler(ev){
	ev.preventDefault();

	var data = ev.dataTransfer.getData("text");
	placeInginIngredients(data);
};

function ondragover_Handler(ev){
	ev.preventDefault();
};

function placeInginIngredients(id, amount = 1){
	
		if(document.getElementById('ingredients').children.length == 0)
		{
			document.getElementById('ingredients').innerHTML = '';
		}

		var div = document.createElement('div');
		div.classList.add('oneIngredient');
		div.setAttribute('id', id);
		div.innerHTML = document.getElementById(id).innerHTML;	
		
		//add amount input
		var amountIn = document.createElement('input');
		amountIn.setAttribute('type', 'number');
		amountIn.setAttribute('step', 0.25);
		amountIn.setAttribute('value', amount);
		amountIn.classList.add('amountInput');
		div.appendChild(amountIn);
		
		//remove ingredient from recipe
		div.children[0].addEventListener('click', function(e){
			this.parentElement.parentElement.removeChild(div);
			if(document.getElementById('ingredients').children.length == 0)
			{
				document.getElementById('ingredients').innerHTML = 'Get ingredients for your recipe from the ingredients bank';
			}
		});
		div.removeChild(div.children[1]);
		
		document.getElementById('ingredients').appendChild(div);
}

/*
* SCRIPT MAIN FUNCTION
*/
function ingredientBankMain()
{
	setup(localData.ingredientList,							//ingredients array     //@param1
		  document.getElementById('submitNewIngredient'),   //submit button			//@param2
		  document.getElementById('newIngredient'),	        //new ingredient name	//@param3
		  document.getElementById('unit'), 					//new ingredient unit	//@param4
		  document.getElementById('ingredientMsg')			//err msg				//@param5
		  );
		  
	updateBank(document.getElementById('ingredientBank'), localData.ingredientList, 'az');
}

document.getElementById('searchIngInput').addEventListener('input', function(){
	activeSearchIng(this.value);
})
function activeSearchIng(searchCriteria){
	
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
	updateBank(document.getElementById('ingredientBank'), results, document.getElementById('ingredientSort').value);
}

document.getElementById('ingredientSort').addEventListener('change', function(){
	updateBank(document.getElementById('ingredientBank'), localData.ingredientList, document.getElementById('ingredientSort').value);
});
