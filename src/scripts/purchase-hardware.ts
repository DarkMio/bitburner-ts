import { NS } from 'bitburner';
import { ram as ramFmt, thousands } from 'utils/formatter';



export async function main(ns: NS) {
    // does not work, I need a certain file (?)
    // ns.purchaseTor();
    const maxRam = ns.getPurchasedServerMaxRam();
    const maxRamLog = Math.log2(maxRam);
    const maxServers = ns.getPurchasedServerLimit();
    let serverCount = ns.getPurchasedServers().length;
    let funds = ns.getServerMoneyAvailable('home');

    let [cost, ram] = [0, 0];
    for(let i = maxRamLog; i > 1; i--) {
        ram = Math.pow(2, i);
        cost = ns.getPurchasedServerCost(Math.pow(2, i));

        if(cost <= funds || serverCount >= maxServers) {
            if(!(await ns.prompt(`Purchase a ${ramFmt(ram)} server for ${thousands(cost)}$?`))) {
                break;
            }
            ns.purchaseServer(`${ramFmt(ram)}-${Date.now()}`, ram);
            break;
        }
    }
}