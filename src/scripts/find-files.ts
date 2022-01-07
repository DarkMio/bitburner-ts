import { NS } from 'bitburner';
import { getNodes, Node } from 'utils/node-scan';

export async function main(ns: NS) {
    const nodes = (await getNodes(ns, 'home')).filter(x => x.name !== 'home');
    const fileRecord: Record<string, string[]> = {};
    for (const node of nodes) {
        const files = ns
            .ls(node.name)
            .filter(x => !x.endsWith('.js'))
        if(files.length < 0) {
            continue;
        }
        fileRecord[node.name] = files;
    }
    ns.tprint(`${JSON.stringify(fileRecord, undefined, 4)}`);
}