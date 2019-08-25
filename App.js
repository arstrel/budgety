
//Budget controller
const budgetController = (() => {
 
  const Income = function(id, description, value) {
    this.id = id,
    this.description = description,
    this.value = value
  }

  //instead if classic coonstructor look we also can use object destructure
  //return {id, description, value}
  const Expense = function(id, description, value) {
    return {id, description, value}
  }

  const data = {
    allItems: {
      exp: [],
      inc: [],
    },
    totals: {
      exp: 0,
      inc: 0,
    }
  }

 
  return {
    addItem: (type, desc, val) => {
      let newItem, id;

      // Create new ID
      data.allItems[type].length > 0
      ? id = data.allItems[type][data.allItems[type].length - 1].id + 1
      : id = 0;

      type === 'exp' && (newItem = new Expense(id, desc, val));
      type === 'inc' && (newItem = new Income(id, desc, val));

      data.allItems[type].push(newItem)
      return newItem;
    },
    getData: () => {
      return data
    }

  }

})();

//UI controller
const UIController = (() => {

  const DOMStrings = {
    inputType:'.add__type', 
    inputDescription: '.add__description',
    inputValue:'.add__value',
    inputBtn: '.add__btn',
  }
  


  return {
    getInput: () => {
      return {
        type: document.querySelector(DOMStrings.inputType).value, //will be inc or exp
        description: document.querySelector(DOMStrings.inputDescription).value,
        value: document.querySelector(DOMStrings.inputValue).value,
      }
    },

    getDOMStrings: () => {
      return DOMStrings
    }
  }

})();


//Global app controller
const controller = ((budgetCtrl, UICtrl) => {
  const ctrlAddItem = () => {

    //get input field data
    const input = UICtrl.getInput()
    
    //add item to budget controller
    let newItem = budgetCtrl.addItem(input.type, input.description, input.value)

    //add item ti UI

    //calc the budget

    //display budget to ui

  };

  const setupEventListeners = () => {
    const DOM = UIController.getDOMStrings();

    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

    document.addEventListener('keypress', (e) => {
      //if enter key clicked
      e.keyCode === 13 && ctrlAddItem();
    });
  };

  return {
    init: () => {
      console.log('App ready to go.');
      setupEventListeners();
    }
  }

})(budgetController, UIController);

controller.init();