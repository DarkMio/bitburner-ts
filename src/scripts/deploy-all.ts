import { NS } from 'bitburner';
import { getNodes, Node } from 'utils/node-scan';
import { execIfEnoughRam } from 'utils/patch-ns';

interface InfectNode extends Node {
    infected: boolean;
    moneyAvailable: number;
    // moneyPerHack: number;
};

export async function main(ns: NS) {
    let linearNodes = (await getNodes(ns, 'home')).filter(x => x.name !== 'home') as InfectNode[];
    while(true) {
        for (const node of linearNodes) {
            if(node.infected) {
                continue;
            }
            await infect(ns, node.name);
            await ns.sleep(10);
            node.infected = ns.hasRootAccess(node.name);
        }
        const infectedHosts = linearNodes.filter(x => x.infected).length;
        const infectionPercentage = infectedHosts * 100 / linearNodes.length; 
        
        ns.print(`Of [${linearNodes.length}] nodes, infected [${infectedHosts}] (~${infectionPercentage.toFixed(1)}%)`);
        
        await ns.sleep(15_000)
    }
}

const infect = async (ns: NS, target: string): Promise<boolean> => {
    const hackingLevel = ns.getHackingLevel();
    const required = ns.getServerRequiredHackingLevel(target);

    if(hackingLevel >= required) {
        const pid = execIfEnoughRam(ns, '/scripts/deploy-node.js', 'home', 1, target);
        if(pid <= 0) {
            ns.tprint(`Infect of ${target} failed, reason: ${pid}`);
        }
        await ns.sleep(150);
        return pid > 0;
    }
    return false;
}