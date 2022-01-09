import { NS } from "bitburner";


export default (ns: NS, host: string, ...processNames: string[]) => {
    const ps = ns.ps(host);
    const pids = ps.filter(x => processNames.includes(x.filename)).map(x => x.pid);
    pids.forEach(x => ns.kill(x));
}
