/**
 * Deploys BatchProofRegistry to Arbitrum Sepolia (testnet only).
 *
 * Usage:
 *   npx hardhat run scripts/deploy.js --network arbitrumSepolia
 *
 * Requires ARBITRUM_SEPOLIA_RPC_URL and DEPLOYER_PRIVATE_KEY in contracts/.env
 * (see contracts/.env.example). Use a dedicated wallet holding testnet ETH
 * only — never a production key.
 */
const hre = require('hardhat')

async function main() {
  const [deployer] = await hre.ethers.getSigners()
  if (!deployer) {
    throw new Error('No deployer account. Set DEPLOYER_PRIVATE_KEY in contracts/.env')
  }

  console.log('Network:', hre.network.name, `(chainId ${hre.network.config.chainId})`)
  console.log('Deploying BatchProofRegistry with account:', deployer.address)

  const Registry = await hre.ethers.getContractFactory('BatchProofRegistry')
  const registry = await Registry.deploy()
  await registry.waitForDeployment()

  const address = await registry.getAddress()
  console.log('BatchProofRegistry deployed to:', address)
  console.log(
    'Set NEXT_PUBLIC_BATCH_REGISTRY_ADDRESS=' + address +
    ' in the app environment to enable on-chain anchoring.',
  )
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
