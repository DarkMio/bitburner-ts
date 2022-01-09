import { NS } from 'bitburner';
/** This is just an arbitrary identifier to signal that this script has finished redeployment */
export const DeployKey = "6uTdsrmCVG8^Bee*^UB46myYQya&4Qc#"

/** There is no way to get how this script is called, therefore it's hardcoded here */
export const ScriptName = "init.js";
export const DeploymenScriptFolder = "/deployment/";
export const HomeHost = "home";
export const SelfUpdateFile = "self-update.js";
export const RedeployFile = "redeploy.js";

export const SelfUpdateLocation = `${DeploymenScriptFolder}${SelfUpdateFile}`
export const RedeployLocation = `${DeploymenScriptFolder}${RedeployFile}`

/**
 * The idea here is to wget once, then deploy onto home and run this script, automatically updating itself
 * @param {NS} ns 
 */
export async function main(ns: NS) {
    ns.ps().filter(x => x.filename !== ns.getScriptName()).forEach(x => ns.kill(x.pid))
    const pid = ns.exec(SelfUpdateLocation, HomeHost, 1, ...ns.args);
    if(pid === 0) {
        ns.tprint(`FAILED to spawn self-updater, start manually with: run ${SelfUpdateLocation} -t 1`);
        return;
    } else {
        ns.tprint(`Spawned self updater`);
    }
    
}
