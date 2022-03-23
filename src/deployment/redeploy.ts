import { NS } from 'bitburner';
import execIfExists from 'utils/exec-if-exists';

export const UpdateList = "index.txt";
export const DeployFolder = "";
export const HomeHost = "home";
export const BootstrapScript = "processor.js";


interface UpdateList {
    lastChange: number,
    lastChangeString: string,
    fileList: string[]
}

/**
 * The idea here is to wget once, then deploy onto home and run this script, automatically updating itself
 * @param {NS} ns 
 */
export async function main(ns: NS) {
    ns.disableLog('ALL');
    ns.tprint("# Starting redeployment");

    let lastChange = new Date(0);

    while(true) {
        const success = await ns.wget("http://localhost:8000/index.json", UpdateList, HomeHost);
        if(!success) {
            await ns.sleep(10_000);
            continue;
        }
        const updateList = JSON.parse(`${ns.read(UpdateList)}`) as UpdateList;
        const updateDate = new Date(updateList.lastChange);
        if(updateDate <= lastChange) {
            await ns.sleep(1_000);
            continue;
        }

        lastChange = updateDate;
        // remove the update list
        ns.rm(UpdateList, HomeHost);
        ns.print(`## Downloading [${updateList.fileList.length}] source files`)

        for(const idx in updateList.fileList) {
            const file = updateList.fileList[idx];
            const location = file.includes("/") ? `/${file}` : file;
            await ns.wget(`http://localhost:8000/${file}`, location, HomeHost);
            // avoid choking the browser and/or server
            await ns.sleep(5);
        }
        
        if(!execIfExists(ns, `${DeployFolder}${BootstrapScript}`, HomeHost, 1, ...ns.args)) {
            ns.print(`## FAILED to spawn bootstrap script, start with: run ${DeployFolder}${BootstrapScript}`);
        }

        ns.print("# Self updating complete");
        await ns.sleep(10_000);
    }
}