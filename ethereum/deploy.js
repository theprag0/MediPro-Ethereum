const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
const compiledEHR = require('./build/EHR.json');

const provider = new HDWalletProvider({
  mnemonic: {
      phrase: 'prison holiday imitate public jelly pupil monkey old talk saddle situate front'
  },
  providerOrUrl: "https://goerli.infura.io/v3/d5f91e62ef164e8fa13348e5882b8bba"
});
const web3 = new Web3(provider);

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();

  console.log('Attempting to deploy from account', accounts[0]);

  const result = await new web3.eth.Contract(
    JSON.parse(compiledEHR.interface)
  )
    .deploy({ data: compiledEHR.bytecode })
    .send({ gas: '1000000', from: accounts[0] });

  console.log('Contract deployed to', result.options.address);
  provider.engine.stop();
};
deploy();
