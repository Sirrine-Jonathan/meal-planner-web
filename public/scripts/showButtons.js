/*
* 
*
*
*
*/

//true if button is depressed
var startPage = false;
var planMeals = false;
var myPantry = false;
var shopping = false;

document.getElementById('showHome').addEventListener('click', function(){
	updateCommunityRecipes();
	
	//blocks
	document.getElementById('chooseRecipeContainer').style.display = 'none';
	document.getElementById('myPantry').style.display = 'none';
	document.getElementById('shoppingListContainer').style.display = 'none';
	document.getElementById('startPage').style.display = 'block';
	
	//depress this button
	if (!startPage)
	{
		this.style.boxShadow = 'none';
		moveElementDownAndRight(this, 4);
		startPage = true;
	}
	
	//planMeals
	if (planMeals)
	{
		document.getElementById('showPlanner').style.boxShadow = "4px 4px 1px 0 white";
		moveElementUpAndLeft(document.getElementById('showPlanner'), 4);
		planMeals = false;
	}
	
	//myPantry
	if (myPantry)
	{
		document.getElementById('showPantry').style.boxShadow = "4px 4px 1px 0 white";
		moveElementUpAndLeft(document.getElementById('showPantry'), 4);
		myPantry = false;
	}
	
	if (shopping)
	{
		document.getElementById('showShopping').style.boxShadow = "4px 4px 1px 0 white";
		moveElementUpAndLeft(document.getElementById('showShopping'), 4);
		shopping = false;
	}
})

document.getElementById('showShopping').addEventListener('click', function(){
	updateRecipes();
	updateLoadList();
	
	//blocks
	document.getElementById('chooseRecipeContainer').style.display = 'none';
	document.getElementById('myPantry').style.display = 'none';
	document.getElementById('startPage').style.display = 'none';
	document.getElementById('shoppingListContainer').style.display = 'block';
	
	//depress this button
	if (!shopping)
	{
		this.style.boxShadow = 'none';
		moveElementDownAndRight(this, 4);
		shopping = true;
	}

	//startPage
	if (startPage)
	{
		document.getElementById('showHome').style.boxShadow = "4px 4px 1px 0 white";
		moveElementUpAndLeft(document.getElementById('showHome'), 4);
		startPage = false;
	}
	
	//myPantry
	if (myPantry)
	{
		document.getElementById('showPantry').style.boxShadow = "4px 4px 1px 0 white";
		moveElementUpAndLeft(document.getElementById('showPantry'), 4);
		myPantry = false;
	}
	
	//planMeals
	if (planMeals)
	{
		document.getElementById('showPlanner').style.boxShadow = "4px 4px 1px 0 white";
		moveElementUpAndLeft(document.getElementById('showPlanner'), 4);
		planMeals = false;
	}
	
})

document.getElementById('showPlanner').addEventListener('click',function(){
	updateRecipes();
	
	//blocks
	document.getElementById('chooseRecipeContainer').style.display = 'block';
	document.getElementById('myPantry').style.display = 'none';
	document.getElementById('startPage').style.display = 'none';
	document.getElementById('shoppingListContainer').style.display = 'none';
	
	//depress this button
	if (!planMeals)
	{
		this.style.boxShadow = 'none';
		moveElementDownAndRight(this, 4);
		planMeals = true;
	}
	
	//startPage
	if (startPage)
	{
		document.getElementById('showHome').style.boxShadow = "4px 4px 1px 0 white";
		moveElementUpAndLeft(document.getElementById('showHome'), 4);
		startPage = false;
	}
	
	//myPantry
	if (myPantry)
	{
		document.getElementById('showPantry').style.boxShadow = "4px 4px 1px 0 white";
		moveElementUpAndLeft(document.getElementById('showPantry'), 4);
		myPantry = false;
	}
	
	if (shopping)
	{
		document.getElementById('showShopping').style.boxShadow = "4px 4px 1px 0 white";
		moveElementUpAndLeft(document.getElementById('showShopping'), 4);
		shopping = false;
	}
})

document.getElementById('showPantry').addEventListener('click', function(){
	updatePantry();
	updatePantryTotals();
	
	//blocks
	document.getElementById('chooseRecipeContainer').style.display = 'none';
	document.getElementById('myPantry').style.display = 'block';
	document.getElementById('startPage').style.display = 'none';
	document.getElementById('shoppingListContainer').style.display = 'none';
	
	//depress this button
	if (!myPantry)
	{
		this.style.boxShadow = 'none';
		moveElementDownAndRight(this, 4);
		myPantry = true;
	}
	
	//startPage
	if (startPage)
	{
		document.getElementById('showHome').style.boxShadow = "4px 4px 1px 0 white";
		moveElementUpAndLeft(document.getElementById('showHome'), 4);
		startPage = false;
	}
	
	//planMeals
	if (planMeals)
	{
		document.getElementById('showPlanner').style.boxShadow = "4px 4px 1px 0 white";
		moveElementUpAndLeft(document.getElementById('showPlanner'), 4);
		planMeals = false;
	}
	
	if (shopping)
	{
		document.getElementById('showShopping').style.boxShadow = "4px 4px 1px 0 white";
		moveElementUpAndLeft(document.getElementById('showShopping'), 4);
		shopping = false;
	}
});

//moves an relataive or absolutely positioned element down and to the right
//a specified pixel amount
function moveElementDownAndRight(element, px)
{
	var top = parseInt(window.getComputedStyle(element).top);
	var left = parseInt(window.getComputedStyle(element).left);
	
	top += px;
	left += px;
	
	element.style.top = (top + 'px');
	element.style.left = (left + 'px');
}

//moves a relative or absolutely positioned element up and left
//a specified pixel amount
function moveElementUpAndLeft(element, px)
{
	var top = parseInt(window.getComputedStyle(element).top);
	var left = parseInt(window.getComputedStyle(element).left);
	
	top -= px;
	left -= px;
	
	element.style.top = (top + 'px');
	element.style.left = (left + 'px');
}