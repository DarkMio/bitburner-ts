import { NS } from 'bitburner';



export async function main(ns: NS) {
    // does not work, I need a certain file (?)
    // ns.purchaseTor();
    const maxRam = ns.getPurchasedServerMaxRam();
    const maxRamLog = Math.log2(maxRam);
    const maxServers = ns.getPurchasedServerLimit();
    let serverCount = ns.getPurchasedServers().length;
    let funds = ns.getServerMoneyAvailable('home');

    if(! (await ns.prompt(`You can buy at most a ${maxRam}GB server, with ${serverCount}/${maxServers} slots being used, proceed?`))) {
        return;
    }

    let [cost, ram] = [0, 0];
    for(let i = maxRamLog; i > 1; i--) {
        ram = Math.pow(2, i);
        cost = ns.getPurchasedServerCost(Math.pow(2, i));
        if(cost <= funds || serverCount >= maxServers) {
            let boughtServers = 0;
            while(funds > cost) {
                const date = new Date();
                ns.purchaseServer(`${ram}GB-${date.toISOString().split('T')[0]}`, ram);
                funds -= cost;
                boughtServers += 1;
                serverCount += 1;
            }
            ns.tprint(`Bought [${boughtServers}] servers at [${ram}]GB ram`);
            break;
        }
    }
}