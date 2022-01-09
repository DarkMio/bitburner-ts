import { NS } from 'bitburner';
import killProcesses from 'utils/kill-processes';
import { getNodes, Node } from 'utils/node-scan';
import { provisionTarget, rootTarget } from 'utils/provisioning';

const ProvisioningScript = "/scripts/provisioning.js";
const HackScript = "/scripts/hacks/hack.js";
const WeakenScript = "/scripts/hacks/weaken.js";
const GrowScript = "/scripts/hacks/grow.js";
const DeployedScripts = [HackScript, WeakenScript, GrowScript];

const ReservedHomeRam = 150;

export async function main(ns: NS) {
    ns.disableLog('ALL');

    let lastTotalRam = 0;
    while(true) {
        // get all nodes that can execute code
        const allNodes = (await getNodes(ns, 'home'));
        const allRootedNodes = (await provision(ns, allNodes));
        // calculate the total amount of RAM usable
        const [totalRam, ramHosts] = calculateTotalRam(ns, allRootedNodes);

        // if the total ram hasn't changed, there is no need to redeploy.
        if(totalRam === lastTotalRam) {
            await ns.sleep(15_000);
            continue;
        }
        lastTotalRam = totalRam;
        ns.tprint(`Total available ram is now ${totalRam}GB on [${ramHosts.length}] hosts`)
        // calulate optimal script ratios for the total amount of ram
        const { totalHacks, totalGrow, totalWeaken, totalThreads, remainingRam } = calculateScriptCount(ns, totalRam);
        const percentage = (x: number) => (x * 100 / totalThreads).toFixed(1);
        ns.print(`Executing ${totalHacks}/${totalWeaken}/${totalGrow} hack/weaken/grow (Ratio: ${percentage(totalHacks)}%/${percentage(totalWeaken)}%/${percentage(totalGrow)}%), remaining RAM: ${remainingRam}`);
        
        // execute the plan by self-partitioning
        await executeScripts(ns, ramHosts, totalHacks, totalGrow, totalWeaken);
        
        // check every 1 minute for changes 
        await ns.sleep(60 * 1_000);
    }
}

interface RootedNode extends Node {
    rooted: boolean;
}

interface RamNode extends RootedNode {
    availableRam: number
}

const provision = async (ns: NS, nodes: Node[]): Promise<RootedNode[]> => {
    const rootedNodes: RootedNode[] = [];
    for (const node of nodes) {
        rootedNodes.push({
            ...node,
            rooted: await rootNode(ns, node)
        });
    }
    return rootedNodes.filter(x => x.rooted);
}

const rootNode = async (ns: NS, node: Node): Promise<boolean> => {
    return (await rootTarget(ns, node.name)) && (await provisionTarget(ns, node.name))
}

const calculateTotalRam = (ns: NS, nodes: RootedNode[]): [number, RamNode[]] => {
    let totalRam = 0;
    const ramNodes: RamNode[] = [];
    for (const node of nodes) {
        let ramAvailable = ns.getServerMaxRam(node.name);
        // on home, we keep a bit RAM free for other things
        if(node.name === 'home') {
            ramAvailable = Math.max(0, ramAvailable - ReservedHomeRam);
        }
        ramNodes.push({
            ...node,
            availableRam: ramAvailable
        });
        totalRam += ramAvailable;
    }
    return [totalRam, ramNodes.filter(x => x.availableRam > 0)];
}

const executeScripts = async (ns: NS, ramNodes: RamNode[], totalHack: number, totalGrow: number, totalWeaken: number) => {
    const homeNode = ramNodes.find(x => x.name === 'home');
    const cloudNodes = ramNodes.filter(x => x.name !== 'home').sort((a, b) => a.availableRam - b.availableRam);

    for (const node of cloudNodes) {
        const { hackUses, growUses, weakenUses, availableRam } = saturateScripts(ns, node, totalHack, totalGrow, totalWeaken)
        ns.print(`For '${node.name}' saturating [${growUses}/${weakenUses}/${hackUses}] grow/weaken/hack (remaining RAM: ${availableRam.toFixed(2)})`);
        await exec(ns, node, hackUses, growUses, weakenUses);
        totalHack -= hackUses;
        totalGrow -= growUses;
        totalWeaken -= weakenUses;
    }
    if(homeNode) {
        await exec(ns, homeNode, totalHack, totalGrow, totalWeaken);
    }
}

const exec = async (ns: NS, target: RamNode, totalHack: number, totalGrow: number, totalWeaken: number) => {
    killProcesses(ns, target.name, ...DeployedScripts);
    if(totalHack > 0) {
        ns.exec(HackScript, target.name, totalHack);
    }
    if(totalGrow > 0) {
        ns.exec(GrowScript, target.name, totalGrow);
    }
    if(totalWeaken > 0) {
        ns.exec(WeakenScript, target.name, totalWeaken);
    }
}

const saturateScripts = (ns: NS, ramNode: RamNode, totalHack: number, totalGrow: number, totalWeaken: number) => {
    const [growUsage, weakenUsage, hackUsage] = [ns.getScriptRam(GrowScript), ns.getScriptRam(WeakenScript), ns.getScriptRam(HackScript)];

    const maxGrows = Math.floor(Math.min(totalGrow, ramNode.availableRam / growUsage));
    const maxWeaken = Math.floor(Math.min(totalWeaken, ramNode.availableRam / weakenUsage));
    const maxHack = Math.floor(Math.min(totalHack, ramNode.availableRam / hackUsage));

    let best = {
        growUses: 0,
        weakenUses: 0,
        hackUses: 0,
        availableRam: ramNode.availableRam
    };

    const ramIfFittingAll = ramNode.availableRam - (maxGrows * growUsage) - (maxWeaken * weakenUsage) - (maxHack * hackUsage);
    if(ramIfFittingAll > 0) {
        return {
            growUses: maxGrows,
            weakenUses: maxWeaken,
            hackUses: maxHack,
            availableRam: ramIfFittingAll
        };
    }

    for(let i = maxGrows + maxWeaken; i >= 0; i--) {
        const growUses = Math.max(0, i - maxWeaken);
        const weakenUses = Math.max(0, i - growUses);
        let remainingRam = ramNode.availableRam - (growUses * growUsage) - (weakenUses * weakenUsage);
        if(remainingRam < 0) {
            continue;
        }
        const hackUses = Math.min(totalHack, Math.floor(remainingRam / hackUsage));
        remainingRam -= hackUsage * hackUses;

        if(remainingRam < best.availableRam) {
            best = {
                growUses: growUses,
                weakenUses: weakenUses,
                hackUses: hackUses,
                availableRam: remainingRam
            };
        }
    }

    return best;
}

const calculateScriptCount = (ns: NS, totalRam: number) => {
    if(totalRam <= 0) {
        return {
            totalHacks: 0,
            totalGrow: 0,
            totalWeaken: 0,
            totalThreads: 0,
            remainingRam: totalRam
        };
    }
    // calculate the most optimal script count
    const [growUsage, weakenUsage, hackUsage] = [ns.getScriptRam(GrowScript), ns.getScriptRam(WeakenScript), ns.getScriptRam(HackScript)];
    // the optimal ratio as written in the docs
    const [hackRatio, growRatio, weakenRatio] = [1, 12, 2];    
    // the total usage of an optimal ratio block
    const totalUsage = growUsage * growRatio + weakenUsage * weakenRatio + hackUsage * hackRatio;
    // factor of how many blocks can fit
    const fitFactor = totalRam / totalUsage;
    // how many int blocks can fit and what's left over
    const totalFits = Math.trunc(totalRam / totalUsage);
    const remainder = fitFactor - totalFits;
    // remaining ram after fitting as many full blocks
    let remainingRam = totalRam - (totalFits * totalUsage);

    // what will be returned later
    let totalHacks = totalFits * hackRatio;
    let totalWeaken = totalFits * weakenRatio;
    let totalGrow = totalFits * growRatio;
    
    // add one hack (ratio 1)
    if(remainingRam >= hackUsage) {
        remainingRam -= hackUsage;
        totalHacks += 1;
    }
    // add two more grows (ratio 2)
    for(let i = 0; i < 2 && remainingRam >= growUsage; i++) {
        remainingRam -= growUsage;
        totalGrow += 1;
    }

    {   // fill the rest with as many weakens as possible
        const fittingWeaken = Math.floor(remainingRam / weakenUsage);
        totalWeaken += fittingWeaken;
        remainingRam -= fittingWeaken * weakenUsage;
    }
    
    const totalThreads = totalHacks + totalGrow + totalWeaken;
    return {
        totalHacks: totalHacks,
        totalGrow: totalGrow,
        totalWeaken: totalWeaken,
        totalThreads: totalThreads,
        remainingRam: remainingRam
    };
    
}