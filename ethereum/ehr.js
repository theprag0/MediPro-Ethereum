import web3 from "./web3";
import EHR from './build/EHR.json';

const instance = new web3.eth.Contract(
    JSON.parse(EHR.interface),
    '0x63367b303D2143Fdf913b930729541f42c868fbD'
);

export default instance;