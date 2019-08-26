//Budget controller
const budgetController = (() => {
  const Income = function(id, description, value) {
    this.id = id
    this.description = description
    this.value = value;
  };

  //instead of classic coonstructor object destructuring can be used
  //return {id, description, value}
  //but in this case the result would be just object,
  //not identified as of a class Income or Expense
  //and prototype will not work then
  const Expense = function(id, description, value) {
    this.id = id
    this.description = description
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function(totalIncome){
    if(totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function () {
    return this.percentage;
  }

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

    calculatePercentages: () => {

      /*
      a=20
      b=10
      c=40
      income=100
      a=20/100=20%
      */  

      data.allItems.exp.forEach(el => {
        el.calcPercentage(data.totals.inc);
      });

    },

    getPercentages: () => {
      let allPerc = data.allItems.exp.map(curr => {
        return curr.getPercentage();
      })
      return allPerc
    },

    getBudget: () => {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      }
    },

    deleteItem: (type, id) => {
      /*
      also may use .map to figure out index of the el with necessary id
      and then delete it with the splice

      let ids = data.allItems[type].map(curr => {
        return curr.id
      }

      let index = ids.indexOf(id)
      index !== -1 && data.allItems[type].splice(index, 1)
      */


      data.allItems[type] = data.allItems[type].filter(el => {
        //we are actually comparing number to a string here but it works thanks to a coersion 
        return el.id != id
      })
     
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
    container: '.container',
    expensesPercLabel: '.item__percentage',
    dateLabel: '.budget__title--month',
    inputType: '.add__type'
  };

  const formatNumber = (num, type) => {
    let int, dec, sign;
    //+ or - before the number 
    // 2 decimal points
    //comma separating the thousands
    // 2310.5340 => + 2,310.53
    // 2000 => + 2,000.00

    num = Math.abs(num);
    num = num.toFixed(2);
    [int, dec] = num.split('.');

    if(int.length > 3) {
      // 23510 => 23,510 
      int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, int.length); 
    }
    if(type === 'exp') {
      sign = '-'
    } else if (type === 'inc') {
      sign = '+'
    } else {
      sign = ''
    }

    return `${sign}  ${int}.${dec}`
  }

   

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
        html = `<div class="item clearfix" id="inc-%id%">
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
        html = ` <div class="item clearfix" id="exp-%id%">
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
      newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));

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
      let type;
      if(obj.budget !== 0) {
        obj.budget > 0 ? type = 'inc' : type = 'exp'
      } else {
        type = 'balanced'
      }

      document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
      document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
      document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
      if(obj.percentage > 0) {
        document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
      } else {
        document.querySelector(DOMStrings.percentageLabel).textContent = '---';
      }
    },

    displayPercentages: (percentages) => {
      let fields = document.querySelectorAll(DOMStrings.expensesPercLabel);

      //fields is NodeList but since recently NodeLists have forEach already
      /*
      nodeListForEach = function (list, callback) {
        for(let i = 0; i < list.length; i++) {
          callback(list[i], i);
        }
      }
      */

      fields.forEach((el, i) => {
        if(percentages[i] > 0) {
          el.textContent = percentages[i] + '%'
        } else {
          el.textContent = '---'
        }
      })

    },

    deleteListItem: (selectorId) => {
      const element = document.getElementById(selectorId);
      element.parentNode.removeChild(element);
    },

    displayMonth:() => {
      
      let now = new Date();
  
      month = now.toLocaleString('default', { month: 'long' });
      document.querySelector(DOMStrings.dateLabel).textContent = month;
      
    },

    changeType: () => {
      let fields = document.querySelectorAll(
        `${DOMStrings.inputType},
        ${DOMStrings.inputDescription},
        ${DOMStrings.inputValue}`
        );
      document.querySelector(DOMStrings.inputBtn).classList.toggle('red');

      fields.forEach(field => {
        field.classList.toggle('red-focus')
      })
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

  const updatePercentages = () => {
    //calc the persentages
    budgetCtrl.calculatePercentages();
    //read percentage from budgetCtrl
    let percentages = budgetCtrl.getPercentages();
    //update UI with new percentages
    UICtrl.displayPercentages(percentages);
  }

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

        //update percentages
        updatePercentages();
    } 
  };

  const ctrlDeleteItem = (e) => {
    let itemId = e.target.parentNode.parentNode.parentNode.parentNode.id;
    if(itemId) {
      //looks like inc-2 or exp-0
      //using destructuring to get type and id
      let [type, id] = itemId.split('-');

      // delete the item from data
      budgetCtrl.deleteItem(type, id)
      //delete from the UI
      UICtrl.deleteListItem(itemId)

      //update and show new budget
      updateBudget();

      //update percentages
      updatePercentages();
    }

  }

  const setupEventListeners = () => {
    const DOM = UIController.getDOMStrings();

    document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);

    document.addEventListener("keypress", e => {
      //if enter key clicked
      e.keyCode === 13 && ctrlAddItem();
    });

    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

    document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
  };

  return {
    init: () => {
      console.log("App ready to go.");
      UICtrl.displayMonth();
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
