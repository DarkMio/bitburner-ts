import { NS } from 'bitburner';
import { exec } from 'utils/patch-ns';

export async function main(ns: NS) {
    const processes = ns.ps('home').filter(x => !(
        ['processor.js', '/deployment/redeploy.js'].includes(x.filename)
    ));
    processes.forEach(x => ns.kill(x.pid));

    exec(ns, '/scripts/deploy-all.js', 'home', (pid) => {
        ns.tprint(`# deploy-all started, pid ${pid}`);
    }, () => {
        ns.tprint(`# deploy-all failed!`);
    })

    exec(ns, '/scripts/find-target.js', 'home', (pid) => {
        ns.tprint(`# find-target started, pid ${pid}`);
    }, () => {
        ns.tprint(`# find-target failed!`);
    });
}