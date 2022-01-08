import { NS } from 'bitburner';
import { getNodes, Node } from 'utils/node-scan';

interface FileLocation {
    host: string;
    fileName: string;
}

export async function main(ns: NS) {
    if(ns.args.length < 1) {
        return ns.tprint(`Invalid arguments: [file-to-search.txt]`);
    }
    const searchText = `${ns.args[0]}`;
    const nodes = (await getNodes(ns, 'home'));

    const fileLocations: FileLocation[] = [];
    for(const node of nodes) {
        const files = ns.ls(node.name).filter(x => x === searchText);
        files.forEach(x => fileLocations.push({
            host: node.name,
            fileName: x
        }));
    }

    if(fileLocations.length <= 0) {
        return ns.tprint("Found no matches, sorry.");
    }

    const matches = fileLocations.map(x => `${x.host}: ${x.fileName}`);
    ns.tprint(`Found [${matches.length}] matches:\n ${matches.join('\n')}`);
}