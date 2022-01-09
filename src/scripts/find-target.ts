import { NS } from 'bitburner';
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
    const mostCurrentMoney = nodes.reduce((prev, current) => (prev.moneyPerHack > current.moneyPerHack) ? prev : current);
    const mostMoneyPotential = nodes.reduce((prev, current) => prev.potentialMoney > current.potentialMoney ? prev : current);
    ns.print(`# Target Node is now '${mostCurrentMoney.name}': [~${mostCurrentMoney.moneyPerHack.toFixed(2)}$/hack]`);
    ns.print(`# Highest Potential Node: '${mostMoneyPotential.name}' [~${mostMoneyPotential.potentialMoney.toFixed(2)}$/hack]`)
    const payload: TargetPayload = {
        mostMoney: mostCurrentMoney.name,
        mostPotential: mostMoneyPotential. name
    }
    const payloadText = JSON.stringify(payload);
    ns.print(`## Publishing payload: ${payloadText}`);

    await patch(ns).publishTarget({
        currentTarget: mostCurrentMoney.name,
        highestPotential: mostMoneyPotential.name
    });
}
