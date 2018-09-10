/*
*
*
*
*
*/
var localData = {
	'ingredientList': [
		{name: "Bacon", unit: "slice"},
		{name: "Butter", unit: "tablespoon"},
		{name: "Egg", unit: "-none-"},
		{name: "Cheese", unit: "slice"}
	],
	'recipes': [
	],
	'pantryItemList':[
		{"name":"Great Value Thick Sliced Bacon",
		"correspondingingredient":"Bacon",
		"unit":"ounce",
		"servingsizeunit":"grams",
		"amount":"24",
		"servingsize":"17",
		"store":"Walmart",
		"price":"3.94",
		"sugar":"0",
		"protein":"6",
		"calories":"80",
		"carbs":"0",
		"fat":"6",
		"amountinpantry":1},
		{"name":"Great Value American Cheese Singles",
		"correspondingingredient":"Cheese",
		"unit":"slice",
		"servingsizeunit":"grams",
		"amount":"16",
		"servingsize":"21",
		"store":"Walmart",
		"price":"3.99",
		"sugar":"1",
		"protein":"3",
		"calories":"70",
		"carbs":"2",
		"fat":"5",
		"amountinpantry":1}
	],
	'savedMealPlans': [
		
	],
	'savedShoppingLists':[
		{
			"name":"Bacon & Eggs All Week","shoppingList":[],
			"scheduledIngredients":[
				{"name":"Bacon","amount":21,"unit":"slice", "stagedpantryItems":[] },
				{"name":"Egg","amount":28,"unit":"-none-", "stagedpantryitems":[] },
				{"name":"Cheese","amount":14,"unit":"slice", "stagedpantryitems":[] },
				{"name":"Butter","amount":7,"unit":"tablespoon", "stagedpantryitems":[] }
				],
			"mobile": []
		}	
	]
}
var sessionData = {
	'scheduledRecipes': [],
	'scheduledIngredients': [],
	'shoppingList':[]
}

var sortSettings = {
	'community': {
		'category':'All',
		'sortBy':'az',
	},
	'user': {
		'category':'All',
		'sortBy':'az',
	}
}

function updateData(callback){
	var userData = firebase.database().ref('users/' + user.uid);
	userData.update(localData);
	
	if(callback)
	{
		callback();
	}
}

/*
window.onbeforeunload = updateData();
window.onunload = updateData();
*/

var unitsArr = [
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
var selectsArr = document.getElementsByClassName('unitsSelect');
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
			var op = document.createElement('option');
			op.value = unit;
			op.innerHTML = unit;
			selectsArr.appendChild(op);
		})
	}
	else{
		for ( var i = 0; i < selectsArr.length; i++ )
		{
			unitsArr.forEach(function(unit){
				var op = document.createElement('option');
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
	var txt = document.createElement("textarea");
	txt.innerHTML = html;
	return txt.value;
}