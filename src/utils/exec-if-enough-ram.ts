import { NS } from "bitburner";

/**
 * Checks if there is enough RAM available on the host machine and then executes the program
 * @cost 1.45 GB
 * @apis `[ns.getServerUsedRam, ns.getScriptRam, ns.exec]` 
 * @returns `-1` when the script does not exist, `-2` when not enouguh RAM is available
 */
 export const execIfEnoughRam = (ns: NS, script: string, host: string, numThreads?: number, ...args: (string | number | boolean)[]) => {
    const ramAvailable = ns.getServerMaxRam(host) - ns.getServerUsedRam(host);
    const ramCost = ns.getScriptRam(script);
    if(ramCost === 0) {
        return -1;
    }

    if(ramCost > ramAvailable) {
        return -2;
    }

    return ns.exec(script, host, numThreads, ...args);
}