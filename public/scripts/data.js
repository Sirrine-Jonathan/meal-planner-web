/*
*
*
*
*
*/
let localData = {
	'ingredientList': [

	],
	'recipes': [

	],
	'pantryItemList': {
        "barcode": {},
        "noBarcode": {}
    },
	'savedMealPlans': [
		
	],
	'savedShoppingLists':[
		
	]
};
let sessionData = {
	'scheduledRecipes': [],
	'scheduledIngredients': [],
	'shoppingList':[]
};

let sortSettings = {
	'community': {
		'category':'All',
		'sortBy':'az',
	},
	'user': {
		'category':'All',
		'sortBy':'az',
	}
}

function updateData(callback, extension){
	let userData;
	let dataToUpdate;
	if (extension) {
        userData = firebase.database().ref('users/' + user.uid + "/" + extension);
        dataToUpdate = localData[extension];
    } else {
        userData = firebase.database().ref('users/' + user.uid);
        dataToUpdate = localData;
    }
	userData.update(dataToUpdate).then((result) => {
		userData.once("value").then((snapshot) => {
			console.log(snapshot.val());
		})
	}, (err) => {
		throw new Error("failed to save");
	});
	
	if(callback)
	{
		callback();
	}
}

/*
window.onbeforeunload = updateData();
window.onunload = updateData();
*/

let unitsArr = [
	"cup",
	"fluid ounce",
	"pint",
	"teaspoon",
	"tablespoon",
	"quart",
	"ounce",
	"slice",
	"grams"
];
let selectsArr = document.getElementsByClassName('unitsSelect');
function setupUnitSelects(unitsArr, selectsArr, justOne = false){
	
	if (!unitsArr)
	{
		unitsArr = [
			"cup",
			"fluid ounce",
			"pint",
			"teaspoon",
			"tablespoon",
			"quart",
			"ounce",
			"slice",
			"grams"
		];	
	}
	
	unitsArr.sort(compare);
	function compare(a, b) {
	  // Use toUpperCase() to ignore character casing
	  const nameA = a.toUpperCase();
	  const nameB = b.toUpperCase();

	  let comparison = 0;
	  if (nameA > nameB) {
		comparison = 1;
	  } else if (nameA < nameB) {
		comparison = -1;
	  }
	  return comparison;
	}
	unitsArr.unshift("-none-");
	
	if(justOne)
	{
		unitsArr.forEach(function(unit){
			let op = document.createElement('option');
			op.value = unit;
			op.innerHTML = unit;
			selectsArr.appendChild(op);
		})
	}
	else{
		for ( let i = 0; i < selectsArr.length; i++ )
		{
			unitsArr.forEach(function(unit){
				let op = document.createElement('option');
				op.value = unit;
				op.innerHTML = unit;
				selectsArr[i].appendChild(op);
			})
		}
	}
}


//sort function
function compareId(a, b) {
  let comparison = 0;
  if (a.id > b.id) {
	comparison = 1;
  } else if (a.id < b.id) {
	comparison = -1;
  }
  return comparison;
}

function updateObjInArr(arr, obj)
{
	arr.sort(compareId)
	arr[id] = obj;
}

function decodeHtml(html) {
	let txt = document.createElement("textarea");
	txt.innerHTML = html;
	return txt.value;
}