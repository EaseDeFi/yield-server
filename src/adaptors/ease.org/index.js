const utils = require('../utils');
const Web3 = require('web3');
require('dotenv').config({ path: './config.env' });
const bribePotAbi = require('./bribePotAbi.json');
const web3 = new Web3(process.env.INFURA_CONNECTION);

const bribePotContractAddress = '0xEA5EdeF17C9be57228389962ba50b98397f1E28C';

const apy = async () => {
  
  const bribePotContract = new web3.eth.Contract(
    bribePotAbi,
    bribePotContractAddress
  );

  const totalSupply = await bribePotContract.methods.totalSupply().call();
  const genesis = await bribePotContract.methods.genesis().call();
  const currentTimeStamp = (await web3.eth.getBlock('latest')).timestamp;
  const currentWeek = Math.floor(((currentTimeStamp - genesis) / (60*60*24*7)));
  const nextWeek = currentWeek + 1;
  const bribePerCurrWeek = await bribePotContract.methods.bribePerWeek().call(); 

  // 212 is the slow for the bribeRates mapping
  const mappingKey = web3.utils.soliditySha3({type: 'uint256', value: nextWeek}, {type: 'uint256', value: 212});
  const bribeRates = await web3.eth.getStorageAt(bribePotContractAddress, mappingKey);
  const rates = bribeRates[currentWeek];
  let bribePerNextWeek = bribePerCurrWeek;
  bribePerNextWeek = bribePerNextWeek - rates.startAmt;
  bribePerNextWeek = bribePerNextWeek + rates.expireAmt;

  const weeklyYield = bribePerNextWeek / totalSupply;
  const estApr = weeklyYield * 52; //TODO: **?
  const estApy = estApr; //TODO: calc Apy with estApr 
  console.log(genesis, totalSupply, currentTimeStamp, currentWeek, bribePerCurrWeek, bribeRates, rates, bribePerNextWeek, weeklyYield, estApr, estApy);
  // return estApy;
};

module.exports = {
  timetravel: false,
  apy,
  // url: 'https://app.anchorprotocol.com/#/earn',
};

apy();