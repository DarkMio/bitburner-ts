import { NS } from 'bitburner';

export interface Node {
    name: string, 
    parent?: Node;
    children: Node[];
}

const depthScan = async (ns: NS, parent: Node | undefined, target: string) => {
    const thisNode: Node = {
        name: target,
        parent: parent,
        children: [],
    };

    const nodeNames = ns.scan(target).filter(x => x !== parent?.name);
    for (const nodeName of nodeNames) {
        thisNode.children.push(await depthScan(ns, thisNode, nodeName))
    }

    return thisNode;
}

const linearize = (node: Node): Node[] => {
    return [node, ...node.children.flatMap(x => linearize(x))];
}

/**
 * Gets all nodes as a tree starting from location 
 * @cost 0.2 GB
 */
export const getNodeTree = async (ns: NS, from: string): Promise<Node> => {
    return await depthScan(ns, undefined, from);
} 

/**
 * Gets all nodes as a list starting from location
 * @cost 0.2 GB
 */
export const getNodes = async (ns: NS, from: string): Promise<Node[]> => {
    return Array.from(new Set(linearize(await getNodeTree(ns, from))));
}
