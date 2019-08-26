//Budget controller
const budgetController = (() => {
  const Income = function(id, description, value) {
    (this.id = id), (this.description = description), (this.value = value);
  };

  //instead if classic coonstructor look we also can use object destructure
  //return {id, description, value}
  const Expense = function(id, description, value) {
    return { id, description, value };
  };

  const calcTotal = (type) => {
    let sum = 0;
    sum = data.allItems[type].reduce((a,b) => {
      return a + b.value
    }, 0)

    data.totals[type] = sum
  }

  const data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };

  return {
    addItem: (type, desc, val) => {
      let newItem, id;

      // Create new ID
      data.allItems[type].length > 0
        ? (id = data.allItems[type][data.allItems[type].length - 1].id + 1)
        : (id = 0);

      if (type === "exp") {
        newItem = new Expense(id, desc, val);
      } else if (type === "inc") {
        newItem = new Income(id, desc, val);
      }

      data.allItems[type].push(newItem);
      return newItem;
    },
    getData: () => {
      return data;
    },

    calculateBudget: () => {
      //calc total inc 
      calcTotal('exp');     
      calcTotal('inc');

      //calc the budget as total inc - total exp
      data.budget = data.totals.inc - data.totals.exp;

      //calc percentage of income that we spent already 
      if(data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },
    getBudget: () => {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      }
    }
  };
})();

//UI controller
const UIController = (() => {
  const DOMStrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputBtn: ".add__btn",
    incomeContainer: ".income__list",
    expenseContainer: ".expenses__list",
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
  };

  return {
    getInput: () => {
      return {
        type: document.querySelector(DOMStrings.inputType).value, //will be inc or exp
        description: document.querySelector(DOMStrings.inputDescription).value,
        //+ to convert string to a number
        value: +document.querySelector(DOMStrings.inputValue).value
      };
    },

    getDOMStrings: () => {
      return DOMStrings;
    },

    addListItem: (obj, type) => {
      //Create HTML string with placeholder text
      let html, newHtml, element;
      if (type === "inc") {
        element = DOMStrings.incomeContainer;
        html = `<div class="item clearfix" id="income-%id%">
            <div class="item__description">%description%</div>
              <div class="right clearfix">
                  <div class="item__value">%value%</div>
                  <div class="item__delete">
                  <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
              </div>
            </div>
          </div>`;
      } else if (type === "exp") {
        element = DOMStrings.expenseContainer;
        html = ` <div class="item clearfix" id="expense-%id%">
            <div class="item__description">%description%</div>
            <div class="right clearfix">
                <div class="item__value">%value%</div>
                <div class="item__percentage">21%</div>
                <div class="item__delete">
                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                </div>
            </div>
          </div>`;
      }

      //replace the placeholder with actual data that we receive from the object
      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", obj.value);

      //insert html into the DOM
      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },

    clearFields: () => {
      let fields, fieldsArr;
      fields = document.querySelectorAll(
        `${DOMStrings.inputDescription}, ${DOMStrings.inputValue}`
      );

      //it would be easier to use spread operator [...fields]
      //but I'll use prototype and call here to create a copy and
      // convert list into an array
      fieldsArr = Array.prototype.slice.call(fields);

      fields.forEach(element => {
        element.value = "";
      });

      fieldsArr[0].focus();
    },

    displayBudget: (obj) => {
      document.querySelector(DOMStrings.budgetLabel).textContent = obj.budget;
      document.querySelector(DOMStrings.incomeLabel).textContent = obj.totalInc;
      document.querySelector(DOMStrings.expensesLabel).textContent = obj.totalExp;
      if(obj.percentage > 0) {
        document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
      } else {
        document.querySelector(DOMStrings.percentageLabel).textContent = '---';
      }
    }
  };
})();

//Global app controller
const controller = ((budgetCtrl, UICtrl) => {
  const updateBudget = () => {
    //calc the budget
    budgetCtrl.calculateBudget()
    //return the budget
    let budget = budgetCtrl.getBudget()
    //display budget to ui
    UICtrl.displayBudget(budget);
    
  };

  const ctrlAddItem = () => {
    //get input field data
    const input = UICtrl.getInput();

    if(input.description !== '' && input.value > 0){
      
      //add item to budget controller
      let newItem = budgetCtrl.addItem(
        input.type,
        input.description,
        input.value
        );
        
        //add item to UI
        UICtrl.addListItem(newItem, input.type);
        //clear fields
        UICtrl.clearFields();
        
        //calc and update budget
        updateBudget();
    } 
  };

  const setupEventListeners = () => {
    const DOM = UIController.getDOMStrings();

    document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);

    document.addEventListener("keypress", e => {
      //if enter key clicked
      e.keyCode === 13 && ctrlAddItem();
    });
  };

  return {
    init: () => {
      console.log("App ready to go.");
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      });
      setupEventListeners();
    }
  };
})(budgetController, UIController);

controller.init();
