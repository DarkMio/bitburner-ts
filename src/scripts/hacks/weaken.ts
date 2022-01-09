import { NS } from 'bitburner';
import patch from 'utils/patch-ns';


export async function main(nss: NS) {
    const ns = patch(nss);

    while(true) {
        const target = ns.fetchTarget();
        if(target === null) {
            await ns.sleep(500);
            continue;
        }
        await ns.weaken(target.highestPotential);
    }
}