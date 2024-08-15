
import { SystemProgram, Keypair, Transaction, LAMPORTS_PER_SOL, sendAndConfirmTransaction } from "@solana/web3.js";

import { payer, connection, STATIC_PUBLICKEY } from "@/lib/vars";
import { explorerURL, printConsoleSeparator } from "@/lib/helpers";

(async () => {
  console.log("static public key:", STATIC_PUBLICKEY.toBase58());

  const keypair = Keypair.generate(); 

  console.log("New keypair generated:", keypair.publicKey.toBase58());
  console.log("New keypair private key:", keypair.secretKey);

  const space = 0;
  const balanceForRentExemption = await connection.getMinimumBalanceForRentExemption(space);

  let transaction = new Transaction();

  const createNewAccountIx = SystemProgram.createAccount({
    fromPubkey: payer.publicKey,
    newAccountPubkey: keypair.publicKey,
    lamports: balanceForRentExemption + 100_000_000,
    space,
    programId: SystemProgram.programId,
  });

  transaction.add(createNewAccountIx);

  const transferToStaticAccountIx = SystemProgram.transfer({
    lamports: 1_000_000,
    fromPubkey: keypair.publicKey,
    toPubkey: STATIC_PUBLICKEY,
    programId: SystemProgram.programId,
  });

  transaction.add(transferToStaticAccountIx);

  // account is closed when balance = 0, so transfer all balance - 5000 for fee to payer
  // but not sure why balance = 0, so account is not closed
  // it works fine when 1 instruction is used in 4.transfer.ts
  // it does not work so i dont run on testnet
  // an transaction i did: 5fD7EKsSQGmMt2Ahg7abdZie7TmepkMypd49kJo72SFhFSxJxEHQXhPjVu6rm2LAqV3E8dS1RjoThebKHDewgvc8
  const closeNewAccountIx = SystemProgram.transfer({
    lamports: await connection.getBalance(keypair.publicKey) - 5000,
    fromPubkey: keypair.publicKey,
    toPubkey: payer.publicKey,
    programId: SystemProgram.programId,
  });

  transaction.add(closeNewAccountIx);
  
  try {
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction, 
      [payer, keypair]
    );
    console.log(explorerURL({ txSignature: signature }));
  } catch (error) {
    console.error("Failed to send transaction:", error);
  }

  const accountInfo = await connection.getAccountInfo(keypair.publicKey);

  if (!accountInfo) {
    console.log("Account is closed");

  } else {
    console.log("Account is not closed");

    const accountBlanceBefore = await connection.getBalance(keypair.publicKey);
    console.log("new account balance in SOL :", accountBlanceBefore / LAMPORTS_PER_SOL);
    console.log("new account balance:", accountBlanceBefore); 
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
