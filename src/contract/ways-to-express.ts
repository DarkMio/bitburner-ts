import { NS } from "bitburner";

export interface InputData {
    [0]: string,
    [1]: number
}

export default async (ns: NS, arrayData: InputData) => {
    let i, j;
 
    let operatorList = ["", "+", "-", "*"];
    let validExpressions = [];
 
    let tempPermutations = Math.pow(4, (arrayData[0].length - 1));
 
    for (i = 0; i < tempPermutations; i++) {
 
        if (!Boolean(i % 100000)) {
            await ns.sleep(5);
        }
 
        let arraySummands = [];
        let candidateExpression = arrayData[0].substr(0, 1);
        arraySummands[0] = parseInt(arrayData[0].substr(0, 1));
 
        for (j = 1; j < arrayData[0].length; j++) {
            candidateExpression += operatorList[(i >> ((j - 1) * 2)) % 4] + arrayData[0].substr(j, 1);
 
            let rollingOperator = operatorList[(i >> ((j - 1) * 2)) % 4];
            let rollingOperand = parseInt(arrayData[0].substr(j, 1));
 
            switch (rollingOperator) {
                case "":
                    rollingOperand = rollingOperand * (arraySummands[arraySummands.length - 1] / Math.abs(arraySummands[arraySummands.length - 1]));
                    arraySummands[arraySummands.length - 1] = arraySummands[arraySummands.length - 1] * 10 + rollingOperand;
                    break;
                case "+":
                    arraySummands[arraySummands.length] = rollingOperand;
                    break;
                case "-":
                    arraySummands[arraySummands.length] = 0 - rollingOperand;
                    break;
                case "*":
                    while (j < arrayData[0].length - 1 && ((i >> (j * 2)) % 4) === 0) {
                        j += 1;
                        candidateExpression += arrayData[0].substr(j, 1);
                        rollingOperand = rollingOperand * 10 + parseInt(arrayData[0].substr(j, 1));
                    }
                    arraySummands[arraySummands.length - 1] = arraySummands[arraySummands.length - 1] * rollingOperand;
                    break;
            }
        }
 
        let rollingTotal = arraySummands.reduce(function(a, b) { return a + b; });
 
        //if(arrayData[1] == eval(candidateExpression)){
        if (arrayData[1] === rollingTotal) {
            validExpressions[validExpressions.length] = candidateExpression;
        }
    }
 
    return JSON.stringify(validExpressions);
}