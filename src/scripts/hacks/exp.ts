import { NS } from 'bitburner';

export async function main(ns: NS) {
    while(true) {
        await ns.grow('joesguns');
    }
}