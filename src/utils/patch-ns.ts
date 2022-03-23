import { NS } from 'bitburner';

/** Network Port for target messages */
const TargetPort = 1;
interface TargetMessage {
    currentTarget: string,
    highestPotential: string
}


/**
 * Patching NS for convenient, 0 additional cost functions
 */
const patch = (ns: NS) => {
    return {
        ...ns,
        /** Callbacked wget call */
        wgetCallback: async (url: string, target: string, onSuccess: () => void, onError: () => void, host?: string) => {
            const success = await ns.wget(url, target);
            if(success) {
                onSuccess();
            } else {
                onError();
            }
            return success;
        },
        /** Prints in Log and Terminal */
        ltprint: (message: any) => {
            ns.tprint(message);
            ns.print(message);
        },
        fetchTarget: () => {
            const message = ns.peek(TargetPort);
            if(message === "NULL PORT DATA") {
                return null;
            }
            return JSON.parse(message) as TargetMessage;
        },
        publishTarget: (target: TargetMessage) => {
            ns.clearPort(TargetPort);
            ns.writePort(TargetPort, JSON.stringify(target));
        }
    };
}


export default patch; 