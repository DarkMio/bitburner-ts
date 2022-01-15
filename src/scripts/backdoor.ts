import { NS } from 'bitburner';
import { getNodes, Node } from 'utils/node-scan';

export async function main(ns: NS) {
    const routes = {
        "CSEC": await seek(ns, 'CSEC'),
        "The Black Hand": await seek(ns, 'I.I.I.I'),
        "Nitesec": await seek(ns, 'avmnite-02h'),
        "Bitchrunners": await seek(ns, 'run4theh111z')
    }
    ns.tprint(`\n${JSON.stringify(routes, undefined, 4)}`);
}


const seek = async (ns: NS, target: string) => {
    const node = (await getNodes(ns, 'home')).find(x => x.name === target);
    const parentalOrder = parents(node).filter(x => x !== 'home');

    const connectStrings =  parentalOrder.map(x => `connect ${x}`).join('; ')
    return (`${connectStrings}; backdoor;`);
}

const parents = (node: Node | undefined): string[] => {
    let parents: string[] = [];
    while(node) {
        parents = [node.name, ... parents]
        node = node.parent;
    }

    return parents;
}