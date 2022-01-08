import { NS } from 'bitburner';
import { getNodeTree, Node } from 'utils/node-scan';

interface VisitorNode extends Node {
    visited: boolean | undefined;
}

export async function main(ns: NS) {
    const nodeTree = await getNodeTree(ns, 'home');
    printNode(ns, 1, nodeTree as VisitorNode);
}

const printNode = (ns: NS, depth: number, node: VisitorNode) => {
    ns.tprint(`${"+- ".padStart(depth * 4)} ${node.name}`);
    
    if(node.visited) {
        return;
    }

    if(node.children.length === 0) {
        return;
    }
    
    node.children.forEach(x => printNode(ns, depth + 1, x as VisitorNode));
}