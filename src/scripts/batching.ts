import { NS } from 'bitburner';
import { getNodes, Node } from 'utils/node-scan';

export async function main(ns: NS) {
    const targetServer = `${ns.args[0]}`;

    let decimalProzentageOfMoneyToGet = 0.5;
    let money = ns.getServerMoneyAvailable(targetServer);
    let threadsPerHack = Math.ceil(ns.hackAnalyzeThreads(targetServer, money * decimalProzentageOfMoneyToGet));
    let securityIncreaseThroughHack = threadsPerHack * 0.002 * 1.1;
    let threadsNeededToWeakenAfterHacking = Math.ceil(securityIncreaseThroughHack / 0.05);
    let neededGrowth = (1.5 / (1 - decimalProzentageOfMoneyToGet));
    let neededThreadsGrowth = Math.ceil(ns.growthAnalyze(targetServer, neededGrowth));
    let securityIncreaseThroughGrow = neededThreadsGrowth * 0.004 * 1.1;
    let threadsNeededToWeakenAfterGrowing = Math.ceil(securityIncreaseThroughGrow / 0.05);

    ns.tprint(`\nt/h: ${threadsPerHack}\nt/w: ${threadsNeededToWeakenAfterHacking}\nt/g: ${neededThreadsGrowth}\nt/w: ${threadsNeededToWeakenAfterGrowing}`);
}