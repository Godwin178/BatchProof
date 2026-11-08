import Link from 'next/link'

export default function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-8 md:flex-row md:justify-between">
          <div className="max-w-sm">
            <p className="text-lg font-bold tracking-tight text-slate-900">
              Batch<span className="text-indigo-600">Proof</span>
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Batch traceability your customers can verify. QR codes backed by
              tamper-evident batch records and cryptographic fingerprints.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
            <div>
              <p className="font-semibold text-slate-900">Product</p>
              <ul className="mt-3 space-y-2 text-slate-600">
                <li>
                  <Link href="/#features" className="hover:text-slate-900">Features</Link>
                </li>
                <li>
                  <Link href="/#how-it-works" className="hover:text-slate-900">How it works</Link>
                </li>
                <li>
                  <Link href="/verify" className="hover:text-slate-900">Verify a batch</Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-slate-900">Company</p>
              <ul className="mt-3 space-y-2 text-slate-600">
                <li>
                  <Link href="/register" className="hover:text-slate-900">Register</Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-slate-900">Sign in</Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-slate-900">Legal</p>
              <ul className="mt-3 space-y-2 text-slate-600">
                <li>
                  <Link href="/privacy" className="hover:text-slate-900">Privacy policy</Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-slate-900">Terms of service</Link>
                </li>
                <li>
                  <a href="https://github.com" className="hover:text-slate-900">Source</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-100 pt-6 text-xs leading-relaxed text-slate-500">
          <p>
            BatchProof integrates the Arbitrum Sepolia test network for evaluation
            purposes. Only cryptographic batch fingerprints are stored on-chain —
            never private business information.
          </p>
          <p className="mt-2">
            © {new Date().getFullYear()} BatchProof. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
