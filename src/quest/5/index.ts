import {
  Operation,
  Networks,
  BASE_FEE,
  Asset,
  TransactionBuilder,
  Keypair,
  Server,
} from 'stellar-sdk';
import { friendbot } from '../../utils/friendbot';
import dotenv from 'dotenv';
dotenv.config();

const init = async () => {
  const STELLAR_SECRET_KEY = <string>process.env.STELLAR_SECRET_KEY;
  const questKeypair = Keypair.fromSecret(STELLAR_SECRET_KEY);
  const issuerKeypair = Keypair.random();
  const distributorKeypair = Keypair.random();
  const destinationKeypair = Keypair.random();

  // fund accounts
  await friendbot([
    // questKeypair.publicKey(),
    issuerKeypair.publicKey(),
    distributorKeypair.publicKey(),
    destinationKeypair.publicKey(),
  ]);

  const SERVER_URL = 'https://horizon-testnet.stellar.org';
  const server = new Server(SERVER_URL);
  const questAcc = await server.loadAccount(questKeypair.publicKey());

  const pathAsset = new Asset('PATH', issuerKeypair.publicKey());

  const tx = new TransactionBuilder(questAcc, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.changeTrust({
        asset: pathAsset,
        source: destinationKeypair.publicKey(),
      }),
    )
    .addOperation(
      Operation.changeTrust({
        asset: pathAsset,
        source: distributorKeypair.publicKey(),
      }),
    )
    .addOperation(
      Operation.payment({
        destination: distributorKeypair.publicKey(),
        asset: pathAsset,
        amount: '1000000',
        source: issuerKeypair.publicKey(),
      }),
    )
    .addOperation(
      Operation.createPassiveSellOffer({
        selling: pathAsset,
        buying: Asset.native(),
        amount: '2000',
        price: '1',
        source: distributorKeypair.publicKey(),
      }),
    )
    .addOperation(
      Operation.createPassiveSellOffer({
        selling: Asset.native(),
        buying: pathAsset,
        amount: '2000',
        price: '1',
        source: distributorKeypair.publicKey(),
      }),
    )
    .addOperation(
      Operation.pathPaymentStrictSend({
        sendAsset: Asset.native(),
        sendAmount: '1000',
        destination: destinationKeypair.publicKey(),
        destAsset: pathAsset,
        destMin: '1000',
      }),
    )
    .addOperation(
      Operation.pathPaymentStrictReceive({
        sendAsset: pathAsset,
        sendMax: '450',
        destination: questKeypair.publicKey(),
        destAsset: Asset.native(),
        destAmount: '450',
        source: destinationKeypair.publicKey(),
      }),
    )
    .setTimeout(30)
    .build();
  tx.sign(issuerKeypair, destinationKeypair, distributorKeypair, questKeypair);

  try {
    const response = await server.submitTransaction(tx);
    console.log(`Success! hash: ${response.hash}`);
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
