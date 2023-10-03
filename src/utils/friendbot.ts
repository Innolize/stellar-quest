import axios from 'axios';

export const fundAccount = async (publicKey: string) => {
  const FRIENDBOT_URL = 'https://friendbot.stellar.org/';

  const { data } = await axios.get(`${FRIENDBOT_URL}?addr=${publicKey}`);

  return data;
};

export const friendbot = async (publicKeysList: string[]) => {
  // I know this is bad practice, but its the simplest way of doing this.
  const promisesArray = publicKeysList.map((publicKey) =>
    fundAccount(publicKey),
  );

  await Promise.all(promisesArray);
};
