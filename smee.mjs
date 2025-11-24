import SmeeClient from 'smee-client';

const smee = new SmeeClient({
  source: 'https://smee.io/89fPotsqu465Xgm',
  target: 'http://localhost:3000/webhook/github',
  logger: console,
});
smee.start();
