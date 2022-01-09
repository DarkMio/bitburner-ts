import { NS } from "bitburner";
import { getNodes } from "utils/node-scan";

interface FileLocation {
    host: string;
    fileName: string;
}

export const fileSearch = async (ns: NS, regexPattern: string) => {
    const nodes = (await getNodes(ns, 'home'));
    const fileLocations: FileLocation[] = [];
    for(const node of nodes) {
        const files = ns.ls(node.name);
        files
            .filter(x => x.match(regexPattern))
            .forEach(x =>
                fileLocations.push({
                    host: node.name,
                    fileName: x
                })
            );
    }
    return fileLocations;
}