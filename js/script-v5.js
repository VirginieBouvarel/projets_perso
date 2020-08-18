/**
 * Troisième version
 * Refactoring
 */


/*Récupération des éléments du DOM*/
const display = document.querySelector('#display');
const allkeys = document.querySelector('#all-keys');
const keys = Array.from(document.querySelectorAll('.key'));
const [ac,one, two, three,four,five,six,seven,eight,nine,zero,dot,plus,minus,multiply,divide,percent,erase,equal] = keys;

/*Variables*/
const operatorsArray = ["%", "/", "*", "-", "+"]
let elementsToCalculate;


/*Affichage des caractères sur l'écran en fonction des touches cliquées*/
allkeys.addEventListener('click', event => {
   const isAnOperator = (event.target.textContent === "+" || 
                         event.target.textContent === "-" || 
                         event.target.textContent === "x" || 
                         event.target.textContent === "÷");
    const isAPercent = event.target.textContent === "%";    
   if (isAnOperator) {
       display.textContent += ` ${event.target.textContent} `;
   }else if (isAPercent){
        display.textContent +=` ${event.target.textContent}`;
   }else{//is a  Number
       display.textContent += `${event.target.textContent}`;
   }
});

/*Suppression du dernier caractère affiché*/
erase.addEventListener('click', event => {
    event.stopPropagation();
    display.textContent = display.textContent.slice(0,-1);
});

/*Reset complet de l'affichage*/
ac.addEventListener('click', event => {
    event.stopPropagation();
    display.textContent = "";
} )

/*Execution du calcul au clic sur la touche égal*/
equal.addEventListener('click', event => {
    event.stopPropagation();
    const result = calculate();
    display.textContent = result;
});



function calculate(){
    elementsToCalculate = display.textContent.split(" ").map(item => {
        if (item === "x") return "*";
        if (item === "÷") return "/";
        if (item === "+" || item === '-' || item === "%") return item;
        return parseFloat(item);
    });
    while(elementsToCalculate.length > 1){
        operatorsArray.forEach(operator => {
            while(hasOperator(operator)) {
                calculateByOperator(operator, getOperatorIndex(operator));
            } 
        });   
    }
    return elementsToCalculate[0];
}

function hasOperator(operator) {
    return elementsToCalculate.indexOf(operator) > -1;
}

function getOperatorIndex(operator) {
     return elementsToCalculate.indexOf(operator);
}

function calculateByOperator(operator, operatorIndex) {
    let calc;
    let numberToDelete = 3;//Operateur, nombre d'avant et nombre d'après 

    switch(operator) {
        case "%":
            calc = elementsToCalculate[operatorIndex - 1] / 100;
            numberToDelete = 2;//Pourcent et nombre d'avant
            break;
        case "/":
            calc = elementsToCalculate[operatorIndex - 1] / elementsToCalculate[operatorIndex + 1]; 
            break;
        case "*":
            calc = elementsToCalculate[operatorIndex - 1] * elementsToCalculate[operatorIndex + 1];
            break;
        case "-":
            calc = elementsToCalculate[operatorIndex - 1] - elementsToCalculate[operatorIndex + 1];
            break;
        case "+":
            calc = elementsToCalculate[operatorIndex - 1] + elementsToCalculate[operatorIndex + 1];
            break;
    }
    elementsToCalculate.splice((operatorIndex - 1), numberToDelete, calc);
}

