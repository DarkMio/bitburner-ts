import { NS } from 'bitburner';

/** There is no way to get how this script is called, therefore it's hardcoded here */
export const InitScriptFile = "init.js";
export const DeployFolder = "/";
export const HomeHost = "home";

export const DeploymenScriptFolder = "/deployment/";
export const UtilsScriptFolder = "/utils/";
export const SelfUpdateFile = "self-update.js";
export const RedeployFile = "redeploy.js";
export const UtilsFile = "patch-ns.js"

export const SelfUpdateLocation = `${DeploymenScriptFolder}${SelfUpdateFile}`
export const RedeployLocation = `${DeploymenScriptFolder}${RedeployFile}`
export const UtilsLocation = `${UtilsScriptFolder}${UtilsFile}`;
export const Host = "http://localhost:8000";


/**
 * The idea here is to wget once, then deploy onto home and run this script, automatically updating itself
 * @param {NS} ns 
 */
export async function main(ns: NS) {
    ns.disableLog('ALL');
    ns.print("# Starting self updater")

    // overwrite the update script
    ns.print(`## Updating '${InitScriptFile}'`);
    // deleting the current script hardcode first, might change later
    // ns.rm(InitScriptFile, HomeHost);
    if(!await ns.wget(`${Host}/${InitScriptFile}`, InitScriptFile, HomeHost)) {
        ns.print(`# CRITICAL failure, could not download init script file (no connection?)`);
        return;
    }

    // gets all files in the deploy folder
    const deployedFiles = ns.ls(HomeHost, "/**/*.js");
    ns.print(`## Removing [${deployedFiles.length}] source files`)
    // deployedFiles.forEach(x => ns.rm(x, HomeHost));

    await ns.sleep(5);
    ns.print(`## Updating '${SelfUpdateFile}', '${RedeployFile}', '${UtilsFile}'`);
    if(!await ns.wget(`${Host}${SelfUpdateLocation}`, SelfUpdateLocation, HomeHost) ||
       !await ns.wget(`${Host}${RedeployLocation}`, RedeployLocation, HomeHost) ||
       !await ns.wget(`${Host}${UtilsLocation}`, UtilsLocation, HomeHost)) {
        ns.print(`# CRITICAL failure, could not download deployment files (no connection?)`);
        return; 
    }

    const pid = ns.exec(RedeployLocation, HomeHost, 1, ...ns.args);
    if(pid === 0) {
        ns.print(`## FAILED to spawn redeployment, start manually with: run ${RedeployLocation} -t 1`);
    } else {
        ns.print(`## Spawned redeployment, PID: [${pid}]`);
    }
}