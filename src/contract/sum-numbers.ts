import { NS } from 'bitburner';

export async function main(ns: NS) {
    const input = Number.parseInt(ns.args[0] as string);
    ns.tprint(`Number of ways is ${NumberOfways(input, input - 1)}`);
}

function NumberOfways(N: number, K: number)
{
    // Initialize a list
    let dp = Array.from({length: N +1}, (_, i) => 0);
   
    // Update dp[0] to 1
    dp[0] = 1;
 
    // Iterate over the range [1, K + 1]
    for(let row = 1; row < K + 1; row++)
    {
        // Iterate over the range [1, N + 1]
        for(let col = 1; col < N + 1; col++)
        {        
            // If col is greater
            // than or equal to row
            if (col >= row)      
                // Update current
                // dp[col] state
                dp[col] = dp[col] + dp[col - row];
          }
    }
 
    // Return the total number of ways
    return(dp[N]);
}