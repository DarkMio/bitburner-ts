import { NS } from 'bitburner';
import { money } from 'utils/formatter';
import { getNodes, Node } from 'utils/node-scan';
import patch from 'utils/patch-ns';

interface RootedNode extends Node {
    rooted: boolean;
    moneyPerHack: number;
    potentialMoney: number;
    moneyAvailable: number;
};

export interface TargetPayload {
    mostMoney: string;
    mostPotential: string;
}

export async function main(ns: NS) {
    ns.disableLog('ALL');
    while(true) {
        const linearNodes = (await getNodes(ns, 'home') as RootedNode[])
            .filter(x => x.name !== 'home')
            // split this map for early filtering
            .map(x => {
                x.rooted = ns.hasRootAccess(x.name);
                return x;
            })
            .filter(x => x.rooted)
            // after early filtering the logs are not so congested
            .map(x => {
                const hackAnalyze = ns.hackAnalyze(x.name);
                const moneyAvailable = ns.getServerMoneyAvailable(x.name);
                const hackChance = ns.hackAnalyzeChance(x.name);
                x.moneyPerHack = hackAnalyze * moneyAvailable * hackChance;
                x.potentialMoney = hackAnalyze * moneyAvailable;
                return x;
            });

        await findTargetNode(ns, linearNodes);
        await ns.sleep(15000);
    }
}

const findTargetNode = async (ns: NS, nodes: RootedNode[]) => {
    const mostCurrentMoney = nodes.filter(x => ns.getServerMaxMoney(x.name) !== ns.getServerMoneyAvailable(x.name)).reduce((prev, current) => (prev.moneyPerHack > current.moneyPerHack) ? prev : current);
    const mostMoneyPotential = nodes.reduce((prev, current) => prev.potentialMoney > current.potentialMoney ? prev : current);
    // ns.print(`# Target Node is now '${mostCurrentMoney.name}': [~${mostCurrentMoney.moneyPerHack.toFixed(2)}$/hack]`);
    // ns.print(`# Highest Potential Node: '${mostMoneyPotential.name}' [~${mostMoneyPotential.potentialMoney.toFixed(2)}$/hack]`)
    const payload = {
        currentTarget: mostCurrentMoney.name,
        // somehow 'joesguns' seems to be always the best target
        highestPotential: mostMoneyPotential.name
    };
    const payloadText = JSON.stringify(payload);
    ns.print(`## Publishing payload: ${payloadText}`);
    const target = mostMoneyPotential.name;
    ns.print(`${target}: ${ns.getServerSecurityLevel(target).toFixed(1)} Security Level, ${ns.hackAnalyzeChance(target).toFixed(1)} Hack Chance, ${money(ns.getServerMoneyAvailable(target))}$ available)`);
    await patch(ns).publishTarget(payload);
}
