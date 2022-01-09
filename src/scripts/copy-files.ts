import { NS } from 'bitburner';
import { fileSearch } from 'utils/file-search';


export async function main(ns: NS) {
    if(ns.args.length < 2) {
        return ns.tprint("Invalid usage: [regex file pattern] [destination]");
    }

    const files = await fileSearch(ns, `${ns.args[0]}`);
    const host = `${ns.args[1]}`;
    for (const file of files) {
        await ns.scp(file.fileName, file.host, host);
    }
    ns.tprint(`Copied [${files.length}] files to ${host}`);
}