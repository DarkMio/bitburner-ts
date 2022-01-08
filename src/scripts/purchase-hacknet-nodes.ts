import { NS } from 'bitburner';

interface NodeStats {
    idx: number,
    levelUpgradeCost: number,
    currentLevel: number
}

export async function main(ns: NS) {
    if(ns.args.length < 1) {
        ns.tprint("Invalid usage: [percentage of money used] ")
        return;
    }
    const percentage = parseFloat(`${ns.args[0]}`);
    const money = ns.getServerMoneyAvailable('home');

    
    const availableMoney = money * (percentage / 100);

    let moneySpent = 0;
    const hacknet = ns.hacknet;

    while(moneySpent < availableMoney) {
        // an upgrade and purchasing a node has initially a similar impact
        // however buying one node remedies itself as buying cores for it is  
        const purchaseCost = hacknet.getPurchaseNodeCost();
        const nodeStats: NodeStats[] = [];
        const nodes = hacknet.numNodes();
        for(let i = hacknet.numNodes() - 1; i >= 0; i--) {
            nodeStats.push({
                idx: i,
                levelUpgradeCost: hacknet.getLevelUpgradeCost(i, 1),
                currentLevel: hacknet.getNodeStats(i).level
            });
        }
        const cheapestUpgrade = nodeStats.reduce((a, b) => a.currentLevel < b.currentLevel ? a : b);
        if((purchaseCost / 10) < cheapestUpgrade.levelUpgradeCost) {
            hacknet.purchaseNode();
            continue;
        }

        hacknet.upgradeLevel(cheapestUpgrade.idx, 1)

        moneySpent = money - ns.getServerMoneyAvailable('home');
    }    
}