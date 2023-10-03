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

const ISSUER_PK = 'GAD4FB3XI5RAIOAFLETE5UJE7QUXZ4E3YTCC7FP6BVN43EVSMDKBZKEK';

const STELLAR_SECRET_KEY = <string>process.env.STELLAR_SECRET_KEY;

const questKeypair = Keypair.fromSecret(STELLAR_SECRET_KEY);

const init = async () => {
  const TEST_SERVER_URL = 'https://horizon-testnet.stellar.org';
  const server = new Server(TEST_SERVER_URL);
  const questAcc = await server.loadAccount(questKeypair.publicKey());

  const pizzaAsset = new Asset('PIZZA', ISSUER_PK);

  const tx = new TransactionBuilder(questAcc, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.changeTrust({
        asset: pizzaAsset,
        source: questKeypair.publicKey(),
        limit: '100',
      }),
    )
    .setTimeout(30)
    .build();
  tx.sign(questKeypair);

  try {
    let res = await server.submitTransaction(tx);
    console.log(`Transaction Successful! Hash: ${res.hash}`);
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
