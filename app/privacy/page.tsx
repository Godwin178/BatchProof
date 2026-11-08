import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy policy',
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">Privacy policy</h1>
      <p className="mt-2 text-sm text-slate-500">Last updated: 2025</p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-slate-700">
        <section>
          <h2 className="text-lg font-semibold text-slate-900">1. Who we are</h2>
          <p className="mt-2">
            BatchProof (&quot;we&quot;, &quot;the platform&quot;) is a batch traceability service
            that lets businesses register product batches and publish verifiable
            batch information to the public through QR codes.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">2. Data we process</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              <strong>Account data:</strong> email address and password (authentication is
              handled by Supabase; passwords are stored only as secure hashes by Supabase).
            </li>
            <li>
              <strong>Business profile data:</strong> business name, industry, website and
              description you choose to publish.
            </li>
            <li>
              <strong>Batch data:</strong> product and batch information you register,
              including batch ID, producer, origin, production and expiry dates, and
              descriptions, plus history events you record.
            </li>
            <li>
              <strong>Public reports:</strong> when a visitor files a report from a
              verification page we store the batch ID, the chosen reason, any optional
              details and the optional contact email they provide.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">3. What is public</h2>
          <p className="mt-2">
            By registering a batch you publish it for verification: anyone holding
            the batch QR code can view the product name, SKU, producer name, origin,
            dates, description and full event history. Do not include confidential
            business information you are not prepared to publish.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">4. Blockchain data</h2>
          <p className="mt-2">
            When anchoring is enabled, only a SHA-256 cryptographic fingerprint of a
            batch record is written to the Arbitrum Sepolia test network. No personal
            data, business names, origins or any other private information is ever
            placed on-chain. Blockchain transactions are public and cannot be deleted
            by design.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">5. Third parties</h2>
          <p className="mt-2">
            The platform uses Supabase for authentication and data storage, and the
            Arbitrum Sepolia public test network for anchoring. Public blockchain
            explorers (such as Arbiscan) may show transaction hashes and addresses.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">6. Your rights</h2>
          <p className="mt-2">
            You may update your business profile at any time from the dashboard. You
            may delete your products and batches from the dashboard. To request full
            account deletion, contact the platform operator; account deletion also
            removes the associated profile and business data.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">7. Testnet notice</h2>
          <p className="mt-2">
            BatchProof integrates the Arbitrum Sepolia test network for evaluation
            purposes. Data anchored on a test network carries no economic value and
            should not be relied upon for production guarantees.
          </p>
        </section>
      </div>
    </div>
  )
}