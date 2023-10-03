import dotenv from 'dotenv';
import {
  Asset,
  BASE_FEE,
  Keypair,
  Networks,
  Operation,
  Server,
  TransactionBuilder,
} from 'stellar-sdk';
dotenv.config();

const init = async () => {
  const SECRET_KEY = <string>process.env.STELLAR_SECRET_KEY;

  const questKeyPair = Keypair.fromSecret(SECRET_KEY);
  const destinationKeyPair =
    'GAD4FB3XI5RAIOAFLETE5UJE7QUXZ4E3YTCC7FP6BVN43EVSMDKBZKEK';

  const server = new Server('https://horizon-testnet.stellar.org');

  const questAccount = await server.loadAccount(questKeyPair.publicKey());
  console.log(questAccount);

  const tx = new TransactionBuilder(questAccount, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.payment({
        amount: '100',
        destination: destinationKeyPair,
        asset: Asset.native(),
      }),
    )
    .setTimeout(30)
    .build();

  tx.sign(questKeyPair);

  try {
    const response = await server.submitTransaction(tx);
    console.log(`transaction sucessful! Hash: ${response.hash}`);
  } catch (error) {
    console.log(
      `${error}. More details:\n${JSON.stringify(
        //@ts-ignore
        error.response.data.extras,
        null,
        2,
      )}`,
    );
  }
};

init();
