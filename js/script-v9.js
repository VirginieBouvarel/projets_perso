/*Récupération des éléments du DOM*/
const display = document.querySelector('#display');
const allkeys = document.querySelector('#all-keys');
const keys = Array.from(document.querySelectorAll('.key'));
const [ac,one, two, three,four,five,six,seven,eight,nine,zero,dot,plus,minus,multiply,divide,percent,erase,equal] = keys;

const operatorsList = ["%", "÷", "x", "-", "+"];
const strictOperatorsList = ["÷", "x", "-", "+"];//sans les %

/*Affichage des caractères sur l'écran en fonction des touches cliquées*/
allkeys.addEventListener('click', event => verifyDisplay(event));

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
    display.textContent = calculate();
});


function verifyDisplay(event) {
    let previousKey = getLastKey();
    const isAnOperator = strictOperatorsList.includes(event.target.textContent);
    const isAPercent = event.target.textContent === "%";
    const isADot = event.target.textContent === ".";
    const isANumber = event.target.textContent.search(/[0-9]/) > -1;
    const isAMultiSelect = event.target.textContent.replace(/\s*/gi, "") === "AC1234567890.+-x÷%❮=";//fix d'un bug lors d'une sélection à la souris de plusieurs cases
    

    switch (true) {
        //Verrouillage des saisies non autorisées
        case (isAMultiSelect):
        case (isADot && previousKey === "."):
        case (isADot && previousKey === "%"):
        case (isAPercent && operatorsList.includes(previousKey)):
        case (isANumber && previousKey === "%"):
            display.textContent += "";
            break;

        //Gestion des nombres décimaux
        case (isAPercent && previousKey === "."):
        case (isAnOperator && previousKey === "."):
            display.textContent += `0 ${event.target.textContent} `;
            break;
        case (isADot && operatorsList.includes(previousKey)):
            display.textContent += `0${event.target.textContent} `;
            break;

        //Gestion des nombres négatifs


        //Affichages classiques
        case (isAnOperator):
            display.textContent += ` ${event.target.textContent} `;
            break;
        case (isAPercent):
            display.textContent +=` ${event.target.textContent}`;
            break;
        default://is a number
            display.textContent += `${event.target.textContent}`;
    }
}









function getLastKey() {
    let lastKeyDisplayed = "" || display.textContent[display.textContent.length -1];//""--> si première saisie
    if (lastKeyDisplayed === " "){
        return display.textContent[display.textContent.length -2];
    }else{
        return lastKeyDisplayed;
    }
}
function calculate() {
    const elementsToCalculate = display.textContent.split(" ").map(item => {
        if (operatorsList.includes(item)) return item;
        return parseFloat(item);
    });
    while(elementsToCalculate.length > 1){
        operatorsList.forEach(operator => {
            while(hasOperator(operator, elementsToCalculate)) {
                calculateByOperator(operator, getOperatorIndex(operator, elementsToCalculate), elementsToCalculate);
            } 
        });   
    }
    return elementsToCalculate[0];
}

function hasOperator(operator, elementsToCalculate) {
    return elementsToCalculate.indexOf(operator) > -1;
}

function getOperatorIndex(operator, elementsToCalculate) {
     return elementsToCalculate.indexOf(operator);
}

function calculateByOperator(operator, operatorIndex, elementsToCalculate) {
    let calc;
    let numberToDelete = 3;//nombre avant opérateur, opérateur, nombre après opérateur

    switch(operator) {
        case "%":
            switch (elementsToCalculate[operatorIndex - 2]) {
                case undefined:
                case "x":
                case "÷":
                    calc = elementsToCalculate[operatorIndex - 1] / 100;
                    numberToDelete = 2;//symbole % et nombre avant symbole
                    break;
                case "+":
                case "-":
                    calc = elementsToCalculate[operatorIndex - 3] * (elementsToCalculate[operatorIndex - 1] / 100);
                    numberToDelete = 2;
                    break;
            }
            break;
        case "÷":
            calc = elementsToCalculate[operatorIndex - 1] / elementsToCalculate[operatorIndex + 1]; 
            break;
        case "x":
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

