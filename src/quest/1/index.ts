import {
  Keypair,
  Networks,
  Operation,
  Server,
  TransactionBuilder,
} from 'stellar-sdk';
import dotenv from 'dotenv';
dotenv.config();

const init = async () => {
  const privateKey = <string>process.env.STELLAR_SECRET_KEY;

  const questKeypair = Keypair.fromSecret(privateKey);
  console.log('QUEST_KEYPAIR', questKeypair);

  const newKeypair = Keypair.random();
  console.log('NEW_KEYPAIR', newKeypair);

  const server = new Server('https://horizon-testnet.stellar.org');
  const questAcc = await server.loadAccount(questKeypair.publicKey());

  const tx = new TransactionBuilder(questAcc, {
    fee: '100',
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.createAccount({
        destination: newKeypair.publicKey(),
        startingBalance: '1000',
      }),
    )
    .setTimeout(30)
    .build();

  tx.sign(questKeypair);
  console.log(tx.toXDR());

  try {
    const response = await server.submitTransaction(tx);
    console.log('transaccion sucessful! hash: ', response.hash);
  } catch (error) {
    console.log(
      `${error}. More details: \n${JSON.stringify(
        //@ts-ignore
        error.response.data.extras,
        null,
        2,
      )}`,
    );
  }
};

init();
