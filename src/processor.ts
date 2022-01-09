import { NS } from 'bitburner';
import execIfExists from 'utils/exec-if-exists';
import killProcesses from 'utils/kill-processes';

const NodeDeploymentScript = '/scripts/unified-deployment.js';
const FindTargetScript = '/scripts/find-target.js';
const TargetingScripts = [NodeDeploymentScript, FindTargetScript];

export async function main(ns: NS) {
    killProcesses(ns, 'home', ...TargetingScripts)

    if(!execIfExists(ns, NodeDeploymentScript, 'home')) {
        ns.tprint(`# deploy-all failed!`);
    }
    if(!execIfExists(ns, FindTargetScript, 'home')) {
        ns.tprint('# find-target failed!');
    }
}