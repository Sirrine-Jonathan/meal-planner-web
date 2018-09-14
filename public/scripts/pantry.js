document.getElementById('submitNewPantryItem').addEventListener('click', function(){
	
	var pantryItem = {
		'name': document.getElementById('pantryItemName').value,
		'correspondingIngredient': document.getElementById('correspondingIngredient').value,
		'unit': document.getElementById('pantryItemUnit').value,
		'servingSizeUnit': document.getElementById('pantryItemServingSizeUnit').value,
		'amount': document.getElementById('pantryItemAmount').value,
		'servingSize': document.getElementById('servingSize').value,
		'store': document.getElementById('pantryItemStore').value,
		'price': document.getElementById('pantryItemPrice').value,
		'sugar': document.getElementById('sugar').value,
		'protein': document.getElementById('protein').value,
		'calories': document.getElementById('calories').value,
		'carbs': document.getElementById('carbs').value,
		'fat': document.getElementById('fat').value,
		'amountInPantry': 1
	}
	
	if(validatePantryItem(pantryItem))
	{
	    if (!localData.pantryItemList.noBarcode){
	        localData.pantryItemList.noBarcode = [];
        }
		localData.pantryItemList.noBarcode.push(pantryItem);
	
		//save database
		updateData();
		
		//update HTML
		updatePantryTotals();
		updatePantry();
		document.getElementById('pantryItemMsg').innerHTML = "Pantry Item Submitted to Pantry";
		clearPantryItemForm()
	}
	else{
		document.getElementById('pantryItemMsg').innerHTML = "Missing Items";
	}
});

function validatePantryItem(item){
	if(!item.name)
		return false;
	if(!item.correspondingIngredient)
		return false;
	if(!item.unit)
		return false;
	if(!item.amount)
		return false;
	return true;
}

function clearPantryItemForm(){
	document.getElementById('pantryItemName').value = '';
	document.getElementById('correspondingIngredient').value = '';
	document.getElementById('pantryItemUnit').value = '';
	document.getElementById('pantryItemServingSizeUnit').value = '';
	document.getElementById('pantryItemAmount').value = '';
	document.getElementById('servingSize').value = '';
	document.getElementById('pantryItemStore').value = '';
	document.getElementById('pantryItemPrice').value = '';
	document.getElementById('sugar').value = '';
	document.getElementById('protein').value = '';
	document.getElementById('calories').value = '';
	document.getElementById('carbs').value = '';
	document.getElementById('fat').value = '';
}

function updatePantry(sortFn = 'az', dataArr = localData.pantryItemList){
	
	//wipe select clean`
	var node = document.getElementById('pantryItems');
	while (node.firstChild)
	{
		node.removeChild(node.firstChild);
	}

	// temp rewrite code
    if((!localData.pantryItemList.noBarcode) || (!localData.pantryItemList.barcode)) {
        if (!localData.pantryItemList.noBarcode) {
            localData.pantryItemList.noBarcode = {};
            for (item in localData.pantryItemList) {
                if (parseFloat(item) < 1000) {
                    localData.pantryItemList.noBarcode.push(localData.pantryItemList[item]);
                    delete localData.pantryItemList[item];
                }
            }

        }
        if (!localData.pantryItemList.barcode) {
            localData.pantryItemList.barcode = {};
            for (item in localData.pantryItemList) {
                if (parseFloat(item) >= 1000) {
                    localData.pantryItemList.barcode[item] = localData.pantryItemList[item];
                    delete localData.pantryItemList[item];
                }
            }
        }
        console.log(localData.pantryItemList);

        //save database
        updateData();
    }
	
	//sort array
	//sort the objects in the array by name alphabetically
	let pantryArr = [];
	for (item in localData.pantryItemList.noBarcode){
		pantryArr.push(localData.pantryItemList.noBarcode[item]);
	}
	for (item in localData.pantryItemList.barcode){
	    pantryArr.push(localData.pantryItemList.barcode[item])
    }

	if (pantryArr && sortFn == 'az')
		pantryArr.sort(compareAlpha);
	else if (pantryArr && sortFn == 'za')
		pantryArr.sort(compareReverseAlpha);	
	
	
	pantryArr.forEach(function(curItem){
		
		//make div for pantry item
		let div = document.createElement('div');
		div.classList.add('pantryItem');
		div.dataset.json = JSON.stringify(curItem);
			//add basic header
			let header = document.createElement('div');
			header.classList.add('pantryItemHeaderDiv');
			
				let amountDiv = document.createElement('div');
					let amtLabel = document.createElement('label');
					amtLabel.innerHTML = "Quantity";
					amtLabel.classList.add('amtLabel');
					
					let amountIn = document.createElement('input');
					amountIn.classList.add('pantryItemAmountIn');
					amountIn.setAttribute('type','number');
					amountIn.setAttribute('min', 0);
					amountIn.value = curItem.amountInPantry;
					amountIn.addEventListener('change', function(e){
						
						
						//find the index of the current pantry item by comparing it to storage
						var index;
						localData.pantryItemList.forEach(function(curObj, ind, arr){
							var testString = JSON.stringify(curObj);
							if(div.dataset.json == testString)
								index = ind;
						});
						
						//change amount in pantry
						var amountParsed = parseFloat(this.value);
						if(isNaN(amountParsed))
							amountParsed = 0;
						
						//Change style to reflect state
						//if in pantry turn border red
						if(curItem.amountInPantry <= 0)
						{
							//change input styles to reflect status
							this.style.border = "2px solid red";
						}
						//if not in pantry set border to default
						else
						{
							//change input styles to reflect status
							this.style.border = "inherit";
						}

						if(index >= 0)
						{
							div.dataset.json = JSON.stringify(curItem);
							localData.pantryItemList[index].amountInPantry = amountParsed;
							updateData();
							updatePantry();
							updatePantryTotals();
						}
					})
					amountDiv.appendChild(amtLabel);
					amountDiv.appendChild(amountIn);
				header.appendChild(amountDiv);
				
				var name = document.createElement('span');
				name.innerHTML = curItem.name;
				header.appendChild(name);
				
				var detailsBtn = document.createElement('input');
				detailsBtn.setAttribute('type', 'button');
				var down = decodeHtml('&#8681;');
				var up = decodeHtml('&#8679;');
				detailsBtn.value = down;
				detailsBtn.classList.add('pantryItemShowDetailsBtn');
				detailsBtn.addEventListener('click',function(){
					var itemDiv = this.parentElement.parentElement;
					var bodyDiv = itemDiv.getElementsByClassName('pantryItemBodyDiv')[0];
					if(bodyDiv.style.display == 'block')
					{
						bodyDiv.style.display = 'none';
						this.value = "Show Details";
						this.value = down;
					}
					else
					{
						bodyDiv.style.display = 'block';
						this.value = "Hide Details";
						this.value = up;
					}
				})
				header.appendChild(detailsBtn);
			div.appendChild(header);
			
			var body = document.createElement('div');
			body.classList.add('pantryItemBodyDiv');
			
			//info div
			var infoDiv = document.createElement('div');
			infoDiv.classList.add('pantryItemInfoDiv');
			
			//add info to div
			var colorSwitcher = 1;
			for (var prop in curItem) {
				if (curItem.hasOwnProperty(prop) && prop != 'amountInPantry') {
					
					var color = (colorSwitcher % 2 == 0) ? '#ffeeff':'#cadef7';
					var row = document.createElement('div');
					
					var label = document.createElement('label');
					label.innerHTML = prop + ': ';
					label.classList.add('pantryItemLabel');
					row.appendChild(label);
					
					var span = document.createElement('span');
					if (prop == 'price')
						span.innerHTML = '$' + curItem[prop];
					else
						span.innerHTML = curItem[prop];
					span.style.float = 'right';
					span.classList.add('pantryItem'+prop.toUpperCase()+'Display');
					row.appendChild(span);
					row.style.backgroundColor = color;
					colorSwitcher++;
					infoDiv.appendChild(row);
				}
			}	
			body.appendChild(infoDiv);
			
			//functions button div
			var fnDiv = document.createElement('div');
			fnDiv.classList.add('pantryFnDiv');

				//edit
				var editBtn = document.createElement('input');
				editBtn.setAttribute('type','button');
				editBtn.value = "Edit";
				editBtn.dataset.status = 'edit';
				editBtn.addEventListener('click', editPantryItem)
				fnDiv.appendChild(editBtn);
				
				//delete
				var deleteBtn = document.createElement('input');
				deleteBtn.setAttribute('type', 'button');
				deleteBtn.value = "Delete";
				deleteBtn.addEventListener('click', deletePantryItem);
				fnDiv.appendChild(deleteBtn);
			body.appendChild(fnDiv);
			
		div.appendChild(body);
		document.getElementById('pantryItems').appendChild(div);	
	})
}

document.getElementById('searchPantryItemsInput').addEventListener('input', function(){
	activeSearch(this.value)
})

function activeSearch(searchCriteria){
	
	var searchCriteriaArr = searchCriteria.trim().split('').map(function (ch, i, array) { return ch == ' ' ? array[i - 1] + ' ' : ch });
	var numOfLetters = searchCriteriaArr.length;
	var results = [];
	
	//data loop
	localData.pantryItemList.forEach(function(pantryObj, ind, arr){
		var testPass = true;
		var testString = pantryObj.name; 	 
		var testArr = testString.trim().split('').map(function (ch, i, array) { return ch == ' ' ? array[i - 1] + ' ' : ch });
		for (var i = 0; i < numOfLetters; i++)
		{
			if(testArr[i].toUpperCase() != searchCriteriaArr[i].toUpperCase())
				testPass = false;
		}
		if(testPass)
			results.push(pantryObj);
	})
	
	updatePantry('az', results);
}

document.getElementById('pantryItemSort').addEventListener('change', function() {
	var sortCue = this.value;
	updatePantry(sortCue);
})

document.getElementById('openNewPantryItemForm').addEventListener('click', function(){
	document.getElementById('pantryModal').style.display = "block";
	document.getElementById('pantryItemMsg').innerHTML = "*required fields";
	updateIngredientsDropdown(document.getElementById('correspondingIngredient'));
	document.getElementById('ingredientMsgOnPantryForm').innerHTML = "";
});
function updateIngredientsDropdown(node){
	
	//whip select clean
	while (node.firstChild)
	{
		node.removeChild(node.firstChild);
	}
	//populate correspondingIngredient select
	localData.ingredientList.forEach(function(curIng){
		var option = document.createElement('option');
		option.value = curIng.name;
		option.innerHTML = curIng.name + "  (" + curIng.unit + ")";
		node.appendChild(option);
	})
};

document.getElementById('closePantryModal').addEventListener('click', function(){
	document.getElementById('pantryModal').style.display = "none";
});

window.onclick = function(event){
	if (event.target == document.getElementById('pantryModal')) {
		document.getElementById('pantryModal').style.display = "none";
	}
	if (event.target == document.getElementById('newCommunityModal')) {
		document.getElementById('newCommunityModal').style.display = "none";
		//TODO update & submit button hides
	}
	if (event.target == document.getElementById('newRecipeModal')) {
		document.getElementById('newRecipeModal').style.display = "none";
		document.getElementById('submitNewRecipe').style.display = "none";
		document.getElementById('updateNewRecipe').style.display = "none";
	}
}

function deletePantryItem(){
	var div = this.parentElement.parentElement.parentElement;
	var index;
	localData.pantryItemList.forEach(function(curObj, ind, arr){
		var testString = JSON.stringify(curObj);
		if(div.dataset.json == testString)
			index = ind;
	})
	if(index >= 0)
		localData.pantryItemList.splice(index, 1);
	
	updateData(updatePantry);
}

function editPantryItem(){
	if(this.dataset.status == 'edit')
	{		
		//state changes
			//inputs
		var itemBodyDiv = this.parentElement.parentElement;
		var itemDiv = itemBodyDiv.parentElement;
		var itemObj = JSON.parse(itemDiv.dataset.json);
		var infoDiv = itemDiv.getElementsByClassName('pantryItemInfoDiv')[0];
		itemDiv.getElementsByClassName('pantryItemShowDetailsBtn')[0].setAttribute('disabled', true);
		
		//whipeInfoDivClean
		while (infoDiv.firstChild)
		{
			infoDiv.removeChild(infoDiv.firstChild);
		}
		
		var colorSwitcher = 1;
		for (var prop in itemObj) {
			
			if (itemObj.hasOwnProperty(prop) && prop != 'amountInPantry') {
				
				var color  = (colorSwitcher % 2 == 0) ? '#ffeeff':'#cadef7'; 
				var row = document.createElement('div');
				row.style.verticalAlign;
				
				var label = document.createElement('label');
				label.innerHTML = prop + ': ';
				label.classList.add('pantryItemLabel');
				row.appendChild(label);
				
				if (prop == 'correspondingIngredient')
				{
					var input = document.createElement('select');
					input.classList.add('unitSelect');
					updateIngredientsDropdown(input);
				}
				else if (prop == 'servingSizeUnit')
				{
					var input = document.createElement('select');
					input.classList.add('unitSelect');
					setupUnitSelects(unitsArr, input, true);
				}
				else if (prop == 'unit')
				{
					var input = document.createElement('select');
					input.classList.add('unitsSelect');
					setupUnitSelects(unitsArr, input, true);
				}
				else
				{
					var input = document.createElement('input');
				}
				
				//apply to all inputs
				input.style.float = 'right';
				input.style.width = "30%";
				input.style.fontSize = '15px';
				
				input.classList.add('pantryItem'+prop.toUpperCase()+'Input');
				input.value = itemObj[prop];
				
				row.appendChild(input);
				row.style.backgroundColor = color;
				colorSwitcher++;
				infoDiv.appendChild(row);
			}
		}	
		
			//button
		this.value = "Save";
		this.dataset.status = 'save';
	}
	else if(this.dataset.status == 'save')
	{
		//save input states to corresponding pantry item obj
		var itemBodyDiv = this.parentElement.parentElement;
		var itemDiv = itemBodyDiv.parentElement;
		var itemObj = JSON.parse(itemDiv.dataset.json);
		var infoDiv = itemDiv.getElementsByClassName('pantryItemInfoDiv')[0];
		itemDiv.getElementsByClassName('pantryItemShowDetailsBtn')[0].setAttribute('disabled', false);
		
		//SAVE
		
		//check if there is a serving size unit... can't remember why. just do it. 
		var servingSizeUnit;
		if(infoDiv.getElementsByClassName('pantryItemSERVINGSIZEUNITInput')[0])
			servingSizeUnit = infoDiv.getElementsByClassName('pantryItemSERVINGSIZEUNITInput')[0].value;
		else
			servingSizeUnit = null;
		
		var tempObj = {
			'name': infoDiv.getElementsByClassName('pantryItemNAMEInput')[0].value,
			'correspondingIngredient': infoDiv.getElementsByClassName('pantryItemCORRESPONDINGINGREDIENTInput')[0].value,
			'amountInPantry': itemObj.amountInPantry,
			'amount': infoDiv.getElementsByClassName('pantryItemAMOUNTInput')[0].value,
			'calories': infoDiv.getElementsByClassName('pantryItemCALORIESInput')[0].value,
			'carbs': infoDiv.getElementsByClassName('pantryItemCARBSInput')[0].value,
			'fat': infoDiv.getElementsByClassName('pantryItemFATInput')[0].value,
			'price': infoDiv.getElementsByClassName('pantryItemPRICEInput')[0].value,
			'protein': infoDiv.getElementsByClassName('pantryItemPROTEINInput')[0].value,
			'servingSize': infoDiv.getElementsByClassName('pantryItemSERVINGSIZEInput')[0].value,
			'store': infoDiv.getElementsByClassName('pantryItemSTOREInput')[0].value,
			'sugar': infoDiv.getElementsByClassName('pantryItemSUGARInput')[0].value,
			'unit': infoDiv.getElementsByClassName('pantryItemUNITInput')[0].value,
			'servingSizeUnit': servingSizeUnit
		}
		
		//update localData 
		var index;
		localData.pantryItemList.forEach(function(curObj, ind, arr){
			var testString = JSON.stringify(curObj);
			if(itemDiv.dataset.json == testString)
				index = ind;
		})
		if(index >= 0)
		{
			
			itemDiv.dataset.json = JSON.stringify(tempObj);
			localData.pantryItemList[index] = tempObj;
			updateData();
			updatePantry();
			console.log(localData.pantryItemList);
		}
		
			//button
		this.value = "Edit";
		this.dataset.status = 'edit';
	}
}

//new ingredient on new pantry item form
function pantryMain()
{
	setupTwo(localData.ingredientList,									//ingredients array     //@param1
		  document.getElementById('submitNewIngredientOnPantryForm'),   //submit button			//@param2
		  document.getElementById('newIngredientOnPantryForm'),	        //new ingredient name	//@param3
		  document.getElementById('unitOnPantryForm'), 					//new ingredient unit	//@param4
		  document.getElementById('ingredientMsgOnPantryForm')			//err msg				//@param5
		  );
		  
	
}
pantryMain()

function setupTwo(ingArr, formBtn, newIngHTML, newUnitHTML, msg)
{
	formBtn.addEventListener('click', function(){
		if(addNewIngredientToList(ingArr, newIngHTML, newUnitHTML))
		{	
			msg.innerHTML = "";
			updateBank(document.getElementById('ingredientBank'), ingArr);
			updateIngredientsDropdown(document.getElementById('correspondingIngredient'));
			msg.innerHTML = "Ingredient added to bank";
		}
		else
			msg.innerHTML = "Ingredient already in bank";
	});
}

function updatePantryTotals(){
	var totalsArr = [0, 0, 0, 0, 0, 0];
    var propsArr = ['sugar', 'protein', 'calories', 'carbs', 'fat', 'price'];
	
	//loops through each pantry item
	let pantryList = localData.pantryItemList;
	for (item in pantryList){
		let curItem = pantryList[item];
		for (let i = 0; i < 6; i++){
			if (!isNaN(parseInt(curItem.amountInPantry)) && !isNaN(parseFloat(curItem[propsArr[i]])))
			{
                let quantity = parseFloat(curItem.amountInPantry);
                let propAmount = parseFloat(curItem[propsArr[i]]);
                totalsArr[i] += quantity * propAmount;
			}
		}
	}
		
		//handle store info
		
	//update HTML
	document.getElementById('sugarTotal').innerHTML = totalsArr[0];
	document.getElementById('proteinTotal').innerHTML = totalsArr[1];
	document.getElementById('caloriesTotal').innerHTML = totalsArr[2];
	document.getElementById('carbsTotal').innerHTML = totalsArr[3];
	document.getElementById('fatTotal').innerHTML = totalsArr[4];
	document.getElementById('storeTotalPrice').innerHTML = totalsArr[5].toFixed(2);
	
}