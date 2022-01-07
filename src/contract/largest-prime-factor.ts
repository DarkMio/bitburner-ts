
export default (x: number) => {
    let i = 2;
    while(i <= x) {
        if(x % i == 0) {
            x /= i;
        } else {
            i++;
        }
    }
    return i;
}