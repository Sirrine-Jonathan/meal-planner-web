/*
* Usage: 
* 
*			array.sort(fn);
*
* 	place the correct function name in place of 'fn'
*/

/*
* 	sorts arrays alphabetically
*/
function compareAlpha(a, b) {
  // Use toUpperCase() to ignore character casing
  const nameA = a.name.toUpperCase();
  const nameB = b.name.toUpperCase();

  let comparison = 0;
  if (nameA > nameB) {
	comparison = 1;
  } else if (nameA < nameB) {
	comparison = -1;
  }
  return comparison;
}

/*
* 	sorts arrays REVERSE alphabetically
*/
function compareReverseAlpha(a, b) {
  // Use toUpperCase() to ignore character casing
  const nameA = a.name.toUpperCase();
  const nameB = b.name.toUpperCase();

  let comparison = 0;
  if (nameA < nameB) {
	comparison = 1;
  } else if (nameA > nameB) {
	comparison = -1;
  }
  return comparison;
}

/*
* 	sorts arrays by submitter
*/
function compareSubmitter(a, b) {
  // Use toUpperCase() to ignore character casing
  const nameA = a.submitter.toUpperCase();
  const nameB = b.submitter.toUpperCase();

  let comparison = 0;
  if (nameA > nameB) {
	comparison = 1;
  } else if (nameA < nameB) {
	comparison = -1;
  }
  return comparison;
}

/*
* 	sorts arrays by Date
*/
function compareDate(a, b) {
  const nameA = a.creationDate;
  const nameB = b.creationDate;

  let comparison = 0;
  if (nameA < nameB) {
	comparison = 1;
  } else if (nameA < nameB) {
	comparison = -1;
  }
  return comparison;
}

/*
*   sorts an array by number, lets user define property, and low or high
*/
function findLowOrHighProperty(arr, property, low = true)
{	
	function sortByHighest(a, b) {
		const propA = a[property];
		const propB = b[property];

		let comparison = 0;
		if (propA < propB) {
		comparison = 1;
		} else if (propA < propB) {
		comparison = -1;
		}
		return comparison;
	}
	
	function sortByLowest(a, b) {
		const propA = a[property];
		const propB = b[property];

		let comparison = 0;
		if (propA > propB) {
		comparison = 1;
		} else if (propA < propB) {
		comparison = -1;
		}
		return comparison;
	}
	
	var sortedArray;
	if (low)
		sortedArray = arr.sort(sortByLowest);
	else
		sortedArray = arr.sort(sortByHighest);
	
	return sortedArray[0];
}

var CATEGORY_CRITERIA = "";
function findRecipe(a) {
	if( a.category.indexOf(CATEGORY_CRITERIA) >= 0)
		return true;
}


