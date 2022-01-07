import { NS } from 'bitburner';
import patch, { execIfExists } from 'utils/patch-ns';

const BruteSshCommand = "BruteSSH.exe"
const BackdoorCommand = "backdoor"
const AnalyzeCommand = "analyze"
const SelfHackStage1 = "/scripts/self-hack-1.js";
const SshPortCommand = "BruteSSH.exe";
const FtpPortCommand = "FTPcrack.exe";
const SmtpPortCommand = "relaySMTP.exe";
const NukeCommand = "NUKE.exe";

export async function main(nss: NS) {
    const ns = patch(nss);
    if(ns.args.length < 1) {
        ns.ltprint("Bad command usage: [target]")
        return;
    }

    const target = `${ns.args[0]}`;
    let hackCount = 0;
    await executeIfAvailable(ns, SshPortCommand, async () => {
        ns.brutessh(target);
        hackCount += 1;
    })

    await executeIfAvailable(ns, FtpPortCommand, async () => {
        ns.ftpcrack(target);
        hackCount += 1;
    })

    await executeIfAvailable(ns, SmtpPortCommand, async () => {
        ns.relaysmtp(target);
        hackCount += 1;
    })
    
    // ns.installBackdoor()
    // ns.exec('backdoor', target);

    if(!ns.hasRootAccess(target) && ns.getServerNumPortsRequired(target) <= hackCount) {
        await executeIfAvailable(ns, NukeCommand, async () => {
            ns.nuke(target);
            ns.print(`${NukeCommand} on '${target}'`);
        });
    } else {
        return;
    }
    
    ns.print(`Deploying onto '${target}'`)

    ns.killall(target);
    await ns.scp(["/scripts/self-hack-0.js", SelfHackStage1], 'home', target);
    const args = ns.args.slice(1);
    let pid = ns.exec("/scripts/self-hack-0.js", target, 1, ...args);
    if(pid === 0) {
        ns.tprint(`Could not Stage 0 at ${target}`);
        ns.exit();
    }
    await ns.sleep(50);
    // calculate the most optimal course of action
    ns.killall(target);
    const ramcost = ns.getScriptRam(SelfHackStage1);
    const [total, used] = ns.getServerRam(target);
    const free = total - used;
    const threadCount = Math.floor(free / ramcost);
    if(threadCount < 1) {
        ns.tprint(`NOT_ENOUGH_MEMORY: Cannot execute '${SelfHackStage1}' on '${target}'\nRAM available: [${free}], script cost: [${ramcost}] (total RAM: ${total})`);
        return;
    }
    ns.print(`Executing ${threadCount}x${SelfHackStage1}`);
    pid = ns.exec(SelfHackStage1, target, threadCount, target, ...args);
    if(pid === 0) {
        ns.tprint(`Could not Stage 2 at ${target}`);
        ns.exit();
    }
}

const executeIfAvailable = async (ns: NS, program: string, cb: () => Promise<void>) => {
    if(ns.fileExists(program, 'home')) {
        await cb();
    }
}