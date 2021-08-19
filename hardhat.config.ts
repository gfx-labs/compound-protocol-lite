import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import "@typechain/hardhat";

//load our own development plugin
import "./plugin/src";

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
};
