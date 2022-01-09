import { NS } from "bitburner";

export default async (ns: NS, script: string, host: string, numThreads?: number, ...args: (string | number | boolean)[]) =>{
    const pid = ns.exec(script, host, numThreads, ...args);
    if(pid <= 0) {
        return false;
    }

    const processes = ns.ps(host);
    while(processes.some(x => x.args === args && x.filename === script && x.pid === pid && x.threads === (numThreads ?? 1))) {
        // don't choke me, daddy vm.
        await ns.sleep(15);
    }
    return true;
}