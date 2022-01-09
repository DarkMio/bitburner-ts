import { NS } from 'bitburner';

interface NodeStats {
    idx: number,
    levelUpgradeCost: number,
    currentLevel: number
}

export async function main(ns: NS) {
    ns.disableLog('ALL');
    if(ns.args.length < 1) {
        ns.tprint("Invalid usage: [percentage of money used] ")
        return;
    }
    const percentage = parseFloat(`${ns.args[0]}`);


    while(true) {
        const initialMoney = ns.getServerMoneyAvailable('home');
        // wait 5 minutes
        await ns.sleep(5 * 60 * 1_000);
        const money = ns.getServerMoneyAvailable('home');
        const income = money - initialMoney;
        const availableMoney = income * (percentage / 100);
        
        let moneySpent = 0;
        const hacknet = ns.hacknet;

        let cycles = 0;
        const purchases = {
            nodes: 0,
            upgrades: 0
        }
        while(moneySpent < availableMoney && cycles < 25_000) {
            cycles += 1;
            // an upgrade and purchasing a node has initially a similar impact
            // however buying one node remedies itself as buying cores for it is  
            const purchaseCost = hacknet.getPurchaseNodeCost();
            const nodeStats: NodeStats[] = [];
            const nodes = hacknet.numNodes();
            if(nodes <= 0) {
                const idx = hacknet.purchaseNode();
                if(idx < 0) {
                    break;
                }
                continue;
            }
            for(let i = hacknet.numNodes() - 1; i >= 0; i--) {
                nodeStats.push({
                    idx: i,
                    levelUpgradeCost: hacknet.getLevelUpgradeCost(i, 1),
                    currentLevel: hacknet.getNodeStats(i).level
                });
            }
            const cheapestUpgrade = nodeStats.reduce((a, b) => a.currentLevel < b.currentLevel ? a : b);
            if((purchaseCost / 10) < cheapestUpgrade.levelUpgradeCost) {
                const idx = hacknet.purchaseNode();
                if(idx < 0) {
                    break;
                }
                purchases.nodes += 1;
                continue;
            }

            if(!hacknet.upgradeLevel(cheapestUpgrade.idx, 1)) {
                break;
            }
            purchases.upgrades += 1;
            moneySpent = money - ns.getServerMoneyAvailable('home');
        }
        ns.print(`Spent ${moneySpent.toFixed(2)}$, [${purchases.upgrades}] upgrades, [${purchases.nodes}] nodes`);
    }
}