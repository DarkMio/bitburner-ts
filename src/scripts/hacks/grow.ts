import { NS } from 'bitburner';
import patch from 'utils/patch-ns';


export async function main(nss: NS) {
    const ns = patch(nss);

    while(true) {
        const target = ns.fetchTarget();
        await ns.grow(target.highestPotential);
    }
}