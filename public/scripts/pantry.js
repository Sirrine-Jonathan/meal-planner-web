document.getElementById('submitNewPantryItem').addEventListener('click', function(){
	
	let pantryItem = {

		// strings
		'name': getValueFromElement(document.getElementById('pantryItemName')),
		'correspondingIngredient': getValueFromElement(document.getElementById('correspondingIngredient')),
		'unit': getValueFromElement(document.getElementById('pantryItemUnit')),
		'servingSizeUnit': getValueFromElement(document.getElementById('pantryItemServingSizeUnit')),
        'store': getValueFromElement(document.getElementById('pantryItemStore')),

		// floats
		'amount': getFloatFromElement(document.getElementById('pantryItemAmount')),
		'servingSize': getFloatFromElement(document.getElementById('servingSize')),
		'price': getFloatFromElement(document.getElementById('pantryItemPrice')),
		'sugar': getIntFromElement(document.getElementById('sugar')),
		'protein': getIntFromElement(document.getElementById('protein')),
		'calories': getIntFromElement(document.getElementById('calories')),
		'carbs': getIntFromElement(document.getElementById('carbs')),
		'fat': getIntFromElement(document.getElementById('fat')),
		'amountInPantry': parseInt(1)
	};

	function getValueFromElement(el){
		if (el && el.value !== ""){
			return el.value.toString();
		}
		return null;
	}

	function getFloatFromElement(el){
		if (el && el.value !== ""){
			return parseFloat(el.value);
		}
		return null;
	}

	function getIntFromElement(el){
		if (el && el.value !== ""){
			return parseInt(el.value);
		}
		return null;
	}
	
	if(validatePantryItem(pantryItem))
	{
        let length = 0;
	    let list = localData.pantryItemList;
	    for (i in list){
	    	length++;
		}
		localData.pantryItemList[length] = pantryItem;
	
		//save database
		updateData();
		
		//update HTML
		updatePantryTotals();
		updatePantry();
		document.getElementById('pantryItemMsg').innerHTML = "Pantry Item Submitted to Pantry";
		clearPantryItemForm();
		console.log(localData);
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

function updatePantry(sortFn = 'az', dataArr){
	
	//wipe select clean`
	let node = document.getElementById('pantryItems');
	while (node.firstChild)
	{
		node.removeChild(node.firstChild);
	}

	// change array data to obj
    if(localData.pantryItemList.length != undefined) {

        // transfer array data to obj
        let data = localData.pantryItemList;
        localData.pantryItemList = {};
        data.forEach((each, ind, arr) => {
            localData.pantryItemList[ind] = each;
        });

        //save database
        updateData();
    }
	
	//sort array
	//sort the objects in the array by name alphabetically
	let pantryArr = [];
	if (!dataArr) {
        for (item in localData.pantryItemList) {
            pantryArr.push(localData.pantryItemList[item]);
        }
    } else {
		pantryArr = dataArr;
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
                        let index = null;
                        for (item in localData.pantryItemList){
                            let testString = JSON.stringify(localData.pantryItemList[item]);
                            if (div.dataset.json === testString) {
                                index = item;
                                break;
                            }
                        }


						//change amount in pantry
						let amountParsed = parseFloat(this.value);
						if(isNaN(amountParsed))
							amountParsed = 0;

						if(index >= 0)
						{
							div.dataset.json = JSON.stringify(curItem);
							localData.pantryItemList[set][index].amountInPantry = amountParsed;
							updateData();
							updatePantry();
							updatePantryTotals();
						}

                        //Change style to reflect state
                        //if in pantry turn border red
                        if(curItem.amountInPantry <= 0)
                        {
                            //change input styles to reflect status
                            div.style.border = "2px solid red";
                        }
                        //if not in pantry set border to default
                        else
                        {
                            //change input styles to reflect status
                            div.style.border = "inherit";
                        }
					});
					amountDiv.appendChild(amtLabel);
					amountDiv.appendChild(amountIn);
				header.appendChild(amountDiv);
				
				let name = document.createElement('span');
				name.innerHTML = curItem.name;
				header.appendChild(name);
				
				let detailsBtn = document.createElement('input');
				detailsBtn.setAttribute('type', 'button');
				let down = decodeHtml('&#8681;');
				let up = decodeHtml('&#8679;');
				detailsBtn.value = down;
				detailsBtn.classList.add('pantryItemShowDetailsBtn');
				detailsBtn.addEventListener('click',function(){
					let itemDiv = this.parentElement.parentElement;
					let bodyDiv = itemDiv.getElementsByClassName('pantryItemBodyDiv')[0];
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
			
			let body = document.createElement('div');
			body.classList.add('pantryItemBodyDiv');
			
			//info div
			let infoDiv = document.createElement('div');
			infoDiv.classList.add('pantryItemInfoDiv');
			
			//add info to div
			let colorSwitcher = 1;
			let props = ['name','correspondingIngredient','amount','unit','servingSize','servingSizeUnit',
				'calories','carbs','fat','protein','sugar','store','price'];
			props.forEach(prop => {
					let color = (colorSwitcher % 2 == 0) ? '#ffeeff':'#cadef7';
					let row = document.createElement('div');
					
					let label = document.createElement('label');
					label.innerHTML = prop + ': ';
					label.classList.add('pantryItemLabel');
					row.appendChild(label);
					
					let span = document.createElement('span');
					if (prop == 'price')
						span.innerHTML = (curItem[prop]) ? ('$' + curItem[prop]):'';
					else
						span.innerHTML = (curItem[prop]) ? (curItem[prop]):'';
					span.style.float = 'right';
					span.classList.add('pantryItem'+prop.toUpperCase()+'Display');
					row.appendChild(span);
					row.style.backgroundColor = color;
					colorSwitcher++;
					infoDiv.appendChild(row);
			});

			body.appendChild(infoDiv);
			
			//functions button div
			let fnDiv = document.createElement('div');
			fnDiv.classList.add('pantryFnDiv');

				//edit
				let editBtn = document.createElement('input');
				editBtn.setAttribute('type','button');
				editBtn.value = "Edit";
				editBtn.dataset.status = 'edit';
				editBtn.addEventListener('click', editPantryItem)
				fnDiv.appendChild(editBtn);
				
				//delete
				let deleteBtn = document.createElement('input');
				deleteBtn.setAttribute('type', 'button');
				deleteBtn.value = "Delete";
				deleteBtn.addEventListener('click', deletePantryItem);
				fnDiv.appendChild(deleteBtn);
			body.appendChild(fnDiv);
			
		div.appendChild(body);
		document.getElementById('pantryItems').appendChild(div);
    });
}

document.getElementById('searchPantryItemsInput').addEventListener('input', function(){
	activeSearch(this.value)
})

function activeSearch(searchCriteria){
	
	let searchCriteriaArr = searchCriteria.trim().split('').map(function (ch, i, array) { return ch == ' ' ? array[i - 1] + ' ' : ch });
	let numOfLetters = searchCriteriaArr.length;
	let results = [];

	// reformat data INEFFICIENT
    let pantryArr = [];
    for (item in localData.pantryItemList){
        pantryArr.push(localData.pantryItemList[item]);
    }

	pantryArr.forEach(function(pantryObj, ind, arr){
		let testPass = true;
		let testString = pantryObj.name; 	 
		let testArr = testString.trim().split('').map(function (ch, i, array) { return ch == ' ' ? array[i - 1] + ' ' : ch });
		for (let i = 0; i < numOfLetters; i++)
		{
			if(testArr[i].toUpperCase() != searchCriteriaArr[i].toUpperCase())
				testPass = false;
		}
		if(testPass)
			results.push(pantryObj);
	});


	
	updatePantry('az', results);
}

document.getElementById('pantryItemSort').addEventListener('change', function() {
	let sortCue = this.value;
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
		let option = document.createElement('option');
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
	let itemDiv = this.parentElement.parentElement.parentElement;

    //update localData
    let index = null;
    for (item in localData.pantryItemList){
        let testString = JSON.stringify(localData.pantryItemList[item]);
        if (itemDiv.dataset.json === testString) {
            index = item;
            break;
        }
    }

	if(index) {
     	delete localData.pantryItemList[index];
    }
	updateData(updatePantry);
}

function editPantryItem(){
	if(this.dataset.status == 'edit')
	{		
		//state changes
			//inputs
		let itemBodyDiv = this.parentElement.parentElement;
		let itemDiv = itemBodyDiv.parentElement;
		let itemObj = JSON.parse(itemDiv.dataset.json);
		let infoDiv = itemDiv.getElementsByClassName('pantryItemInfoDiv')[0];
		itemDiv.getElementsByClassName('pantryItemShowDetailsBtn')[0].setAttribute('disabled', true);
		
		//whipeInfoDivClean
		while (infoDiv.firstChild)
		{
			infoDiv.removeChild(infoDiv.firstChild);
		}
		
		let colorSwitcher = 1;
        let props = ['name','correspondingIngredient','amount','unit','servingSize','servingSizeUnit',
            'calories','carbs','fat','protein','sugar','store','price'];
        props.forEach(prop => {
            let color  = (colorSwitcher % 2 == 0) ? '#ffeeff':'#cadef7';
            let row = document.createElement('div');
            row.style.verticalAlign;

            let label = document.createElement('label');
            label.innerHTML = prop + ': ';
            label.classList.add('pantryItemLabel');
            row.appendChild(label);

            let input;
            if (prop === 'correspondingIngredient')
            {
                input = document.createElement('select');
                input.classList.add('unitSelect');
                updateIngredientsDropdown(input);
            }
            else if (prop === 'servingSizeUnit')
            {
                input = document.createElement('select');
                input.classList.add('unitSelect');
                setupUnitSelects(unitsArr, input, true);
            }
            else if (prop === 'unit')
            {
                input = document.createElement('select');
                input.classList.add('unitsSelect');
                setupUnitSelects(unitsArr, input, true);
            }
            else
            {
                input = document.createElement('input');
            }

            //apply to all inputs
            input.style.float = 'right';
            input.style.width = "30%";
            input.style.fontSize = '15px';

            input.classList.add('pantryItem'+prop.toUpperCase()+'Input');
            input.value = (itemObj[prop]) ? itemObj[prop]:'';

            row.appendChild(input);
            row.style.backgroundColor = color;
            colorSwitcher++;
            infoDiv.appendChild(row);
		});
		
			//button
		this.value = "Save";
		this.dataset.status = 'save';
	}
	else if(this.dataset.status == 'save')
	{
		//save input states to corresponding pantry item obj
		let itemBodyDiv = this.parentElement.parentElement;
		let itemDiv = itemBodyDiv.parentElement;
		let itemObj = JSON.parse(itemDiv.dataset.json);
		let infoDiv = itemDiv.getElementsByClassName('pantryItemInfoDiv')[0];
		itemDiv.getElementsByClassName('pantryItemShowDetailsBtn')[0].setAttribute('disabled', false);

        function getValueFromElement(el){
            if (el && el.value !== ""){
                return el.value.toString();
            }
            return null;
        }

        function getFloatFromElement(el){
            if (el && el.value !== ""){
                return parseFloat(el.value);
            }
            return null;
        }

        function getIntFromElement(el){
            if (el && el.value !== ""){
                return parseInt(el.value);
            }
            return null;
        }

        let servingSizeUnit;
        if(infoDiv.getElementsByClassName('pantryItemSERVINGSIZEUNITInput')[0])
            servingSizeUnit = infoDiv.getElementsByClassName('pantryItemSERVINGSIZEUNITInput')[0].value;
        else
            servingSizeUnit = null;


        let tempObj = {

            // strings
            'name': getValueFromElement(infoDiv.getElementsByClassName('pantryItemNAMEInput')[0]),
            'correspondingIngredient': getValueFromElement(infoDiv.getElementsByClassName('pantryItemCORRESPONDINGINGREDIENTInput')[0]),
            'unit': getValueFromElement(infoDiv.getElementsByClassName('pantryItemUNITInput')[0]),
            'servingSizeUnit': getValueFromElement(infoDiv.getElementsByClassName('pantryItemSERVINGSIZEUNITInput')[0]),
            'store': getValueFromElement(infoDiv.getElementsByClassName('pantryItemSTOREInput')[0]),

            // floats
            'amount': getFloatFromElement(infoDiv.getElementsByClassName('pantryItemAMOUNTInput')[0]),
            'servingSize': getFloatFromElement(infoDiv.getElementsByClassName('pantryItemSERVINGSIZEInput')[0]),
            'price': getFloatFromElement(infoDiv.getElementsByClassName('pantryItemPRICEInput')[0]),
            'sugar': getIntFromElement(infoDiv.getElementsByClassName('pantryItemSUGARInput')[0]),
            'protein': getIntFromElement(infoDiv.getElementsByClassName('pantryItemPROTEINInput')[0]),
            'calories': getIntFromElement(infoDiv.getElementsByClassName('pantryItemCALORIESInput')[0]),
            'carbs': getIntFromElement(infoDiv.getElementsByClassName('pantryItemCARBSInput')[0]),
            'fat': getIntFromElement( infoDiv.getElementsByClassName('pantryItemFATInput')[0]),
            'amountInPantry': parseInt(itemObj.amountInPantry)
        };
		
		//update localData 
		let index;
        for (item in localData.pantryItemList){
        	let testString = JSON.stringify(localData.pantryItemList[item]);
        	if (itemDiv.dataset.json === testString) {
                index = item;
                break;
            }
        }


		if(index)
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
	let totalsArr = [0, 0, 0, 0, 0, 0];
    let propsArr = ['sugar', 'protein', 'calories', 'carbs', 'fat', 'price'];
	
	//loops through each pantry item
	let pantryArr = [];
    for (item in localData.pantryItemList) {
        pantryArr.push(localData.pantryItemList[item]);
    }


	for (item in pantryArr){
		let curItem = pantryArr[item];
		for (let i = 0; i < 6; i++){
			if (!isNaN(parseInt(curItem.amountInPantry)) && !isNaN(parseFloat(curItem[propsArr[i]])))
			{
                let quantity = parseFloat(curItem.amountInPantry);
                let propAmount = parseFloat(curItem[propsArr[i]]);
                totalsArr[i] += quantity * propAmount;
			}
		}
	}
		
	//update HTML
	document.getElementById('sugarTotal').innerHTML = totalsArr[0];
	document.getElementById('proteinTotal').innerHTML = totalsArr[1];
	document.getElementById('caloriesTotal').innerHTML = totalsArr[2];
	document.getElementById('carbsTotal').innerHTML = totalsArr[3];
	document.getElementById('fatTotal').innerHTML = totalsArr[4];
	document.getElementById('storeTotalPrice').innerHTML = totalsArr[5].toFixed(2);
	
}