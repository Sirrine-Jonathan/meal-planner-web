let shoppingListSession = {
	"bools": {
		'enableStock': false,
		'customizeStock': null,
		'enablePantryItems': false,
		'customizePantryItems': null
	},
	"preferences": {
		'store': 'all',
		'lowOrHigh': 'low',
		'property': 'price',
	},
	'actualItemsOnList': [],
}

let readyList = [];    // list of all items or ingredients that need no further decision
let ready = false;     // boolean saying if any more decisions need to be made
let notReadyCount = 0; // if not ready, how many items need to be decided on

/*
	Items or Ingredients set and ready for the shopping list
 */
function ReadyListItem(name, amount, unit)
{
	this.name = name;
	this.amount = amount;
	this.unit = unit;
}

/*
	updates the display telling the user information about
	the readiness of their shopping list
 */
function readyListDisplay()
{
	console.log(readyList);
	
	//update ui to reflect ready state
	let status = document.getElementById('listStatus');
	let statusDetails = document.getElementById('listStatusDetails');
	
	if (ready) {
		status.innerHTML = "List Ready";
		statusDetails.innerHTML = "Save this list to view it on your phone";
	}
	else {
		status.innerHTML = "Not Ready";
		statusDetails.innerHTML = notReadyCount + " more item(s) to be processed. " + 
		"Saving the list now only saves your changes. Finish processing to make the list " +
		"available on mobile";
	}
}

//event listener on the regen button starts off the process
document.getElementById('regenShoppingList').addEventListener('click', function(){
	regenShoppingList();
});

//the main function for getting the shopping list in its initial state
function regenShoppingList()
{	
	readyList = [];
	shoppingListSession.actualItemsOnList = [];
	ready = true;
	notReadyCount = 0;
	
	//stores bools and logs them for debugging
	console.log(storeBools());
	let A = shoppingListSession.bools.enableStock;
	let B = shoppingListSession.bools.customizeStock;
	let C = shoppingListSession.bools.enablePantryItems;
	let D = shoppingListSession.bools.customizePantryItems;
	let store = shoppingListSession.preferences.store;
	let lowOrHigh = shoppingListSession.preferences.lowOrHigh;
	let property = shoppingListSession.preferences.property;
	let autoUseStock = (A && !B && B != null);
	
	eraseShoppingListDiv();    
	
	//No scheduled recipes, simplest case
	if (sessionData.scheduledIngredients.length <= 0)
	{
		let mainDiv = document.createElement('div');
		mainDiv.classList.add('ingDiv');
		mainDiv.style.display = 'flex';
		mainDiv.justifyContent = 'space-between';
		mainDiv.innerHTML = "<h1>There are no scheduled recipes</h1>";
		document.getElementById('shoppingListTarget').appendChild(mainDiv);
	}

	//handle each scheduled ingredient
	sessionData.scheduledIngredients.forEach(function(curIngredient){
		
		//set the item that will be placed on list as the current ingredient by default
		let item = curIngredient;
		
		//fill arrays with relevant pantry items
		let relevantPantryItems = [];
		let relevantPantryItemsInStock = [];
		let relevantPantryItemsOutOfStock = [];

        // temp rewrite code
        if((!localData.pantryItemList.noBarcode) || (!localData.pantryItemList.barcode)) {
            if (!localData.pantryItemList.noBarcode) {
                localData.pantryItemList.noBarcode = {};
                for (let item in localData.pantryItemList) {
                    if (parseFloat(item) < 1000) {
                        localData.pantryItemList.noBarcode[item] = localData.pantryItemList[item];
                        delete localData.pantryItemList[item];
                    }
                }

            }
            if (!localData.pantryItemList.barcode) {
                localData.pantryItemList.barcode = {};
                for (let item in localData.pantryItemList) {
                    if (parseFloat(item) >= 1000) {
                        localData.pantryItemList.barcode[item] = localData.pantryItemList[item];
                        delete localData.pantryItemList[item];
                    }
                }
            }

            //save database
            updateData();
        }

        // recombobulates the two objects (noBarcode & barcode) into
		// a loopable array
        let list = [];
        for (let it in localData.pantryItemList.noBarcode){
            list.push(localData.pantryItemList.noBarcode[it]);
        }
        for (let it in localData.pantryItemList.barcode){
            list.push(localData.pantryItemList.barcode[it])
        }

        // finds relevant pantry items in and out of stock
		for (let i in list){
			let curPantryItem = list[i];
            if (item.name == curPantryItem.correspondingIngredient)
            {
                relevantPantryItems.push(curPantryItem);
                if(curPantryItem.amountInPantry > 0)
                    relevantPantryItemsInStock.push(curPantryItem);
                else
                    relevantPantryItemsOutOfStock.push(curPantryItem);

            }
		}
	
		//adjust for stock automatically
		if (autoUseStock)
		{
			let currentNeed = item.need;
			relevantPantryItemsInStock.forEach(function(inStockItem){
				
				//only continue subtracting if there is a need
				if(currentNeed > 0)
				{
					//subtract adjusted inStockItem amount from ing need
					let convertedInStockItemAmount = convertUnits(parseFloat(inStockItem.amount), inStockItem.unit, item.unit);
					currentNeed -= convertedInStockItemAmount;
				}					
			});
			item.need = currentNeed;
			
			//if the need has been fulfilled for this ingredient with the stock, then do nothing more
			if (item.need <= 0){

				//this resets the need to the original amounts based on recipes
                item.need = item.amount;

                return;
            }
		}
		else 
		{
			//this resets the need to the original amounts based on recipes
			item.need = item.amount;
		}
		
		
		//createDiv that will hold that items information on the shopping list
		let mainDiv = document.createElement('div');
		mainDiv.classList.add('ingDiv');
		mainDiv.style.display = 'flex';
		mainDiv.justifyContent = 'space-between';
		
		//createDeleteBtn
		let deleteBtn = document.createElement('span');
		deleteBtn.classList.add('listItemDelete');
		
		mainDiv.appendChild(deleteBtn);
		
		//scenario 1 & 4 Only Ing
		if (!B && !C)
		{
			//for ready list
			let readyListItem = new ReadyListItem(item.name, item.amount, item.unit);
			readyList.push(readyListItem);
			
			let onlyIng = createIngPlaceholder(item);
		    mainDiv.appendChild(onlyIng);
			document.getElementById('shoppingListTarget').appendChild(mainDiv);

			//this resets the need to the original amounts based on recipes
            item.need = item.amount;

			return;
		}
		
		//scenario 2 & 5 Auto Gen
		if (!B && C && !D)
		{
			if (relevantPantryItems.length > 0)
			{
				//find best item based on preferences
				let bestItem = findBestItem(relevantPantryItems);
				
				//ONCE AN ITEM IS CHOSEN
				//find out how many units of the item will be needed
				//this will require reconciliation of units 
				let itemAmountNeeded = 1;
				try {
					itemAmountNeeded = tryConvertingUnits(bestItem, item);
				}
				catch (e)
				{
					//TODO something if the conversion failed
					itemAmountNeeded = '?';
				}
				
				//fill div with quantity and item name
				let listItem = createListItem(bestItem, itemAmountNeeded);
				
				// for ready list
				let readyListItem = new ReadyListItem(bestItem.name, itemAmountNeeded, "");
				readyList.push(readyListItem);
				
				mainDiv.appendChild(listItem);
				document.getElementById('shoppingListTarget').appendChild(mainDiv);

                //this resets the need to the original amounts based on recipes
                item.need = item.amount;

				return;
			}
			else
			{
				let onlyIng = createIngPlaceholder(item);
				
				//for ready list
				let readyListItem = new ReadyListItem(item.name, item.amount, item.unit);
				readyList.push(readyListItem);
				
				mainDiv.appendChild(onlyIng);
				document.getElementById('shoppingListTarget').appendChild(mainDiv);

                //this resets the need to the original amounts based on recipes
                item.need = item.amount;

				return;
			}
		}
		
		let chooseItemFlag = (C && D);
		let customStockFlag = (A && B);
		
		//scenarios 3, 6, 7, 8, & 9
		if (chooseItemFlag || customStockFlag)
		{
			let tempCustomStockFlag = false;
			let tempChooseItemFlag = false;
			
			if (relevantPantryItemsInStock.length > 0 && customStockFlag)
				tempCustomStockFlag = true;
			if (relevantPantryItems.length > 0 && chooseItemFlag)
				tempChooseItemFlag = true;
			
			if (tempCustomStockFlag || tempChooseItemFlag)
			{
				let ingBlock = createIngBlock(item, tempChooseItemFlag, tempCustomStockFlag, relevantPantryItems);

				mainDiv.appendChild(ingBlock);
				
				//createDeleteBtn
				let processBtn = document.createElement('span');
				processBtn.classList.add('ingBlockProcess');
				processBtn.addEventListener("click", function(){
					ingBlockProcess(item, mainDiv, relevantPantryItems);
				})
				mainDiv.appendChild(processBtn);
				
				document.getElementById('shoppingListTarget').appendChild(mainDiv);

                //this resets the need to the original amounts based on recipes
                item.need = item.amount;

				return;
			}
			else
			{
				//for ready list
				let readyListItem = new ReadyListItem(item.name, item.amount);
				readyList.push(readyListItem);
				
				let onlyIng = createIngPlaceholder(item);
				mainDiv.appendChild(onlyIng);
				document.getElementById('shoppingListTarget').appendChild(mainDiv);

                //this resets the need to the original amounts based on recipes
                item.need = item.amount;

				return;
			}
		}		
	});
	updateListInfo();
	readyListDisplay();
}

function findBestItem(relevantPantryItems)
{
	let low;
	if (shoppingListSession.preferences.lowOrHigh == 'low')
		low = true;
	else 
		low = false;
	
	let prop = shoppingListSession.preferences.property;
	let bestItem = findLowOrHighProperty(relevantPantryItems, prop, low);

	return bestItem;
}

function createIngPlaceholder(item)
{
	let ingPlaceholder = document.createElement('span');
	
	//setup usable unit
	let usableUnit;
	if (item.unit != '-none-')
		usableUnit = item.unit;
	else
		usableUnit = '';
	
	let needHTML;
	if (item.need > 1 && item.unit != '-none-')
		needHTML = "s needed)";
	else
		needHTML = " needed)";
	
	ingPlaceholder.innerHTML = item.name +         //item name
	" (" + item.need +                           //the amount needed
	" " + usableUnit + needHTML;                 //the units used in the recipes
	
	return ingPlaceholder;
}

function createIngBlock(item, chooseItemFlag, customStockFlag, relevantPantryItems)
{
	ready = false;
	notReadyCount++;
	
	let ingBlock = document.createElement('div');
	ingBlock.classList.add('ingBlock');
	
	//make ing name column
	let nameColumn = document.createElement('div');
	nameColumn.classList.add('column');
	nameColumn.classList.add('nameColumn');
	nameColumn.innerHTML = item.name;
	ingBlock.appendChild(nameColumn);
	
	//make ing need column
	let needColumn = document.createElement('div');
	needColumn.classList.add('column');
	needColumn.classList.add('needColumn');
	function updateNeed(need){
		//setup usable unit
		let usableUnit;
		if (item.unit != '-none-')
			usableUnit = item.unit;
		else
			usableUnit = '';
		
		let needHTML;
		if (item.amount > 1 && item.unit != '-none-')
			needHTML = "s needed";
		else
			needHTML = " needed";
		
		needColumn.innerHTML = need + " " + usableUnit + needHTML;
	}
	updateNeed(item.need);
	ingBlock.appendChild(needColumn);

	//make edit column
	let editColumn = document.createElement('div');
	editColumn.classList.add('column');
	editColumn.classList.add('editColumn');
	
	if (customStockFlag)
	{
		//give directions
		let title = document.createElement('h4');
		title.innerHTML = "Select in stock items from your pantry to satisfy the ingredient need";
		editColumn.appendChild(title);
		
		//make choose stock items form
		let stockItemsSelect = document.createElement('select');
		stockItemsSelect.setAttribute("multiple", true);
		stockItemsSelect.setAttribute("size", 4);
		relevantPantryItems.forEach(function(pantryItem){
			if(pantryItem.amountInPantry > 0)
			{
				let option = document.createElement('option');
				option.setAttribute("value", "none");
				option.innerHTML = "none";
				stockItemsSelect.appendChild(option);
				
				for (let i = 0; i < pantryItem.amountInPantry; i++)
				{
					let option = document.createElement('option');
					option.setAttribute("value", pantryItem.name);
					option.innerHTML = pantryItem.name;
					option.dataset.pantryItem = JSON.stringify(pantryItem);
					stockItemsSelect.appendChild(option);
				}
			}
		})
		
		stockItemsSelect.addEventListener("change", function(){
			
			if (item.storedNeed)
				item.need = item.storedNeed;
			else
				item.storedNeed = item.need;
			
			let children = this.children;
			
			for (let option in children){
				if (children[option].dataset && children[option].selected && children[option].value != "none")
				{
					let pantryItem = JSON.parse(children[option].dataset.pantryItem);
					let convertedInStockItemAmount = convertUnits(parseFloat(pantryItem.amount), pantryItem.unit, item.unit);
					item.need -= convertedInStockItemAmount;
					if (item.need < 0)
						item.need = 0;
				}
				if (children[option].value == "none" && children[option].selected)
				{
					for (let option2 in children)
					{
						if (children[option2].checked)
							children[option2].checked = false;
					}
					item.need = item.storedNeed;
				}
			}
			updateNeed(item.need);
		})
		editColumn.appendChild(stockItemsSelect);

		//give directions
		let span = document.createElement('span');
		span.innerHTML = "<br />Use ctrl to select multiple";
		span.style.fontStyle = 'italic';
		editColumn.appendChild(span);
	}
	
	//make choose items display
	let stagedItemsDiv = document.createElement('div');
	editColumn.appendChild(stagedItemsDiv);
		
	//add any staged ingredients
	if (item.stagedPantryItems && item.stagedPantryItems.length > 0)
	{
		item.stagedPantryItems.forEach(function(stagedPantryItem){
			
			let itemDiv = document.createElement('div');
			itemDiv.classList.add('ingDiv');
			itemDiv.style.display = 'flex';
			itemDiv.justifyContent = 'space-between';							
			itemDiv.dataset.pantryItem = JSON.stringify(stagedPantryItem);
			
			//make a button to remove the item
			let removeBtn = document.createElement('span');
			removeBtn.classList.add('stagedItemRemove');
			removeBtn.addEventListener('click', function(){
				
				//remove the item from the stagedItems array in the data
				let thisItemDiv = this.parentElement;
				let pantryItemJSON = thisItemDiv.dataset.pantryItem;
				
				let indexFound = false;
				let lastFoundIndex;
				item.stagedPantryItems.forEach(function(curVal, ind, arr){
					if (pantryItemJSON == JSON.stringify(curVal))
					{
						indexFound = true;
						lastFoundIndex = ind;
					}
				})
				
				if (indexFound)
				{
					item.stagedPantryItems.splice(1, lastFoundIndex);
				}
				
				//check the item quantity of the item being removed
				let stagedItems = stagedItemsDiv.children;
				for (let it in stagedItems)
				{
					try {
						if (stagedItems[it].dataset.pantryItem == JSON.stringify(pantryItemJSON))
						{
							let quantityDisplay = stagedItems[it].getElementsByClassName('quantityDisplayStagedItem')[0];
							
							//if it quantity is one before removing, remove the item completely
							if (parseFloat(quantityDisplay.value) - 1 <= 0)
								stagedItems.remove(stagedItems[it])
							
							//if there is more than one item, reduce the quantity
							else
							{
								quantityDisplay.value = parseFloat(quantityDisplay.value) - 1;
								quantityDisplay.dataset.quantity = quantityDisplay.value;
								quantityDisplay.innerHTML = quantityDisplay.value;
							}
						}
					}
					catch (e)
					{
						//console.log(e);
					}
				}
			})
			let quantityDisplay = document.createElement('span');
			quantityDisplay.classList.add('quantityDisplayStagedItem');
			quantityDisplay.value = 0;
			quantityDisplay.dataset.quantity = 0;
			
			let itemNameSpan = document.createElement('span')
			itemNameSpan.innerHTML = stagedPantryItem.name;
			
			itemDiv.appendChild(removeBtn);
			itemDiv.appendChild(quantityDisplay);
			itemDiv.appendChild(itemNameSpan);
			stagedItemsDiv.appendChild(itemDiv);
			
		})
	}
	
	if (chooseItemFlag)
	{
		
		if (!item.storedNeed)
			item.storedNeed = item.need;
		
		//make choose items form
		let chooseItemForm = document.createElement('div');
			
			//make choose items input
			let chooseItemSelect = document.createElement('select');
			relevantPantryItems.forEach(function(pantryItem){
				let option = document.createElement('option');
				option.setAttribute("value", pantryItem.name);
				option.innerHTML = pantryItem.name;
				option.dataset.pantryItem = JSON.stringify(pantryItem);
				chooseItemSelect.appendChild(option);
			})
			chooseItemSelect.addEventListener("change", function(){
				
			})
			chooseItemForm.appendChild(chooseItemSelect);
			
			//make choose items button
			let addItemButton = document.createElement('input');
			addItemButton.setAttribute("type", "button");
			addItemButton.value = "Add";
			addItemButton.addEventListener("click", function(event){
				
				let children = chooseItemSelect.children;
				for (let option in children)
				{
					if (children[option].selected)
					{
						let pantryItem = JSON.parse(children[option].dataset.pantryItem);
					
						//update ingredient need
						let convertedInStockItemAmount = convertUnits(parseFloat(pantryItem.amount), pantryItem.unit, item.unit);
						item.need -= convertedInStockItemAmount;
						if (item.need < 0)
							item.need = 0;
						updateNeed(item.need);						
						
						//add staged item to data
						if (!item.stagedPantryItems)
							item.stagedPantryItems = [];
						item.stagedPantryItems.push(pantryItem);
						
						//find out if item is already in the staged list
						let alreadyInList = false;
						let stagedItems = stagedItemsDiv.children;
						for (let it in stagedItems)
						{
							try {
								if (stagedItems[it].dataset.pantryItem == JSON.stringify(pantryItem))
								{
									alreadyInList = true;
									let quantityDisplay = stagedItems[it].getElementsByClassName('quantityDisplayStagedItem')[0];
									quantityDisplay.value = parseFloat(quantityDisplay.value) + 1;
									quantityDisplay.dataset.quantity = quantityDisplay.value;
									quantityDisplay.innerHTML = quantityDisplay.value;
								}
							}
							catch (e)
							{
								console.log(e);
							}
						}
						
						//if not, add staged item to list
						if (!alreadyInList)
						{
							let itemDiv = document.createElement('div');
							itemDiv.classList.add('ingDiv');
							itemDiv.style.display = 'flex';
							itemDiv.justifyContent = 'space-between';							
							itemDiv.dataset.pantryItem = children[option].dataset.pantryItem;
							
							//make a button to remove the item
							let removeBtn = document.createElement('span');
							removeBtn.classList.add('stagedItemRemove');
							removeBtn.addEventListener('click', function(){
								//remove the item from the stagedItems array in the data
								let thisItemDiv = this.parentElement;
								let pantryItemString = thisItemDiv.dataset.pantryItem;
								let pantryItemObj = JSON.parse(pantryItemString);
								
								let convertedInStockItemAmount = convertUnits(parseFloat(pantryItem.amount), pantryItem.unit, item.unit);
								item.need += convertedInStockItemAmount;
								if (item.need < 0)
									item.need = 0;
								if (item.need > item.storedNeed)
									item.need = item.storedNeed;
								updateNeed(item.need);
								
								let indexFound = false;
								let lastFoundIndex;
								item.stagedPantryItems.forEach(function(curVal, ind, arr){
									if (pantryItemString == JSON.stringify(curVal))
									{
										indexFound = true;
										lastFoundIndex = ind;
									}
								})
								
								if (indexFound)
								{
									item.stagedPantryItems.splice(lastFoundIndex, 1);
								}
								
								//check the item quantity of the item being removed
								let stagedItems = stagedItemsDiv.children;
								for (let it in stagedItems)
								{
									try {
										if (stagedItems[it].dataset.pantryItem == pantryItemString)
										{
											let quantityDisplay = stagedItems[it].getElementsByClassName('quantityDisplayStagedItem')[0];
											
											//if it is greater than one, lower the quantity one
											if (parseFloat(quantityDisplay.value) - 1 <= 0)
												stagedItemsDiv.removeChild(stagedItems[it])
											
											//if it is one remove the item completly							
											else
											{
												quantityDisplay.value = parseFloat(quantityDisplay.value) - 1;
												quantityDisplay.dataset.quantity = quantityDisplay.value;
												quantityDisplay.innerHTML = quantityDisplay.value;
											}
										}
									}
									catch (e)
									{
										//console.log(e);
									}
								}
								updateListInfo();
							})
							
							let quantityDisplay = document.createElement('span');
							quantityDisplay.classList.add('quantityDisplayStagedItem');
							quantityDisplay.value = 1;
							quantityDisplay.dataset.quantity = 1;
							
							let itemNameSpan = document.createElement('span')
							itemNameSpan.innerHTML = pantryItem.name;
							
							itemDiv.appendChild(removeBtn);
							itemDiv.appendChild(quantityDisplay);
							itemDiv.appendChild(itemNameSpan);
							stagedItemsDiv.appendChild(itemDiv);
						}
					}
				}		
				updateListInfo();
			})
			chooseItemForm.appendChild(addItemButton);
			
		editColumn.appendChild(chooseItemForm);
	}
	ingBlock.appendChild(editColumn);
	
	return ingBlock;
}

function ingBlockProcess(item, mainDiv, relevantPantryItems)
{
	let nodes = mainDiv.parentNode.childNodes, node;
	let i = count = 0;
	while ( (node = nodes.item(i++)) && node != mainDiv)
	{
		//if (node.nodeType == 1) 
			count++;
	}
	
	let container = mainDiv.parentNode;
	
	//make a manageable array for adding all the staged pantry items
	let pantryItemsAndQuantitys = [];
	if (!item.stagedPantryItems)
		item.stagedPantryItems = [];
	item.stagedPantryItems.forEach(function(pantryItem){
		

		
		//make sure the pantryItem is the first of its kind
		let isFirst = true;
		pantryItemsAndQuantitys.forEach(function(obj){
			if (JSON.stringify(obj.item) == JSON.stringify(pantryItem))
				isFirst = false;
		})
		
		if (isFirst)
		{
			//find out how many duplicates there are
			let count = 0;
			item.stagedPantryItems.forEach(function(innerItem){
				if (JSON.stringify(pantryItem) == JSON.stringify(innerItem))
					count++;
			})
			
			//make a dummy object used to consolidate the duplicates
			let oneItemAndQuantity = {
				'item': pantryItem,
				'quantity': count
			}
			pantryItemsAndQuantitys.push(oneItemAndQuantity);
		}
		

	})
	
	//add staged pantry items to shopping list
	pantryItemsAndQuantitys.forEach(function(obj){
		//createDiv that will hold that items information on the shopping list
		let newMainDiv = document.createElement('div');
		newMainDiv.classList.add('ingDiv');
		newMainDiv.style.display = 'flex';
		newMainDiv.justifyContent = 'space-between';
		
		//createDeleteBtn
		let deleteBtn = document.createElement('span');
		deleteBtn.classList.add('listItemDelete');
		
		//create listItem
		let listItem = createListItem(obj.item, obj.quantity);
		
		newMainDiv.appendChild(deleteBtn);
		newMainDiv.appendChild(listItem);
		
		container.insertBefore(newMainDiv, mainDiv);
	})
	
	let C = shoppingListSession.bools.enablePantryItems;
	let D = shoppingListSession.bools.customizePantryItems;
	
	//make placeholder for remaining need
	if (item.need > 0 && (!C || C && D)){
		
		//createDiv that will hold that items information on the shopping list
		let newMainDiv = document.createElement('div');
		newMainDiv.classList.add('ingDiv');
		newMainDiv.style.display = 'flex';
		newMainDiv.justifyContent = 'space-between';
		
		//createDeleteBtn
		let deleteBtn = document.createElement('span');
		deleteBtn.classList.add('listItemDelete');
		
		let placeholder = createIngPlaceholder(item);
		
		newMainDiv.appendChild(deleteBtn);
		newMainDiv.appendChild(placeholder);
				
		container.insertBefore(newMainDiv, mainDiv);
	}
	
	//autogen to fill remaining need
	else if (item.need > 0)
	{
		//createDiv that will hold that items information on the shopping list
		let newMainDiv = document.createElement('div');
		newMainDiv.classList.add('ingDiv');
		newMainDiv.style.display = 'flex';
		newMainDiv.justifyContent = 'space-between';
		
		//createDeleteBtn
		let deleteBtn = document.createElement('span');
		deleteBtn.classList.add('listItemDelete');
		
		if (relevantPantryItems.length > 0)
		{
			//find best item based on preferences
			let bestItem = findBestItem(relevantPantryItems);
			
			//ONCE AN ITEM IS CHOSEN
			//find out how many units of the item will be needed
			//this will require reconciliation of units 
			let itemAmountNeeded = 1;
			try {
				itemAmountNeeded = tryConvertingUnits(bestItem, item);
			}
			catch (e)
			{
				//TODO something if the conversion failed
				itemAmountNeeded = '?';
			}
			
			//fill div with quantity and item name
			let listItem = createListItem(bestItem, itemAmountNeeded);
			
			newMainDiv.appendChild(deleteBtn);
			newMainDiv.appendChild(listItem);
			
		}
		else
		{
			let onlyIng = createIngPlaceholder(item);
			newMainDiv.appendChild(onlyIng);
		}
		container.insertBefore(newMainDiv, mainDiv);
	}
	
	//remove the ing block from the container
	container.removeChild(mainDiv);
	
	notReadyCount--;
	if (notReadyCount == 0)
		ready = true;
		
	readyListDisplay();
	
	console.log("not ready count: " + notReadyCount);
	console.log("ready: " + ready);
	
}

function createListItem(pantryItem, quantity)
{
	let listItem = document.createElement('div');
	listItem.innerHTML = quantity + " " + pantryItem.name;
	
	for (let i = 0; i < quantity; i++)
	{
		shoppingListSession.actualItemsOnList.push(pantryItem);
	}
	
	return listItem;
}

function storeBools()
{
	let d = shoppingListSession.bools;
	
	//get preferences
	d.enableStock = document.querySelector("input[name=enableStock]").checked;
	d.customizeStock = null;
	if (d.enableStock)
		d.customizeStock = document.getElementById('enableStockChoose').checked;
	
	d.enablePantryItems = document.querySelector("input[name=enablePantryItems]").checked;
	d.customizePantryItems = null;
	if (d.enablePantryItems)
		d.customizePantryItems = document.getElementById('enablePantryItemsChoose').checked;
	
	if (!d.customizePantryItems)
	{
		shoppingListSession.preferences.store = document.getElementById('store').value;
		shoppingListSession.preferences.lowOrHigh = document.getElementById('lowOrHigh').value;
		shoppingListSession.preferences.property = document.getElementById('property').value;
	}
	
	return (d.enableStock + " " + d.customizeStock + " " + d.enablePantryItems + " " + d.customizePantryItems);
}

function eraseShoppingListDiv()
{
	//wipe shoppingList div clean
	let node = document.getElementById('shoppingListTarget');
	while (node.firstChild)
	{
		node.removeChild(node.firstChild);
	}	
}

function tryConvertingUnits(pantryItem, ingredient)
{
	let itemAmountNeeded = 1;

	let ingredientAmountNeeded = parseFloat(ingredient.need);
	let quantityInOneItemUsingItemUnit = parseFloat(pantryItem.amount);

	//reconcile unit discrepancy
	let quantityInOneItemUsingListUnit = convertUnits(quantityInOneItemUsingItemUnit, pantryItem.unit, ingredient.unit); 
    if (quantityInOneItemUsingListUnit == false)
		return false;
	
	while (ingredientAmountNeeded > (quantityInOneItemUsingListUnit * itemAmountNeeded))
	{
		itemAmountNeeded++;
	}
	
	return itemAmountNeeded;
}

document.getElementById('clearShoppingList').addEventListener('click', function(){
	sessionData = {
		'scheduledRecipes': [],
		'scheduledIngredients': [],
		'shoppingList':[]
	}
	regenShoppingList();
	updateScheduledRecipesDisplay();
})

document.getElementById('saveShoppingList').addEventListener('click', function(){
	let name;
	try
	{
		//get name
		name = document.getElementById('shoppingListName').value;
		
		if (name == '')
			throw "You forgot to name your list";
		
		function findSameName(obj){
			if(obj && obj.name)
				return obj.name == name;
		}
		let ind = localData.savedShoppingLists.findIndex(findSameName);
		
		//passed validation
		document.getElementById('saveShoppingListMsg').innerHTML = 'Saved ' + name;
		document.getElementById('shoppingListName').value = '';
		
		//make list
		let newList = {
			'name': name,
			'scheduledRecipes': sessionData.scheduledRecipes,
			'scheduledIngredients': sessionData.scheduledIngredients
		};

		//store list
		
		if (ready)
			newList.mobile = readyList;
		
		if (ind < 0)
			localData.savedShoppingLists.push(newList);
		else
			localData.savedShoppingLists[ind] = newList;
		
		updateData();
		updateLoadList();
	}
	catch (e)
	{
	    document.getElementById('saveShoppingListMsg').innerHTML = e;	
	}
})

function updateLoadList(){
	
	//wipe shoppingList div clean
	let node = document.getElementById('savedShoppingLists');
	while (node.firstChild)
	{
		node.removeChild(node.firstChild);
	}
	
	localData.savedShoppingLists.forEach(function(curList, ind){
		
        let div = document.createElement('div');
		div.classList.add('savedList');

			let loadBtn = document.createElement('input');
			loadBtn.value = "Load";
			loadBtn.setAttribute('type', 'button');
			loadBtn.classList.add('shoppingListBtn');
			loadBtn.addEventListener('click', function(){
				sessionData.scheduledRecipes = curList.scheduledRecipes;
				sessionData.scheduledIngredients = curList.scheduledIngredients;
				document.getElementById('shoppingListName').value = curList.name;
				regenShoppingList();
				updateScheduledRecipesDisplay();
			});
			div.appendChild(loadBtn);
		
			let name = document.createElement('span');
			name.innerHTML = curList.name;
			name.style.fontSize = '1.5em';
			div.appendChild(name);
			
			let deleteBtn = document.createElement('input');
			deleteBtn.value = 'X';
			deleteBtn.style.backgroundColor = 'crimson';
			deleteBtn.style.float = 'right';
			deleteBtn.setAttribute('type', 'button');
			deleteBtn.classList.add('shoppingListBtn');
			deleteBtn.addEventListener('click', function(){
				localData.savedShoppingLists.splice(ind, 1);
				updateData();
				updateLoadList();
			});
			div.appendChild(deleteBtn);
		
		node.appendChild(div);
	})
}

function updateSavedLists(){
	console.log(localData);
	localData.savedShoppingLists.forEach(function(list){
		console.log(list);
	})
}

function updateListInfo(){
	let sugar = 0;
	let protein = 0;
	let calories = 0;
	let carbs = 0;
	let fat = 0;
	let price = 0;

	//warning htmls
	let sugarWarn = document.getElementById('sugarWarning');
    let proteinWarn = document.getElementById('proteinWarning');
    let caloriesWarn = document.getElementById('caloriesWarning');
    let carbsWarn = document.getElementById('carbsWarning');
    let fatWarn = document.getElementById('fatWarning');
    let priceWarn = document.getElementById('priceWarning');
    clearWarnings();
    function clearWarnings() {
        sugarWarn.style.display = 'none';
        proteinWarn.style.display = 'none';
        caloriesWarn.style.display = 'none';
        carbsWarn.style.display = 'none';
        fatWarn.style.display = 'none';
        priceWarn.style.display = 'none';
    }
    function warn(html){
    	html.style.display = "block";
    	html.style.innerHTML = "  *missing information, not accurate";
	}


	sessionData.scheduledIngredients.forEach(function(ing){
		if (ing.stagedPantryItems && ing.stagedPantryItems.length > 0)
		{
			ing.stagedPantryItems.forEach(function(item){
                if (item != null && item != undefined)
                {
                    getItemValues(item);
                }
			})
		}
	});
	
	shoppingListSession.actualItemsOnList.forEach(function(item){
		if (item != null && item != undefined)
		{	
			getItemValues(item);
		}
	});

	function getItemValues(item) {
        if (item.sugar)
            sugar += parseFloat(item.sugar);
    	else
    		warn(sugarWarn);
    	if (item.protein)
			protein += parseFloat(item.protein);
        else
            warn(proteinWarn);
    	if (item.calories)
        	calories += parseFloat(item.calories);
        else
        	warn(caloriesWarn);
        if (item.carbs)
    		carbs += parseFloat(item.carbs);
        else
        	warn(carbsWarn);
        if (item.fat)
        	fat += parseFloat(item.fat);
        else
        	warn(fatWarn);
        if (item.price)
        	price += parseFloat(item.price);
        else
        	warn(priceWarn);
    }
	
	document.getElementById('sugarShoppingTotal').innerHTML = sugar; 
	document.getElementById('proteinShoppingTotal').innerHTML = protein;
	document.getElementById('caloriesShoppingTotal').innerHTML = calories;
	document.getElementById('carbsShoppingTotal').innerHTML = carbs;
	document.getElementById('fatShoppingTotal').innerHTML = fat;
	document.getElementById('storeShoppingTotalPrice').innerHTML = price.toFixed(2);
	/*
		<div id="shoppingListTotals">
			<div>
				<div>
					<label>Sugar:</label>
					<span id="sugarShoppingTotal"></span>g
					<span id="sugarWarning"></span>
				</div>
				<div>
					<label>Protein: </label>
					<span id="proteinShoppingTotal"></span>g
					<span id="proteinWarning"></span>
				</div>
			</div>
			<div>
				<div>
					<label>Calories: </label>
					<span id="caloriesShoppingTotal"></span>
					<span id="caloriesWarning"></span>
				</div>
				<div>
					<label>Carbs: </label>
					<span id="carbsShoppingTotal"></span>g
					<span id="carbsWarning"></span>
				</div>
			</div>
			<div>
				<div>
					<label>Fat: </label>
					<span id="fatShoppingTotal"></span>g
					<span id="fatWarning"></span>
				</div>
				<div>
					<label>Total Cost: $</label>
					<span id="storeShoppingTotalPrice"></span>
					<span id="priceWarning"></span>
					<br />
				</div>
			</div>
		</div>
	*/
}