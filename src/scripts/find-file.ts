import { NS } from 'bitburner';
import { fileSearch } from 'utils/file-search';

export async function main(ns: NS) {
    const regexPattern = ns.args[0] === undefined ? ".*" : `${ns.args[0]}`;
    const fileLocations = await fileSearch(ns, regexPattern);

    if(fileLocations.length <= 0) {
        return ns.tprint("Found no matches, sorry.");
    }

    const longestHostName = Math.max(fileLocations.reduce((a, b) => a.host.length > b.host.length ? a : b).host.length, "host".length);
    const longestFileName = Math.max(fileLocations.reduce((a, b) => a.fileName.length > b.fileName.length ? a : b).fileName.length, "filename".length);
    const tableNames = fileLocations.map(x => `${x.host.padStart(longestHostName + 2)} | ${x.fileName}`);

    ns.tprint(`\n${"host ".padStart(longestHostName + 2)} | filename\n${"".padStart(longestHostName + longestFileName + 3, "-")}\n${tableNames.join("\n")}`);
}