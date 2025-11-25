import SmeeClient from 'smee-client';

const smee = new SmeeClient({
  source: 'https://smee.io/J5REMo0Bz5yYflP',
  target: 'http://localhost:3000/webhook/github',
  logger: console,
});
smee.start();
