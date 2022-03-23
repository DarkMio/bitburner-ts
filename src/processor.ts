import { NS } from 'bitburner';
import execIfExists from 'utils/exec-if-exists';
import killProcesses from 'utils/kill-processes';

const NodeDeploymentScript = '/scripts/unified-deployment.js';
const FindTargetScript = '/scripts/find-target.js';
const ContractSolverScript = '/scripts/solve-contracts.js';

const TargetingScripts = [NodeDeploymentScript, FindTargetScript, ContractSolverScript];

export async function main(ns: NS) {
    killProcesses(ns, 'home', ...TargetingScripts)

    TargetingScripts.forEach(x => {
        if(!execIfExists(ns, x, 'home', 1, ...ns.args)) {
            ns.tprint(`ERROR: ${x} failed to launch`)
        }
    })
}