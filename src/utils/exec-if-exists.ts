import { NS } from "bitburner";

/**
 * Executes a program if it exists, otherwise returns -1
 * @cost 1.4 GB
 * @apis `[ns.fileExists, ns.exec]`
 */
 export default (ns: NS, script: string, host: string, numThreads?: number, ...args: (string | number | boolean)[]) => {
    if(ns.fileExists(script)) {
        return ns.exec(script, host, numThreads, ...args);
    }
    return -1;
}
