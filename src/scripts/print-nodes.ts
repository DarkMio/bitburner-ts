import { NS } from 'bitburner';
import { data } from 'utils/formatter';
import { getNodes, getNodeTree, Node } from 'utils/node-scan';

interface VisitorNode extends Node {
    visited: boolean | undefined;
}

interface DistanceNode extends Node {
    distance: number;
    group: number;
}

export async function main(ns: NS) {
    const nodeTree = await getNodeTree(ns, 'home');
    printNode(ns, 1, nodeTree as VisitorNode);
    ns.tprint((await getNodes(ns, 'home')).length)
    ns.getScriptExpGain
    /*
    buildNodeData(ns, transformNodes({
        ...nodeTree,
        group: 1,
        distance: 0
    }));
    */
}

const printNode = (ns: NS, depth: number, node: VisitorNode) => {
    const ram = ns.getServerMaxRam(node.name);
    const requiredPorts = ns.getServerNumPortsRequired(node.name);
    const requiredLevel = ns.getServerRequiredHackingLevel(node.name);
    const name = ns.hasRootAccess(node.name) ? `#>${node.name.toUpperCase()}` : `$>${node.name}`; 
    ns.tprint(`${"+- ".padStart(depth * 4)} ${name} (${data(ram)} | ${requiredPorts} Ports |  ${requiredLevel} Level)`);
    
    if(node.visited) {
        return;
    }

    if(node.children.length === 0) {
        return;
    }
    
    node.children.forEach(x => printNode(ns, depth + 1, x as VisitorNode));
}

const transformNodes = (node: DistanceNode): DistanceNode[] => {
    if(node.distance < -100) {
        throw "Oh noes";
    }
    
    let nodeCount = 1;
    const children = node.children.flatMap(x => {
        let group = node.group;
        if(node.name === 'home') {
            group += nodeCount++;
        }
        return transformNodes({...x, group: group, distance: node.distance + 1});
    });
    return [node, ...children];
}

const buildNodeData = (ns: NS, nodes: DistanceNode[]) => {
    const start = nodes.find(x => x.name === 'home');
    if(start === undefined) {
        return;
    }

    const nodeDeclaration = {
        nodes: nodes.map(x => ({
            id: x.name,
            group: x.group
        })),
        links: nodes.flatMap(x => x.children.map(y => ({
            source: x.name,
            target: y.name,
            value: x.distance
        })))
   
    }
    ns.tprint(JSON.stringify(nodeDeclaration));
}