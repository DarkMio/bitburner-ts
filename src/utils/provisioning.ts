import { NS } from 'bitburner';

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


export const provisionTarget = async (ns: NS, target: string) => {
    return await ns.scp(DeployScripts, 'home', target);
}

export const rootTarget = async (ns: NS, target: string): Promise<boolean> => {
    const enoughLevel = ns.getServerRequiredHackingLevel(target) <= ns.getHackingLevel();
    if(!enoughLevel) {
        return false;
    }

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
    const hasRootAccess = ns.hasRootAccess(target);
    return hasRootAccess;
}

/** Specialized execute method to call the callback, useful for .exe functions, calls the callback if a fileExists check passes */
const executeIfAvailable = async (ns: NS, program: string, cb: () => void) => {
    if(ns.fileExists(program, 'home')) {
        cb();
    }
}