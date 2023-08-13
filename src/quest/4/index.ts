import {
  Operation,
  Networks,
  Keypair,
  Server,
  Asset,
  TransactionBuilder,
  BASE_FEE,
} from 'stellar-sdk';
import dotenv from 'dotenv';
dotenv.config();

const init = async () => {
  const STELLAR_SECRET_KEY = <string>process.env.STELLAR_SECRET_KEY;
  const TEST_SERVER_URL = 'https://horizon-testnet.stellar.org';

  const questKeypair = Keypair.fromSecret(STELLAR_SECRET_KEY);
  console.log('antes');
  const server = new Server(TEST_SERVER_URL);
  console.log('despues');
  const questAcc = await server.loadAccount(questKeypair.publicKey());

  const usdcAsset = new Asset(
    'USDC',
    'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
  );

  const BUY_AMOUNT = '100';

  const PRICE_PER_EACH = '10';

  const tx = new TransactionBuilder(questAcc, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.changeTrust({
        asset: usdcAsset,
      }),
    )
    .addOperation(
      Operation.manageBuyOffer({
        selling: Asset.native(),
        buying: usdcAsset,
        buyAmount: BUY_AMOUNT,
        price: PRICE_PER_EACH,
        // offerId is optional and defaults to 0
        offerId: 0,
        source: questKeypair.publicKey(),
      }),
    )
    .addOperation(
      Operation.manageSellOffer({
        selling: Asset.native(),
        amount: '1000',
        buying: usdcAsset,
        price: '0.1',
        source: questKeypair.publicKey(),
      }),
    )
    .addOperation(
      Operation.createPassiveSellOffer({
        selling: Asset.native(),
        buying: usdcAsset,
        amount: '1000',
        price: '0.1',
        source: questKeypair.publicKey(),
      }),
    )
    .setTimeout(30)
    .build();

  tx.sign(questKeypair);

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
