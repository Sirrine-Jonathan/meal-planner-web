//write adjustments for units here
	/*
	"teaspoon",
	"tablespoon",
	"fluid ounce",
	"cup",
	"pint",
	"quart"
	"slice"
	*/

//returns the number of functions needed to convert a given number of units
function findNumberOfFunctions(numberOfUnits)
{
   var num = 0;
   for(var i = numberOfUnits; i > 0; i--)
   {
	  numberOfUnits--;
      num += numberOfUnits
   }	   
   return num;
}

//object whose methods are used to convert units
var unitConversions = {
	
	//volume
	
	'teaspoon': {
		'toTeaspoon':       function(amount){ return amount;              },
		'toTablespoon':     function(amount){ return amount * 0.333333;   },
		'toFluidOunce':     function(amount){ return amount * 0.166667;   },
		'toCup':            function(amount){ return amount * 0.0205372;  },
		'toPint':           function(amount){ return amount * 0.0104167   },
		'toQuart':          function(amount){ return amount * 0.00520833; },
	},
	
	'tablespoon': {
		'toTeaspoon':     function(amount){ return amount * 3;          },
		'toTablespoon':   function(amount){ return amount;              },
		'toFluidOunce':   function(amount){ return amount * 0.5;        },
		'toCup':          function(amount){ return amount * 0.0616115;  },
		'toPint':         function(amount){ return amount * 0.03125;    },
		'toQuart':        function(amount){ return amount * 0.0015625;  }
	},
	
	'fluid ounce': {
		'toTeaspoon':     function(amount){ return amount * 6;          },
		'toTablespoon':   function(amount){ return amount * 2;          },
		'toFluidOunce':   function(amount){ return amount;              },
		'toCup':          function(amount){ return amount * 0.123223;   },
		'toPint':         function(amount){ return amount * 0.0625;     },
		'toQuart':        function(amount){ return amount * 0.03125;    }
	},
	
	'cup': {
		'toTeaspoon':            function(amount){ return amount * 48.6922;    },
		'toTablespoon':          function(amount){ return amount * 16.2307;    },
		'toFluidOunce':          function(amount){ return amount * 8.11537;    },
		'toCup':                 function(amount){ return amount;              },
		'toPint':                function(amount){ return amount * 0.50721;    },
		'toQuart':               function(amount){ return amount * 0.253605;   }
	},
	
	'pint': {
		'toTeaspoon':           function(amount){ return amount * 96;         },
		'toTablespoon':         function(amount){ return amount * 32;         },
		'toFluidOunce':         function(amount){ return amount * 16;         },
		'toCup':                function(amount){ return amount * 1.97157;    },
		'toPint':               function(amount){ return amount;              },
		'toQuart':              function(amount){ return amount * 0.5;        }
	},
	
	'quart': {
		'toTeaspoon':          function(amount){ return amount * 192;        },
		'toTablespoon':        function(amount){ return amount * 64;         },
		'toFluidOunce':        function(amount){ return amount * 32;         },
		'toCup':               function(amount){ return amount * 3.94314;    },
		'toPint':              function(amount){ return amount * 2;          },
		'toQuart':             function(amount){ return amount;              }
	},
	
	//weight
	
	'ounce': {
		'toOunce':             function(amount){ return amount;              },
		'toSlice':             function(amount){ return amount;              },
		'toGrams':             function(amount){ return amount * 28.3495;    }
	},
	
	'slice': {
		'toOunce':             function(amount){ return amount;              },
		'toSlice':             function(amount){ return amount;              },
		'toGrams':             function(amount){ return amount * 28.3495;    }
	},
	
	'grams': {
		'toOunce':             function(amount){ return amount;              },
		'toSlice':             function(amount){ return amount;              },
		'toGrams':             function(amount){ return amount;              }
	}
}

//calls the appropriate conversion function 
//converts a specified amount from units to desired units
/*
	por ejemplo:
	
	convertUnits(parseFloat(pantryItem.amount), pantryItem.unit, ingredient.unit)
	returns the new amount for the pantry item using the ingredient unit instead
*/
function convertUnits(amount, units, desiredUnits) 
{
	
	//turn desiredUnits (i.e. pint) into toPint for second index in unitConverions
	var outerIndex = 'to' + desiredUnits.charAt(0).toUpperCase() + desiredUnits.slice(1);
	
	//access the function and call it, passing the amount
	var newAmount;
	try {
		newAmount = unitConversions[units][outerIndex](amount);
	}
	catch (e)
	{
		return false;
	}
	//return the new converted amount
	return newAmount;
}