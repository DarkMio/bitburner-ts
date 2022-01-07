import { NS } from 'bitburner';
import generateIps from 'contract/generate-ips';
import largestPrimeFactor from 'contract/largest-prime-factor';
import maxSubarray from 'contract/max-subarray';
import mergeOverlaps from 'contract/merge-overlaps';
import { uniquePathsII } from 'contract/paths-in-grid';
import removeParanthesis from 'contract/remove-paranthesis';
import { maxPrice, AST4 } from 'contract/stock-trader'
import { getNodes, Node } from 'utils/node-scan';

interface ContractInfo {
    host: string,
    filename: string
} 

export async function main(ns: NS) {
    const nodes = (await getNodes(ns, 'home')).filter(x => x.name !== 'home');
    const contracts: ContractInfo[] = []; 
    for(const node of nodes) {
        const files = ns.ls(node.name).filter(x => x.endsWith('cct'));
        files.forEach(x => contracts.push({"host": node.name, "filename": x}))
    }

    if(contracts.length > 0) {
        const unsolved = solveContracts(ns, contracts);
        unsolved.forEach(x => ns.tprint(`Unsolved contract ${x.filename} '${ns.codingcontract.getContractType(x.filename, x.host)}'`))
    }
}

const printContract = (ns: NS, contract: ContractInfo) => {
    const type = ns.codingcontract.getContractType(contract.filename, contract.host);
    const description = ns.codingcontract.getDescription(contract.filename, contract.host);
    const data = ns.codingcontract.getData(contract.filename, contract.host);

    ns.tprint(JSON.stringify({
        type: type,
        description: description,
        data: data
    }, undefined, 4));
}


const solveContracts = (ns: NS, contracts: ContractInfo[]) => {
    const unsolved: ContractInfo[] = [];
    for (const contract of contracts) {
        const type = ns.codingcontract.getContractType(contract.filename, contract.host);
        const data = ns.codingcontract.getData(contract.filename, contract.host);

        let solution: string[] | number = -1;
        switch(type) {
            case "Find Largest Prime Factor":
                solution = largestPrimeFactor(parseInt(data));
                break;
            case "Algorithmic Stock Trader I":
                solution = maxPrice([1, data as number[]]);
                break;
            case "Algorithmic Stock Trader IV":
                solution = maxPrice(data as AST4);
                break;
            case "Subarray with Maximum Sum":
                solution = maxSubarray(data as number[]);
                break;
            case "Merge Overlapping Intervals":
                solution = [JSON.stringify(mergeOverlaps(data as number[][]))];
                break;
            case "Generate IP Addresses":
                solution = generateIps(parseInt(data));
                break;
            case "Unique Paths in a Grid II":
                solution = uniquePathsII(data as number[][]);
                break;
            case "Sanitize Parentheses in Expression":
                solution = removeParanthesis(data as string);
                break;
        }
        if(solution === -1) {
            unsolved.push(contract);
            continue;
        }
        const reward = ns.codingcontract.attempt(solution, contract.filename, contract.host);
        ns.tprint(`Solved contract '${type}', reward: ${reward}`);
    }
    return unsolved;
}