import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import "@typechain/hardhat";
import { task } from "hardhat/config";
import readline from "readline";
import { exec } from "child_process";

task("repl", "create a repl").setAction(async (args, hre) => {
  await hre.run("run", { script: "scripts/repl.ts" });
});

task("scen", "run scenario")
  .addParam("file", "file to evaluate to evaluate")
  .setAction(async (args, hre) => {
    const child = exec(`npx ts-node scripts/scen.ts --file ${args.file}`);
    child.stdout.pipe(process.stdout);
    child.on("exit", () => {
      process.exit();
    });
    await new Promise(function () {});
  });

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
export default {
  networks: {
    hardhat: {
      forking: {
        url: "https://mainnet-eth.compound.finance",
        blockNumber: 12466889,
      },
    },

    mainnet: {
      url: "https://mainnet-eth.compound.finance",
      accounts: [],
    },
  },

  solidity: {
    version: "0.5.16",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },

  typechain: {
    outDir: "./typechain",
    target: "ethers-v5",
    alwaysGenerateOverloads: false,
  },
};

//load our own development plugin
//import "./plugin/src";
