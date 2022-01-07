export default (number: number) => {
    const num = number.toString();

    const length = num.length;

    const ips = [];

    for (let i = 1; i < length - 2; i++) {
        for (let j = i + 1; j < length - 1; j++) {
            for (let k = j + 1; k < length; k++) {
                const ip = [
                    num.slice(0, i),
                    num.slice(i, j),
                    num.slice(j, k),
                    num.slice(k, num.length)
                ];
                let isValid = true;

                ip.forEach(seg => {
                    isValid = isValid && isValidIpSegment(seg);
                });

                if (isValid) {
                    ips.push(ip.join("."));
                }

            }

        }
    }

    return ips;
}

const isValidIpSegment = (segment: string) => {
    if (segment[0] == "0" && segment != "0") {
        return false;
    }
    const number = Number(segment);
    if (number < 0 || number > 255) {
        return false;
    }
    return true;
} 