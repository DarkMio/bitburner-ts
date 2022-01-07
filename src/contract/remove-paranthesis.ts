export default (input: string) => {
    let solutions = new Set<string>();

    // Returns true and adds to solutions set if a string contains valid parentheses, false otherwise
    let checkValidity = (str: string) => {
        let nestLevel = 0;
        for (let c of str) {
            if (c == "(") {
                nestLevel++;
            }
            else if (c == ")") nestLevel--;
            if (nestLevel < 0) return false;
        }

        if (nestLevel == 0) solutions.add(str);
        return nestLevel == 0;
    };

    // Does a breadth first search to check all nodes at the target depth
    let getNodesAtDepth = (str: string, targetDepth: number, curDepth = 0) => {
        if (curDepth == targetDepth) {
            checkValidity(str);
        } else {
            for (let i = 0; i < str.length; i++) {
                if (str[i] == "(" || str[i] == ")") {
                    getNodesAtDepth(str.slice(0, i) + str.slice(i + 1), targetDepth, curDepth + 1);
                }
            }
        }
    }

    // Start from the top level and expand down until we find at least one solution
    let targetDepth = 0;
    while (solutions.size == 0 && targetDepth < input.length - 1) {
        getNodesAtDepth(input, targetDepth++);
    }

    // If no solutions were found, return [""]
    if (solutions.size == 0) solutions.add("");
    return [...solutions];
}