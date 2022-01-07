import { NS } from 'bitburner';
import { TargetPayload } from './find-target';

export async function main(ns: NS) {
    const target = ns.args[0];
    ns.print(`Executing Stage 1 (exploit) on host '${target}'`);
    while(true) {
        const portContent = await ns.peek(1);
        let payloadText = `${portContent}`;
        if(payloadText === "NULL PORT DATA") {
            await ns.sleep(250);
            continue;
        }
        const payload = JSON.parse(payloadText) as TargetPayload; 
        ns.print(`### Hacking target '${payload.mostMoney}', then build on ${payload.mostPotential}`);
        
        await ns.hack(payload.mostMoney);
        await ns.grow(payload.mostPotential);
        await ns.weaken(payload.mostPotential);
    }


}