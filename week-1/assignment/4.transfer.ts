
import { SystemProgram, Keypair, Transaction, LAMPORTS_PER_SOL, sendAndConfirmTransaction } from "@solana/web3.js";

import { payer, connection } from "@/lib/vars";
import { explorerURL, printConsoleSeparator } from "@/lib/helpers";

import { PublicKey } from "@metaplex-foundation/js";

(async () => {

  const publicKey = new PublicKey("7Xg2Zd1vBs2uQZ6VWDw4q5WaMxFvnyjv5Qz816D3H3yg");

  const privateKey = Uint8Array.from([
    50,  70, 115, 136, 178,   1,  76, 252, 114, 250, 122,
   205, 175, 221, 241,   9,  94, 170, 249,  21, 125,  37,
    45,  89, 244,  48,  70, 161,  28, 211, 173, 152,  97,
     1, 172, 121, 151, 191, 251, 187,  42,  81, 184,  86,
   128,   8,  12, 124, 102, 111,  63, 226, 176,  63, 138,
   206, 237,  87, 154,  61,  13, 178,  99, 127
 ]);
  const keypairFromSecretKey = Keypair.fromSecretKey(privateKey);

  const accountInfo = await connection.getAccountInfo(publicKey);
  if (!accountInfo) {
    console.error("Account does not exist.");
    return;
  }

  let transaction = new Transaction();

  const accountBlanceBefore = await connection.getBalance(publicKey);
  console.log("new account balance before close in SOL :", accountBlanceBefore / LAMPORTS_PER_SOL);
  console.log("new account balance before close:", accountBlanceBefore); 

  const closeNewAccountIx = SystemProgram.transfer({
    lamports: await connection.getBalance(publicKey) - 5000,
    fromPubkey: publicKey,
    toPubkey: payer.publicKey,
    programId: SystemProgram.programId,
  });

  transaction.add(closeNewAccountIx);

  try {
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction, 
      [keypairFromSecretKey]
    );
    console.log(explorerURL({ txSignature: signature }));
  } catch (error) {
    console.error("Failed to send transaction:", error);
  }

  const payerAccountBlance = await connection.getBalance(payer.publicKey);
  console.log("payer account balance in SOL :", payerAccountBlance / LAMPORTS_PER_SOL);
  console.log("payer account balance:", payerAccountBlance); 

  /**
   * display some helper text
   */
  printConsoleSeparator();

  console.log("Transaction completed.");
  // console.log(explorerURL({ txSignature: signature }));
})();
