import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of service',
}

export default function TermsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">Terms of service</h1>
      <p className="mt-2 text-sm text-slate-500">Last updated: 2025</p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-slate-700">
        <section>
          <h2 className="text-lg font-semibold text-slate-900">1. Acceptance</h2>
          <p className="mt-2">
            By creating an account or using BatchProof you agree to these terms. If
            you do not agree, do not use the platform.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">2. Your responsibilities</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Register only truthful, accurate batch information.</li>
            <li>Do not publish confidential data you do not intend to be public.</li>
            <li>Keep your account credentials secure.</li>
            <li>Do not use the platform to misrepresent products or to launder counterfeit goods.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">3. Public verification pages</h2>
          <p className="mt-2">
            Batch information you register, including batch history, is published on
            public verification pages reachable from each batch QR code. The platform
            may suspend or revoke batches that receive substantiated reports of fraud
            or counterfeit activity.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">4. Blockchain anchoring</h2>
          <p className="mt-2">
            Anchoring is optional and, when configured, writes only a cryptographic
            fingerprint to the Arbitrum Sepolia test network. You are responsible for
            any wallet transactions you sign; the platform never requests your private
            key or seed phrase. Anchored transactions cannot be reversed.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">5. No warranty</h2>
          <p className="mt-2">
            The platform is provided &quot;as is&quot;, on a test network, without warranties
            of any kind. It is not a certification body: verification pages reflect
            records submitted by businesses, and scans alone do not guarantee a
            product is genuine.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">6. Limitation of liability</h2>
          <p className="mt-2">
            To the maximum extent permitted by law, the platform operator is not
            liable for indirect or consequential damages arising from use of the
            service, including losses caused by incorrect batch data submitted by
            third parties.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">7. Changes</h2>
          <p className="mt-2">
            These terms may be updated as the platform evolves. Continued use of the
            platform after changes are published constitutes acceptance.
          </p>
        </section>
      </div>
    </div>
  )
}