import web3 from "./web3";
import EHR from './build/EHR.json';

const instance = new web3.eth.Contract(
    EHR.abi,
    '0xf4dC538ded75936Bd8672f7FbC73259Be0be2eC0'
);

export default instance;