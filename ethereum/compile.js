// const path = require("path");
// const solc = require('solc');
// const fs = require("fs-extra");

// const buildPath = path.resolve(__dirname, "build");
// fs.removeSync(buildPath);

// const ehrPath = path.resolve(__dirname, "contracts", "EHR.sol");
// const source = fs.readFileSync(ehrPath, "utf8");
// const output = solc.compile(source, 1).contracts;

// fs.ensureDirSync(buildPath);

// for (let contract in output) {
//   fs.outputJsonSync(
//     path.resolve(buildPath, contract.replace(":", "") + ".json"),
//     output[contract]
//   );
// }

const path = require('path');
const solc = require('solc');
const fs = require('fs-extra');

const buildPath = path.resolve(__dirname, 'build');
fs.removeSync(buildPath);

const ehrPath = path.resolve(__dirname, 'contracts', 'EHR.sol');
const source = fs.readFileSync(ehrPath, 'UTF-8');

var input = {
    language: 'Solidity',
    sources: {
        'EHR.sol' : {
            content: source
        }
    },
    settings: {
        outputSelection: {
            '*': {
                '*': [ '*' ]
            }
        }
    }
};

var output = JSON.parse(solc.compile(JSON.stringify(input)));
fs.ensureDirSync(buildPath);

for(contractName in output.contracts['EHR.sol']){
    fs.outputJSONSync(
        path.resolve(buildPath, contractName + '.json'),
        output.contracts['EHR.sol'][contractName]
    );
}