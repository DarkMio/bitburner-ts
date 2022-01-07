import { NS } from 'bitburner';

/**
 * Patching NS for convenient, 0 additional cost functions
 */
const patch = (ns: NS) => {
    return {
        ...ns,
        /** Callbacked wget call */
        wgetCallback: async (url: string, target: string, onSuccess: () => void, onError: () => void, host?: string) => {
            const success = await ns.wget(url, target);
            if(success) {
                onSuccess();
            } else {
                onError();
            }
            return success;
        },
        /** Prints in Log and Terminal */
        ltprint: (message: any) => {
            ns.tprint(message);
            ns.print(message);
        }
    };
}

/**
 * Executes a program if it exists, otherwise returns -1
 * @cost 1.4 GB
 * @apis `[ns.fileExists, ns.exec]`
 */
export const execIfExists = (ns: NS, script: string, host: string, scriptHost: string, numThreads?: number, ...args: (string | number | boolean)[]) => {
    if(ns.fileExists(script)) {
        return ns.exec(script, host, numThreads, ...args);
    }
    return -1;
}

/**
 * Start another script on any server, emits callbacks on success or failure
 * @cost 1.3 GB
 * @apis `[ns.exec]`
 */
export const exec = (ns: NS, script: string, host: string, onSuccess: (pid: number) => void, onError: () => void, numThreads?: number, ...args: (string | number | boolean)[]) => {
    ns.tprint(`${script}, ${host}, ${numThreads ?? 1}, ${args}`);
    const pid = ns.exec(script, host, numThreads ?? 1, ...args);
    if(pid === 0) {
        onError();
        return;
    }
    onSuccess(pid);
}

/**
 * Checks if there is enough RAM available on the host machine and then executes the program
 * @cost 1.45 GB
 * @apis `[ns.getServerUsedRam, ns.getScriptRam, ns.exec]` 
 * @returns `-1` when the script does not exist, `-2` when not enouguh RAM is available
 */
export const execIfEnoughRam = (ns: NS, script: string, host: string, numThreads?: number, ...args: (string | number | boolean)[]) => {
    const ramAvailable = ns.getServerUsedRam(host);
    const ramCost = ns.getScriptRam(script);
    if(ramCost === 0) {
        return -1;
    }

    if(ramCost > ramAvailable) {
        return -2;
    }

    return ns.exec(script, host, numThreads, ...args);
}

export default patch; 