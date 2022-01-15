const arrayJumping = (data: number[]) => {
    if (data.length == 1) { 
        return 1;
    }
    
    const jumps = data[0]

    for (let i = jumps; i >= 1; --i) {
        const jumpTest = arrayJumping(data.slice(i, data.length))
        if (jumpTest == 1) {
            return 1;
        } 
    }

    return 0;
}

export default arrayJumping;