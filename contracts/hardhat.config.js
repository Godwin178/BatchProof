require('dotenv').config()
require('@nomicfoundation/hardhat-toolbox')

/** @type {import('hardhat/config').HardhatUserConfig} */
module.exports = {
  solidity: {
    version: '0.8.24',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    // Arbitrum Sepolia testnet only. BatchProof must never be deployed to
    // mainnet from this repository.
    arbitrumSepolia: {
      url: process.env.ARBITRUM_SEPOLIA_RPC_URL || '',
      chainId: 421614,
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
    },
  },
}
