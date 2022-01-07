import { NS } from 'bitburner';


const BackdoorCommand = "backdoor";
const SshPortCommand = "BruteSSH.exe";
const FtpPortCommand = "FTPcrack.exe";

export async function main(ns: NS) {
    ns.print(`Executing Stage 0 (init) on host ${ns.getHostname()}`);
    /*
    const target = ns.getHostname();
    await executeIfAvailable(ns, SshPortCommand, async () => {
        ns.tprint(`ns.brutessh('${target}')`)
        ns.brutessh(target)
        ns.print(`${SshPortCommand} on '${target}'`);
    })

    await executeIfAvailable(ns, FtpPortCommand, async () => {
        ns.ftpcrack(target);
        ns.print(`${FtpPortCommand} on '${target}'`);
    })

//    ns.exec(BackdoorCommand, target);
//    ns.print(`${BackdoorCommand} on '${target}'`)
*/
}


const executeIfAvailable = async (ns: NS, program: string, cb: () => Promise<void>) => {
    if(true) {
        await cb();
    } else {
        ns.tprint(`file does not exist: ${program}`)
    }
}