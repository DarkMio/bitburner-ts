
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const logBase = (value: number, base: number) => Math.log(value) / Math.log(base);

const genericScale = (value: number, base: number, symbols: string[]) => {
    const log = logBase(value, base);
    const idx = clamp(Math.floor(log), 0, symbols.length - 1);
    // the clamped version might be  smaller than the logarithmic value
    const divisor = Math.pow(base, idx);
    const finalValue = value / divisor;
    return `${finalValue.toFixed(2)}${symbols[idx]}`;
}

const ThousandsScale = ['', 'k', 'm', 'b', 't']
export const thousands = (value: number) => genericScale(value, 1000, ThousandsScale);
export const money = (value: number) => thousands(value);

const DataSymbols = ['GB', 'TB', 'PB', 'EB'];
export const data = (value: number) => genericScale(value, 1024, DataSymbols);
export const ram = (value: number) => data(value);
