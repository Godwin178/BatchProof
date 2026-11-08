'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ARBITRUM_SEPOLIA_CHAIN_ID_HEX,
  getChainId,
  getRegistryAddress,
  isBlockchainConfigured,
} from '@/lib/blockchain'
import { recordAnchor } from '@/app/dashboard/actions'

interface EthereumProvider {
  request(args: { method: string; params?: unknown[] | Record<string, unknown> }): Promise<unknown>
}

interface AnchorButtonProps {
  batchId: string
  dataHash: string
  anchored: boolean
}

/**
 * Anchors the batch's SHA-256 fingerprint on BatchProofRegistry (Arbitrum
 * Sepolia) through the user's browser wallet, then records the transaction
 * hash. Only the 32-byte hash is ever sent on-chain.
 */
export default function AnchorButton({ batchId, dataHash, anchored }: AnchorButtonProps) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)

  if (anchored) {
    return (
      <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
        This batch fingerprint is already recorded as anchored on-chain.
      </p>
    )
  }

  async function anchor() {
    setIsError(false)
    setMessage(null)

    if (!isBlockchainConfigured()) {
      setIsError(true)
      setMessage(
        'Blockchain anchoring is not configured. Deploy BatchProofRegistry to Arbitrum Sepolia and set NEXT_PUBLIC_BATCH_REGISTRY_ADDRESS in your environment (see SETUP.md).',
      )
      return
    }

    const eth = (window as unknown as { ethereum?: EthereumProvider }).ethereum
    if (!eth) {
      setIsError(true)
      setMessage('No Ethereum wallet detected. Install MetaMask or another browser wallet to anchor batches.')
      return
    }

    setBusy(true)
    try {
      const { ethers } = await import('ethers')
      const provider = new ethers.BrowserProvider(eth)

      const network = await provider.getNetwork()
      if (Number(network.chainId) !== getChainId()) {
        try {
          await eth.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: ARBITRUM_SEPOLIA_CHAIN_ID_HEX }],
          })
        } catch (switchError) {
          const code = (switchError as { code?: number }).code
          if (code === 4902) {
            await eth.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: ARBITRUM_SEPOLIA_CHAIN_ID_HEX,
                  chainName: 'Arbitrum Sepolia',
                  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
                  rpcUrls: ['https://sepolia-rollup.arbitrum.io/rpc'],
                  blockExplorerUrls: ['https://sepolia.arbiscan.io'],
                },
              ],
            })
          } else {
            throw switchError
          }
        }
      }

      const signer = await provider.getSigner()
      const data = new ethers.Interface(['function anchorBatch(bytes32 batchHash)']).encodeFunctionData(
        'anchorBatch',
        [`0x${dataHash}`],
      )
      const tx = await signer.sendTransaction({ to: getRegistryAddress(), data })
      const receipt = await tx.wait()

      if (receipt === null) {
        throw new Error(
          'The transaction was not confirmed on-chain. Check the explorer before recording it.',
        )
      }

      const result = await recordAnchor(batchId, tx.hash)
      if (!result.ok) {
        setIsError(true)
        setMessage(result.error ?? 'The transaction was sent but could not be recorded.')
      } else {
        setMessage('Batch fingerprint anchored on Arbitrum Sepolia.')
        router.refresh()
      }
    } catch (err) {
      const e = err as { code?: number | string; message?: string }
      setIsError(true)
      if (e.code === 4001 || e.code === 'ACTION_REJECTED') {
        setMessage('The transaction was rejected in your wallet.')
      } else {
        setMessage(e.message ?? 'Something went wrong while sending the transaction.')
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-3">
      <button type="button" onClick={anchor} disabled={busy} className="btn-secondary w-full sm:w-auto">
        {busy ? 'Waiting for wallet…' : 'Anchor fingerprint on Arbitrum Sepolia'}
      </button>
      {message && (
        <p
          role={isError ? 'alert' : 'status'}
          className={`rounded-lg px-3 py-2 text-sm ${
            isError ? 'bg-amber-50 text-amber-800' : 'bg-emerald-50 text-emerald-700'
          }`}
        >
          {message}
        </p>
      )}
    </div>
  )
}