var shoppingListSession = {
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

var readyList = [];
var ready = false;
var notReadyCount = 0;
function ReadyListItem(name, amount, unit)
{
	this.name = name;
	this.amount = amount;
	this.unit = unit;
}
function readyListDisplay()
{
	console.log(readyList);
	
	//update ui to reflect ready state
	var status = document.getElementById('listStatus');
	var statusDetails = document.getElementById('listStatusDetails');
	
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
})

//the main function for getting the shopping list in its initial state
function regenShoppingList()
{	
	readyList = [];
	ready = true;
	notReadyCount = 0;
	
	//stores bools and logs them for debugging
	console.log(storeBools());
	var A = shoppingListSession.bools.enableStock;
	var B = shoppingListSession.bools.customizeStock;
	var C = shoppingListSession.bools.enablePantryItems;
	var D = shoppingListSession.bools.customizePantryItems;
	var store = shoppingListSession.preferences.store;
	var lowOrHigh = shoppingListSession.preferences.lowOrHigh;
	var property = shoppingListSession.preferences.property;
	var autoUseStock = (A && !B && B != null);
	
	eraseShoppingListDiv();    
	
	//No scheduled recipes
	if (sessionData.scheduledIngredients.length <= 0)
	{
		var mainDiv = document.createElement('div');
		mainDiv.classList.add('ingDiv');
		mainDiv.style.display = 'flex';
		mainDiv.justifyContent = 'space-between';
		mainDiv.innerHTML = "<h1>There are no scheduled recipes</h1>";
		document.getElementById('shoppingListTarget').appendChild(mainDiv);
	}
	
	sessionData.scheduledIngredients.forEach(function(curIngredient){
		
		//set the item that will be placed on list as the current ingredient by default
		var item = curIngredient;
		
		//fill arrays with relevant pantry items
		var relevantPantryItems = [];
		var relevantPantryItemsInStock = [];
		var relevantPantryItemsOutOfStock = [];
		localData.pantryItemList.forEach(function(curPantryItem){
			
			if (item.name == curPantryItem.correspondingIngredient)
			{
				relevantPantryItems.push(curPantryItem);
				if(curPantryItem.amountInPantry > 0)
					relevantPantryItemsInStock.push(curPantryItem);
				else
					relevantPantryItemsOutOfStock.push(curPantryItem);
				
			}
		});
	
		//adjust for stock automatically
		if (autoUseStock)
		{
			var currentNeed = item.need;
			relevantPantryItemsInStock.forEach(function(inStockItem){
				
				//only continue subtracting if there is a need
				if(currentNeed > 0)
				{
					//subtract adjusted inStockItem amount from ing need
					var convertedInStockItemAmount = convertUnits(parseFloat(inStockItem.amount), inStockItem.unit, item.unit);
					currentNeed -= convertedInStockItemAmount;
				}					
			})
			item.need = currentNeed;
			
			//if the need has been fulfilled for this ingredient with the stock, then do nothing more
			if (item.need <= 0)
				return;
		}
		else 
		{
			//this resets the need to the original amounts based on recipes
			item.need = item.amount;
		}
		
		
		//createDiv that will hold that items information on the shopping list
		var mainDiv = document.createElement('div');
		mainDiv.classList.add('ingDiv');
		mainDiv.style.display = 'flex';
		mainDiv.justifyContent = 'space-between';
		
		//createDeleteBtn
		var deleteBtn = document.createElement('span');
		deleteBtn.classList.add('listItemDelete');
		
		mainDiv.appendChild(deleteBtn);
		
		//scenario 1 & 4 Only Ing
		if (!B && !C)
		{
			//for ready list
			var readyListItem = new ReadyListItem(item.name, item.amount, item.unit);
			readyList.push(readyListItem);
			
			var onlyIng = createIngPlaceholder(item);
		    mainDiv.appendChild(onlyIng);
			document.getElementById('shoppingListTarget').appendChild(mainDiv);
			return;
		}
		
		//scenario 2 & 5 Auto Gen
		if (!B && C && !D)
		{
			if (relevantPantryItems.length > 0)
			{
				//find best item based on preferences
				var bestItem = findBestItem(relevantPantryItems);
				
				//ONCE AN ITEM IS CHOSEN
				//find out how many units of the item will be needed
				//this will require reconciliation of units 
				var itemAmountNeeded = 1;
				try {
					itemAmountNeeded = tryConvertingUnits(bestItem, item);
				}
				catch (e)
				{
					//TODO something if the conversion failed
					itemAmountNeeded = '?';
				}
				
				//fill div with quantity and item name
				var listItem = createListItem(bestItem, itemAmountNeeded);
				
				// for ready list
				var readyListItem = new ReadyListItem(bestItem.name, itemAmountNeeded, "");
				readyList.push(readyListItem);
				
				mainDiv.appendChild(listItem);
				document.getElementById('shoppingListTarget').appendChild(mainDiv);
				return;
			}
			else
			{
				var onlyIng = createIngPlaceholder(item);
				
				//for ready list
				var readyListItem = new ReadyListItem(item.name, item.amount, item.unit);
				readyList.push(readyListItem);
				
				mainDiv.appendChild(onlyIng);
				document.getElementById('shoppingListTarget').appendChild(mainDiv);
				return;
			}
		}
		
		var chooseItemFlag = (C && D);
		var customStockFlag = (A && B);
		
		//scenarios 3, 6, 7, 8, & 9
		if (chooseItemFlag || customStockFlag)
		{
			var tempCustomStockFlag = false;
			var tempChooseItemFlag = false;
			
			if (relevantPantryItemsInStock.length > 0 && customStockFlag)
				tempCustomStockFlag = true;
			if (relevantPantryItems.length > 0 && chooseItemFlag)
				tempChooseItemFlag = true;
			
			if (tempCustomStockFlag || tempChooseItemFlag)
			{
				var ingBlock = createIngBlock(item, tempChooseItemFlag, tempCustomStockFlag, relevantPantryItems);

				mainDiv.appendChild(ingBlock);
				
				//createDeleteBtn
				var processBtn = document.createElement('span');
				processBtn.classList.add('ingBlockProcess');
				processBtn.addEventListener("click", function(){
					ingBlockProcess(item, mainDiv, relevantPantryItems);
				})
				mainDiv.appendChild(processBtn);
				
				document.getElementById('shoppingListTarget').appendChild(mainDiv);
				
				return;
			}
			else
			{
				//for ready list
				var readyListItem = new ReadyListItem(item.name, item.amount);
				readyList.push(readyListItem);
				
				var onlyIng = createIngPlaceholder(item);
				mainDiv.appendChild(onlyIng);
				document.getElementById('shoppingListTarget').appendChild(mainDiv);
				return;
			}
		}		
	})
	updateListInfo();
	readyListDisplay();
}

function findBestItem(relevantPantryItems)
{
	var low;
	if (shoppingListSession.preferences.lowOrHigh == 'low')
		low = true;
	else 
		low = false;
	
	var prop = shoppingListSession.preferences.property;
	var bestItem = findLowOrHighProperty(relevantPantryItems, prop, low)

	return bestItem;
}

function createIngPlaceholder(item)
{
	var ingPlaceholder = document.createElement('span');
	
	//setup usable unit
	var usableUnit;
	if (item.unit != '-none-')
		usableUnit = item.unit;
	else
		usableUnit = '';
	
	var needHTML;
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
	
	var ingBlock = document.createElement('div');
	ingBlock.classList.add('ingBlock');
	
	//make ing name column
	var nameColumn = document.createElement('div');
	nameColumn.classList.add('column');
	nameColumn.classList.add('nameColumn');
	nameColumn.innerHTML = item.name;
	ingBlock.appendChild(nameColumn);
	
	//make ing need column
	var needColumn = document.createElement('div');
	needColumn.classList.add('column');
	needColumn.classList.add('needColumn');
	function updateNeed(need){
		//setup usable unit
		var usableUnit;
		if (item.unit != '-none-')
			usableUnit = item.unit;
		else
			usableUnit = '';
		
		var needHTML;
		if (item.amount > 1 && item.unit != '-none-')
			needHTML = "s needed";
		else
			needHTML = " needed";
		
		needColumn.innerHTML = need + " " + usableUnit + needHTML;
	}
	updateNeed(item.need);
	ingBlock.appendChild(needColumn);

	//make edit column
	var editColumn = document.createElement('div');
	editColumn.classList.add('column');
	editColumn.classList.add('editColumn');
	
	if (customStockFlag)
	{
		//give directions
		var title = document.createElement('h4');
		title.innerHTML = "Select in stock items from your pantry to satisfy the ingredient need";
		editColumn.appendChild(title);
		
		//make choose stock items form
		var stockItemsSelect = document.createElement('select');
		stockItemsSelect.setAttribute("multiple", true);
		stockItemsSelect.setAttribute("size", 4);
		relevantPantryItems.forEach(function(pantryItem){
			if(pantryItem.amountInPantry > 0)
			{
				var option = document.createElement('option');
				option.setAttribute("value", "none");
				option.innerHTML = "none";
				stockItemsSelect.appendChild(option);
				
				for(var i = 0; i < pantryItem.amountInPantry; i++)
				{
					var option = document.createElement('option');
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
			
			var children = this.children;
			
			for (option in children){
				if (children[option].dataset && children[option].selected && children[option].value != "none")
				{
					var pantryItem = JSON.parse(children[option].dataset.pantryItem);
					var convertedInStockItemAmount = convertUnits(parseFloat(pantryItem.amount), pantryItem.unit, item.unit);
					item.need -= convertedInStockItemAmount;
					if (item.need < 0)
						item.need = 0;
				}
				if (children[option].value == "none" && children[option].selected)
				{
					for (option2 in children)
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
		var span = document.createElement('span');
		span.innerHTML = "<br />Use ctrl to select multiple";
		span.style.fontStyle = 'italic';
		editColumn.appendChild(span);
	}
	
	//make choose items display
	var stagedItemsDiv = document.createElement('div');
	editColumn.appendChild(stagedItemsDiv);
		
	//add any staged ingredients
	if (item.stagedPantryItems && item.stagedPantryItems.length > 0)
	{
		item.stagedPantryItems.forEach(function(stagedPantryItem){
			
			var itemDiv = document.createElement('div');
			itemDiv.classList.add('ingDiv');
			itemDiv.style.display = 'flex';
			itemDiv.justifyContent = 'space-between';							
			itemDiv.dataset.pantryItem = JSON.stringify(stagedPantryItem);
			
			//make a button to remove the item
			var removeBtn = document.createElement('span');
			removeBtn.classList.add('stagedItemRemove');
			removeBtn.addEventListener('click', function(){
				
				//remove the item from the stagedItems array in the data
				var thisItemDiv = this.parentElement;
				var pantryItemJSON = thisItemDiv.dataset.pantryItem;
				
				var indexFound = false;
				var lastFoundIndex;
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
				var stagedItems = stagedItemsDiv.children;
				for (it in stagedItems)
				{
					try {
						if (stagedItems[it].dataset.pantryItem == JSON.stringify(pantryItemJSON))
						{
							var quantityDisplay = stagedItems[it].getElementsByClassName('quantityDisplayStagedItem')[0];
							
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
			var quantityDisplay = document.createElement('span');
			quantityDisplay.classList.add('quantityDisplayStagedItem');
			quantityDisplay.value = 0;
			quantityDisplay.dataset.quantity = 0;
			
			var itemNameSpan = document.createElement('span')
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
		var chooseItemForm = document.createElement('div');
			
			//make choose items input
			var chooseItemSelect = document.createElement('select');
			relevantPantryItems.forEach(function(pantryItem){
				var option = document.createElement('option');
				option.setAttribute("value", pantryItem.name);
				option.innerHTML = pantryItem.name;
				option.dataset.pantryItem = JSON.stringify(pantryItem);
				chooseItemSelect.appendChild(option);
			})
			chooseItemSelect.addEventListener("change", function(){
				
			})
			chooseItemForm.appendChild(chooseItemSelect);
			
			//make choose items button
			var addItemButton = document.createElement('input');
			addItemButton.setAttribute("type", "button");
			addItemButton.value = "Add";
			addItemButton.addEventListener("click", function(event){
				
				var children = chooseItemSelect.children;
				for (option in children)
				{
					if (children[option].selected)
					{
						var pantryItem = JSON.parse(children[option].dataset.pantryItem);
					
						//update ingredient need
						var convertedInStockItemAmount = convertUnits(parseFloat(pantryItem.amount), pantryItem.unit, item.unit);
						item.need -= convertedInStockItemAmount;
						if (item.need < 0)
							item.need = 0;
						updateNeed(item.need);						
						
						//add staged item to data
						if (!item.stagedPantryItems)
							item.stagedPantryItems = [];
						item.stagedPantryItems.push(pantryItem);
						
						//find out if item is already in the staged list
						var alreadyInList = false;
						var stagedItems = stagedItemsDiv.children;
						for (it in stagedItems)
						{
							try {
								if (stagedItems[it].dataset.pantryItem == JSON.stringify(pantryItem))
								{
									alreadyInList = true;
									var quantityDisplay = stagedItems[it].getElementsByClassName('quantityDisplayStagedItem')[0];
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
							var itemDiv = document.createElement('div');
							itemDiv.classList.add('ingDiv');
							itemDiv.style.display = 'flex';
							itemDiv.justifyContent = 'space-between';							
							itemDiv.dataset.pantryItem = children[option].dataset.pantryItem;
							
							//make a button to remove the item
							var removeBtn = document.createElement('span');
							removeBtn.classList.add('stagedItemRemove');
							removeBtn.addEventListener('click', function(){
								//remove the item from the stagedItems array in the data
								var thisItemDiv = this.parentElement;
								var pantryItemString = thisItemDiv.dataset.pantryItem;
								var pantryItemObj = JSON.parse(pantryItemString);
								
								var convertedInStockItemAmount = convertUnits(parseFloat(pantryItem.amount), pantryItem.unit, item.unit);
								item.need += convertedInStockItemAmount;
								if (item.need < 0)
									item.need = 0;
								if (item.need > item.storedNeed)
									item.need = item.storedNeed;
								updateNeed(item.need);
								
								var indexFound = false;
								var lastFoundIndex;
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
								var stagedItems = stagedItemsDiv.children;
								for (it in stagedItems)
								{
									try {
										if (stagedItems[it].dataset.pantryItem == pantryItemString)
										{
											var quantityDisplay = stagedItems[it].getElementsByClassName('quantityDisplayStagedItem')[0];
											
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
							
							var quantityDisplay = document.createElement('span');
							quantityDisplay.classList.add('quantityDisplayStagedItem');
							quantityDisplay.value = 1;
							quantityDisplay.dataset.quantity = 1;
							
							var itemNameSpan = document.createElement('span')
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
	var nodes = mainDiv.parentNode.childNodes, node;
	var i = count = 0;
	while ( (node = nodes.item(i++)) && node != mainDiv)
	{
		//if (node.nodeType == 1) 
			count++;
	}
	
	var container = mainDiv.parentNode;
	
	//make a manageable array for adding all the staged pantry items
	var pantryItemsAndQuantitys = [];
	if (!item.stagedPantryItems)
		item.stagedPantryItems = [];
	item.stagedPantryItems.forEach(function(pantryItem){
		

		
		//make sure the pantryItem is the first of its kind
		var isFirst = true;
		pantryItemsAndQuantitys.forEach(function(obj){
			if (JSON.stringify(obj.item) == JSON.stringify(pantryItem))
				isFirst = false;
		})
		
		if (isFirst)
		{
			//find out how many duplicates there are
			var count = 0;
			item.stagedPantryItems.forEach(function(innerItem){
				if (JSON.stringify(pantryItem) == JSON.stringify(innerItem))
					count++;
			})
			
			//make a dummy object used to consolidate the duplicates
			var oneItemAndQuantity = {
				'item': pantryItem,
				'quantity': count
			}
			pantryItemsAndQuantitys.push(oneItemAndQuantity);
		}
		

	})
	
	//add staged pantry items to shopping list
	pantryItemsAndQuantitys.forEach(function(obj){
		//createDiv that will hold that items information on the shopping list
		var newMainDiv = document.createElement('div');
		newMainDiv.classList.add('ingDiv');
		newMainDiv.style.display = 'flex';
		newMainDiv.justifyContent = 'space-between';
		
		//createDeleteBtn
		var deleteBtn = document.createElement('span');
		deleteBtn.classList.add('listItemDelete');
		
		//create listItem
		var listItem = createListItem(obj.item, obj.quantity);
		
		newMainDiv.appendChild(deleteBtn);
		newMainDiv.appendChild(listItem);
		
		container.insertBefore(newMainDiv, mainDiv);
	})
	
	var C = shoppingListSession.bools.enablePantryItems;
	var D = shoppingListSession.bools.customizePantryItems;
	
	//make placeholder for remaining need
	if (item.need > 0 && (!C || C && D)){
		
		//createDiv that will hold that items information on the shopping list
		var newMainDiv = document.createElement('div');
		newMainDiv.classList.add('ingDiv');
		newMainDiv.style.display = 'flex';
		newMainDiv.justifyContent = 'space-between';
		
		//createDeleteBtn
		var deleteBtn = document.createElement('span');
		deleteBtn.classList.add('listItemDelete');
		
		var placeholder = createIngPlaceholder(item);
		
		newMainDiv.appendChild(deleteBtn);
		newMainDiv.appendChild(placeholder);
				
		container.insertBefore(newMainDiv, mainDiv);
	}
	
	//autogen to fill remaining need
	else if (item.need > 0)
	{
		//createDiv that will hold that items information on the shopping list
		var newMainDiv = document.createElement('div');
		newMainDiv.classList.add('ingDiv');
		newMainDiv.style.display = 'flex';
		newMainDiv.justifyContent = 'space-between';
		
		//createDeleteBtn
		var deleteBtn = document.createElement('span');
		deleteBtn.classList.add('listItemDelete');
		
		if (relevantPantryItems.length > 0)
		{
			//find best item based on preferences
			var bestItem = findBestItem(relevantPantryItems);
			
			//ONCE AN ITEM IS CHOSEN
			//find out how many units of the item will be needed
			//this will require reconciliation of units 
			var itemAmountNeeded = 1;
			try {
				itemAmountNeeded = tryConvertingUnits(bestItem, item);
			}
			catch (e)
			{
				//TODO something if the conversion failed
				itemAmountNeeded = '?';
			}
			
			//fill div with quantity and item name
			var listItem = createListItem(bestItem, itemAmountNeeded);
			
			newMainDiv.appendChild(deleteBtn);
			newMainDiv.appendChild(listItem);
			
		}
		else
		{
			var onlyIng = createIngPlaceholder(item);
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
	var listItem = document.createElement('div');
	listItem.innerHTML = quantity + " " + pantryItem.name;
	
	for (var i = 0; i < quantity; i++)
	{
		shoppingListSession.actualItemsOnList.push(pantryItem);
	}
	
	return listItem;
}

function storeBools()
{
	var d = shoppingListSession.bools;
	
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
	var node = document.getElementById('shoppingListTarget');
	while (node.firstChild)
	{
		node.removeChild(node.firstChild);
	}	
}
/*
function updateIngredientBlock(ingredient)
{
	
	//fill arrays with relevant pantry items
	var relevantPantryItems = [];
	var relevantPantryItemsInStock = [];
	
	//check if there is a item for that ingredient in pantry database
	localData.pantryItemList.forEach(function(curPantryItem){
		
		if (curIngredient.name == curPantryItem.correspondingIngredient)
		{
			if(curPantryItem.amountInPantry > 0)
				relevantPantryItemsInStock.push(curPantryItem);
			else
				relevantPantryItems.push(curPantryItem);
		}
	});
	
	//set the item that will be placed on list as the current ingredient by default
	var item = curIngredient;
	
	//createDiv that will hold that items information on the shopping list
	var ingDiv = document.createElement('div');
	ingDiv.classList.add('ingDiv');
	ingDiv.style.display = 'flex';
	ingDiv.justifyContent = 'space-between';
	
		//createMain (information relevant to every item)
		var main = document.createElement('span');
		
		//setup usable unit
		var usableUnit;
		if (item.unit != '-none-')
			usableUnit = item.unit;
		else
			usableUnit = '';
		
		var needHTML;
		if (item.amount > 1 && item.unit != '-none-')
			needHTML = "s needed)";
		else
			needHTML = " needed)";
		
		main.innerHTML = item.name +                       //item name
		" (" + item.amount +                               //the amount needed
		" " + usableUnit + needHTML;                      //the units used in the recipes
		ingDiv.appendChild(main);	
	
		//handle ingredient if it has an item in stock
		if(relevantPantryItemsInStock.length > 0) 
		{
			
			
			
			
			//item is the pantry item that will be used to fill the shopping list's requirement
			//default to first item
			var item = relevantPantryItemsInStock[0];    
			
			//create select multiple list of items in stock
			//on select of each item, update pantry need
				//in ingredient
				//in shopping list object in data
				
			//if need is fulfilled, remove out of stock select
			relevantPantryItemsInStock.forEach(function(){
				//make use or dismiss block for pantry item in stock
				
				
			});
			
			//create select multip list of relevant pantry items 
			//these selected items will show up on final list
			//possible only show this section if an ingredient need remains
			relevantPantryItems.forEach(function(){
				//
				
			})
			
			
			
			
			//if more than one, decide which item would be best to use from Pantry.
			//by default, item with higher amountInPantry is set to item
			if(relevantPantryItemsInStock.length > 1)
			{
				relevantPantryItemsInStock.forEach(function(curPantryItem){
					if(item.amountInPantry < curPantryItem.amountInPantry)
						item = curPantryItem;
				})
			}	
			
			//ONCE AN ITEM IS CHOSEN
			//find out how many units of the item will be needed
				//this will require reconciliation of units 
			var itemAmountNeeded = 1;
			try {
				itemAmountNeeded = tryConvertingUnits(item, curIngredient);
			}
			catch (e)
			{
				//TODO something if the conversion failed
				itemAmountNeeded = '?';
			}

			
			//create inStock
			var inStock = document.createElement('span');
			
			//setup usable unit
			var usableUnit;
			if (item.unit != '-none-')
				usableUnit = item.unit;
			else
				usableUnit = '';
			
			inStock.innerHTML = itemAmountNeeded + 
			" " + item.name + 
			" (" + item.amount +
			" " + item.unit + ")";
			
			//createDetails
			var details = document.createElement('span');
			details.innerHTML = item.amountInPantry + " unit(s) In Pantry";
			
			//subtract Button
			var subtractBtn = document.createElement('input');
			subtractBtn.classList.add('subtractBtn');
			subtractBtn.setAttribute('type', 'button');
			subtractBtn.setAttribute('value', 'Use Item');
			subtractBtn.addEventListener('click', function(){
				//TODO
				//resolve differences in units
				//subtract the amount out of the scheduled ingredients list
				//subtract the amountInPantry used from amountInPantry for the item
			})
			
			var dismissBtn = document.createElement('input');
			dismissBtn.classList.add('dismissBtn');
			dismissBtn.setAttribute('type', 'button');
			dismissBtn.setAttribute('value', 'Dismiss Suggestion');
			dismissBtn.addEventListener('click', function(){
				//TODO
				//treat item like there is no corresponding item in pantry
			})
			ingDiv.appendChild(inStock);
			ingDiv.appendChild(details);
			//ingDiv.appendChild(subtractBtn);
			//ingDiv.appendChild(dismissBtn);
		}
	
		//handle ingredient if there is an item that is not in stock for it
		else if(relevantPantryItems.length > 0)
		{
			//TODO
			//if more than one, decide which item would be best to buy
				//depending on
					//store
					//price
					//quantity needed
					
			//item is the pantry item that will be used to fill the shopping list's requirement
			//default to first found item in pantry that will fit the bill
			var item = relevantPantryItems[0];    
			
			//if more than one, decide which item would be best to use from Pantry.
			//by default, item with higher amountInPantry is set to item
			if(relevantPantryItems.length > 1)
			{
				relevantPantryItems.forEach(function(curPantryItem){
					if(item.amountInPantry < curPantryItem.amountInPantry)
						item = curPantryItem;
				})
			}	
			
			//ONCE AN ITEM IS CHOSEN
			//find out how many units of the item will be needed
				//this will require reconciliation of units 
			var itemAmountNeeded = 1;
			try {
				itemAmountNeeded = tryConvertingUnits(item, curIngredient);
			}
			catch (e)
			{
				//TODO something if the conversion failed
				itemAmountNeeded = '?';
			}
			
			var outStock = document.createElement('span');
			
			//setup usable unit
			var usableUnit;
			if (item.unit != '-none-')
				usableUnit = item.unit;
			else
				usableUnit = '';
			
			outStock.innerHTML = itemAmountNeeded +
			" " + item.name +
			" (" + item.amount + 
			" " + item.unit + ")";
			
			var details = document.createElement('span');
			details.innerHTML = item.amountInPantry + " unit(s) In Pantry";
			
			ingDiv.appendChild(outStock);
			ingDiv.appendChild(details);
			
		}
	node.appendChild(ingDiv);
}
*/


function tryConvertingUnits(pantryItem, ingredient)
{
	var itemAmountNeeded = 1;

	var ingredientAmountNeeded = parseFloat(ingredient.amount);
	var quantityInOneItemUsingItemUnit = parseFloat(pantryItem.amount);

	//reconcile unit discrepancy
	var quantityInOneItemUsingListUnit = convertUnits(quantityInOneItemUsingItemUnit, pantryItem.unit, ingredient.unit); 
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
	var name;
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
		var ind = localData.savedShoppingLists.findIndex(findSameName);
		
		//passed validation
		document.getElementById('saveShoppingListMsg').innerHTML = 'Saved ' + name;
		document.getElementById('shoppingListName').value = '';
		
		//make list
		var newList = {
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
	var node = document.getElementById('savedShoppingLists');
	while (node.firstChild)
	{
		node.removeChild(node.firstChild);
	}
	
	localData.savedShoppingLists.forEach(function(curList, ind){
		
        var div = document.createElement('div');
		div.classList.add('savedList');

			var loadBtn = document.createElement('input');
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
		
			var name = document.createElement('span');
			name.innerHTML = curList.name;
			name.style.fontSize = '1.5em';
			div.appendChild(name);
			
			var deleteBtn = document.createElement('input');
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
	var sugar = 0;
	var protein = 0;
	var calories = 0;
	var carbs = 0;
	var fat = 0;
	var price = 0;
	sessionData.scheduledIngredients.forEach(function(ing){
		if (ing.stagedPantryItems)
		{
			ing.stagedPantryItems.forEach(function(item){
				sugar += parseFloat(item.sugar);
				protein += parseFloat(item.protein);
				calories += parseFloat(item.calories);
				carbs += parseFloat(item.carbs);
				fat += parseFloat(item.fat);
				price += parseFloat(item.price);
			})
		}
	})
	
	shoppingListSession.actualItemsOnList.forEach(function(item){
		if (item != null && item != undefined && !isNaN(parseFloat(item)))
		{	
			sugar += parseFloat(item.sugar);
			protein += parseFloat(item.protein);
			calories += parseFloat(item.calories);
			carbs += parseFloat(item.carbs);
			fat += parseFloat(item.fat);
			price += parseFloat(item.price);	
		}
	})
	
	document.getElementById('sugarShoppingTotal').innerHTML = sugar; 
	document.getElementById('proteinShoppingTotal').innerHTML = protein;
	document.getElementById('caloriesShoppingTotal').innerHTML = calories;
	document.getElementById('carbsShoppingTotal').innerHTML = carbs;
	document.getElementById('fatShoppingTotal').innerHTML = fat;
	document.getElementById('storeShoppingTotalPrice').innerHTML = price;
	/*
					<div>
						<div><label>Sugar: </label><span id="sugarShoppingTotal"></span>g</div>
						<div><label>Protein: </label><span id="proteinShoppingTotal"></span>g</div>
					</div>
					<div>
						<div><label>Calories: </label><span id="caloriesShoppingTotal"></span></div>
						<div><label>Carbs: </label><span id="carbsShoppingTotal"></span>g</div>
					</div>
					<div>
						<div><label>Fat: </label><span id="fatShoppingTotal"></span>g</div>
						<div><label>Total Cost: $</label><span id="storeShoppingTotalPrice"></span><br /></div>
					</div>
	*/
}