import { NS } from 'bitburner';

export default (input: number) => {
    const n = input;
    const k = input - 1;
    // Initialize a list
    let dp = Array.from({length: n +1}, (_, i) => 0);
   
    // Update dp[0] to 1
    dp[0] = 1;
 
    // Iterate over the range [1, k + 1]
    for(let row = 1; row < k + 1; row++)
    {
        // Iterate over the range [1, n + 1]
        for(let col = 1; col < n + 1; col++)
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
    return(dp[n]);
}