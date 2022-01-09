import { NS } from 'bitburner';
import patch, { execIfExists } from 'utils/patch-ns';

const SelfHackStage1 = "/scripts/self-hack-1.js";
const SshPortCommand = "BruteSSH.exe";
const FtpPortCommand = "FTPcrack.exe";
const SmtpPortCommand = "relaySMTP.exe";
const HttpPortCommand = "HTTPWorm.exe";
const SqlPortCommand = "SQLInject.exe";
const NukeCommand = "NUKE.exe";

const WeakenScript = "/scripts/hacks/weaken.js"
const HackScript = "/scripts/hacks/hack.js"
const GrowScript = "/scripts/hacks/grow.js";
const UtilsScript = "/utils/patch-ns.js"
const DeployScripts = [WeakenScript, HackScript, GrowScript, UtilsScript];


export async function main(nss: NS) {
    const ns = patch(nss);
    ns.disableLog('ALL');
    if(ns.args.length < 1) {
        ns.ltprint("Bad command usage: [target]")
        return;
    }

    const target = `${ns.args[0]}`;

    if(!ns.hasRootAccess(target)) {
        provisionTarget(ns, target);
        if(!ns.hasRootAccess(target)) {
            ns.disableLog
            ns.print(`Failed to gain root access on '${target}'`);
            return;
        }
    }

    // some machines don't have ram, no use doing anything to them.
    const totalRam = ns.getServerMaxRam(target);
    if(totalRam <= 0) {
        return;
    }

    ns.print(`Deploying onto '${target}'`)

    // calculate the most optimal course of action

    const [growUsage, weakenUsage, hackUsage] = [ns.getScriptRam(GrowScript), ns.getScriptRam(WeakenScript), ns.getScriptRam(HackScript)];
    const fitFactorGrowth = 1; // (growUsage / growUsage) == 1
    const fitFactorHack = hackUsage / growUsage;
    const fitFactorWeaken = weakenUsage / growUsage;

    const [hackRatio, growRatio, weakenRatio] = [1, 10, 2];
    
    const totalUsage = growUsage * growRatio + weakenUsage * weakenRatio + hackUsage * hackRatio;

    const fitFactor = totalRam / totalUsage;
    const totalFits = Math.trunc(totalRam / totalUsage);
    const remainder = fitFactor - totalFits;

    const remainingRam = totalRam - (totalFits * totalUsage);

    let remainingGrowths = remainingRam / growUsage;
    
    let totalHacks = totalFits * hackRatio;
    let totalWeaken = totalFits * weakenRatio;
    let totalGrow = totalFits * growRatio;
    if(remainingGrowths > 0) {
        totalHacks += 1;
        remainingGrowths -= fitFactorHack;
    }
    if(remainingGrowths > 0) {
        const weakenFits = Math.min(2, Math.floor(remainingGrowths / fitFactorWeaken));
        totalWeaken += weakenFits;
        remainingGrowths -= weakenFits * fitFactorWeaken;
    }
    if(remainingGrowths > 0) {
        const growFits = Math.floor(remainingGrowths);
        totalGrow += growFits;
        remainingGrowths -= growFits;
    }

    const totalThreads = totalHacks + totalWeaken + totalGrow;

    const percentage = (x: number) => (x * 100 / totalThreads).toFixed(1);
    ns.print(`Executing ${totalHacks}/${totalWeaken}/${totalGrow} hack/weaken/grow (Ratio: ${percentage(totalHacks)}%/${percentage(totalWeaken)}%/${percentage(totalGrow)}%), remaining RAM: ${remainingGrowths * growUsage}`);
    await ns.scp(DeployScripts, 'home', target);

    ns.killall(target);
    if(totalGrow > 0) {
        ns.exec(GrowScript, target, totalGrow);
    }
    if(totalWeaken > 0) {
        ns.exec(WeakenScript, target, totalWeaken);
    }
    if(totalHacks > 0) {
        ns.exec(HackScript, target, totalHacks);
    }
    /*
    const used = ns.getServerUsedRam(target);
    const free = totalRam - used;
    const threadCount = Math.floor(free / ramcost);
    if(threadCount < 1) {
        ns.tprint(`NOT_ENOUGH_MEMORY: Cannot execute '${SelfHackStage1}' on '${target}'\nRAM available: [${free}], script cost: [${ramcost}] (total RAM: ${totalRam})`);
        return;
    }
    ns.print(`Executing ${threadCount}x${SelfHackStage1}`);
    const pid = ns.exec(SelfHackStage1, target, threadCount, target, ...ns.args);
    if(pid <= 0) {
        ns.tprint(`Could not Stage 2 at ${target}`);
        ns.exit();
    }
*/
}

const provisionTarget = async (ns: NS, target: string) => {
    let hackCount = 0;
    executeIfAvailable(ns, SshPortCommand, async () => {
        ns.brutessh(target);
        hackCount += 1;
    })

    executeIfAvailable(ns, FtpPortCommand, async () => {
        ns.ftpcrack(target);
        hackCount += 1;
    })

    executeIfAvailable(ns, SmtpPortCommand, async () => {
        ns.relaysmtp(target);
        hackCount += 1;
    });

    executeIfAvailable(ns, HttpPortCommand, async () => {
        ns.httpworm(target);
        hackCount += 1;
    });

    executeIfAvailable(ns, SqlPortCommand, async () => {
        ns.sqlinject(target);
        hackCount += 1;
    });

    if(!ns.hasRootAccess(target) && ns.getServerNumPortsRequired(target) <= hackCount) {
        executeIfAvailable(ns, NukeCommand, async () => {
            ns.nuke(target);
            ns.print(`${NukeCommand} on '${target}'`);
        });
    }
}

const executeIfAvailable = async (ns: NS, program: string, cb: () => void) => {
    if(ns.fileExists(program, 'home')) {
        cb();
    }
}