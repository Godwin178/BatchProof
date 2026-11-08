import Link from 'next/link'
import type { Metadata } from 'next'
import BrandMark from '@/components/brand-mark'

export const metadata: Metadata = {
  title: 'BatchProof — Batch traceability your customers can verify',
}

const features = [
  {
    title: 'Product & batch registration',
    body: 'Register products once, then issue a unique batch ID for every production run with producer, origin, production date, expiry date and a full description.',
  },
  {
    title: 'Unique QR codes',
    body: 'Every batch gets its own QR code linking to a public verification page. Print it on packaging, labels or certificates — customers scan and see the truth.',
  },
  {
    title: 'Verifiable history',
    body: 'Distribution checkpoints, inspection results and status changes build an append-only timeline for each batch, visible to anyone who scans.',
  },
  {
    title: 'On-chain fingerprints',
    body: 'Each batch record is hashed with SHA-256. The hash — never business data — is anchored on the Arbitrum Sepolia test network for tamper-evident timestamps.',
  },
  {
    title: 'Business dashboard',
    body: 'A clean dashboard to manage products, batches, history and your public business profile, with statistics on registration, distribution and anchoring activity.',
  },
  {
    title: 'Public accountability',
    body: 'Consumers and inspectors can flag suspicious batches directly from a verification page. Reports surface in the platform admin area for review.',
  },
]

const industries = [
  { name: 'Food & beverage', detail: 'Provenance from farm to shelf, with expiry visibility on every scan.' },
  { name: 'Pharmaceuticals', detail: 'Batch-level inspection records that regulators and patients can check.' },
  { name: 'Agriculture', detail: 'Origin and harvest data attached to every consignment.' },
  { name: 'Cosmetics', detail: 'Ingredient sourcing and batch integrity, verifiable in one scan.' },
  { name: 'Electronics', detail: 'Component batches traced through assembly and distribution.' },
  { name: 'Luxury goods', detail: 'Authenticity proof that follows the item, not the receipt.' },
]

const steps = [
  {
    number: '1',
    title: 'Register your batches',
    body: 'Create your business profile, add products, and register each production batch with its origin, dates and description. BatchProof computes a SHA-256 fingerprint of every record.',
  },
  {
    number: '2',
    title: 'Print the QR code',
    body: 'Each batch gets a unique QR code pointing to its public verification page. Download it and place it on your packaging.',
  },
  {
    number: '3',
    title: 'Keep the history honest',
    body: 'Log distribution checkpoints, inspections and status changes as the batch moves. Customers scan, see the full story, and verify the fingerprint on-chain.',
  },
]

function FeatureIcon({ path }: { path: string }) {
  return (
    <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path d={path} />
      </svg>
    </span>
  )
}

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-slate-900">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <p className="inline-flex items-center gap-2 rounded-full border border-indigo-400/40 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-200">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" aria-hidden="true" />
            Built on the Arbitrum Sepolia test network
          </p>
          <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Batch traceability your customers can verify in one scan
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-slate-300">
            BatchProof gives every production batch a unique QR code and a public,
            append-only history — origin, production, expiry, distribution and
            inspections — backed by a cryptographic fingerprint anchored on-chain.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/register" className="btn-primary px-6 py-3 text-base">
              Create your business account
            </Link>
            <Link
              href="/verify"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-600 px-6 py-3 text-base font-semibold text-slate-200 transition-colors hover:border-slate-400 hover:text-white"
            >
              Verify a batch
            </Link>
          </div>
          <dl className="mt-12 grid grid-cols-1 gap-6 border-t border-slate-800 pt-8 sm:grid-cols-3">
            <div>
              <dt className="text-sm font-medium text-slate-400">Private by design</dt>
              <dd className="mt-1 text-sm text-slate-300">
                Only SHA-256 fingerprints touch the blockchain. Your business data stays yours.
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-400">Public verification</dt>
              <dd className="mt-1 text-sm text-slate-300">
                No app, no account. A QR scan shows the full batch story to anyone.
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-400">Audit-ready history</dt>
              <dd className="mt-1 text-sm text-slate-300">
                Distribution, inspection and status events in one immutable timeline.
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Everything a traceability program needs
        </h2>
        <p className="mt-3 max-w-2xl text-lg text-slate-600">
          From registering a production run to answering a customer at the shelf —
          BatchProof covers the full loop.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.title} className="card">
              <FeatureIcon path="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              <h3 className="mt-4 text-lg font-semibold text-slate-900">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{feature.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">How it works</h2>
          <ol className="mt-10 grid gap-8 md:grid-cols-3">
            {steps.map((step) => (
              <li key={step.number}>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-lg font-bold text-white">
                  {step.number}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Industries */}
      <section id="industries" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Made for traceable industries</h2>
        <p className="mt-3 max-w-2xl text-lg text-slate-600">
          Wherever a batch matters — food, medicine, components, craft — BatchProof
          turns your records into customer-verifiable proof.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {industries.map((industry) => (
            <div key={industry.name} className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="font-semibold text-slate-900">{industry.name}</h3>
              <p className="mt-1 text-sm text-slate-600">{industry.detail}</p>
            </div>
          ))}
        </div>
      </section>
      {/* BatchProof demos */}
      <section id="demos" className="bg-indigo-50 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-slate-900">
            Explore BatchProof demos
          </h2>
          <p className="mt-3 text-slate-600">
            See how batch traceability and public verification work in practice.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <article className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="text-sm font-semibold text-indigo-600">AFRICA DEMO</p>
              <h3 className="mt-2 text-xl font-bold text-slate-900">
                West African Agro Foods
              </h3>
              <p className="mt-2 text-slate-600">
                Premium Cashew Nuts · Batch BP-AFR-001
              </p>
              <p className="mt-3 text-sm text-slate-500">
                Example batch showing product origin, dates and verification history.
              </p>
              <a href="https://batchproof-demo-godwin178.vercel.app/africa"
                className="mt-5 inline-block font-semibold text-indigo-600">
                Explore Africa demo →
              </a>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="text-sm font-semibold text-indigo-600">EUROPE DEMO</p>
              <h3 className="mt-2 text-xl font-bold text-slate-900">
                EuroHarvest Foods
              </h3>
              <p className="mt-2 text-slate-600">
                Extra Virgin Olive Oil · Batch BP-EUR-001
              </p>
              <p className="mt-3 text-sm text-slate-500">
                Example batch demonstrating traceability and public verification.
              </p>
              <a href="https://batchproof-demo-godwin178.vercel.app/europe"
                className="mt-5 inline-block font-semibold text-indigo-600">
                Explore Europe demo →
              </a>
            </article>
          </div>
          <p className="mt-6 text-xs text-slate-500">
            These are simulated demonstration records, not real business records
            or live blockchain transactions.
          </p>
        </div>
      </section>

      {/* Grant funding */}
      <section id="funding" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="rounded-2xl bg-slate-900 p-8 sm:p-10">
          <p className="text-sm font-semibold text-indigo-300">GRANT FUNDING</p>
          <h2 className="mt-3 text-3xl font-bold text-white">
            Help us build more transparent supply chains
          </h2>
          <p className="mt-4 text-4xl font-bold text-white">$16,000</p>
          <p className="mt-3 max-w-2xl text-slate-300">
            BatchProof is seeking $16,000 in grant support to strengthen the
            platform and support early business pilots.
          </p>
          <ul className="mt-6 list-disc space-y-2 pl-5 text-sm text-slate-300">
            <li>Product development and new features</li>
            <li>Security testing and platform reliability</li>
            <li>Hosting and technical infrastructure</li>
            <li>Business pilot onboarding and support</li>
            <li>Documentation, education and ecosystem outreach</li>
          </ul>
          <a href="mailto:okhikugodwin123@gmail.com?subject=BatchProof%20Grant%20Funding"
            className="mt-8 inline-block rounded-lg bg-white px-6 py-3 font-semibold text-indigo-700">
            Discuss grant support
          </a>
        </div>
      </section>

      {/* Support BatchProof */}
      <section id="support" className="bg-indigo-50 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-bold text-slate-900">
            Support BatchProof
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-600">
            We welcome businesses interested in pilot testing, grant partners,
            sponsors and technology ecosystem collaborators.
          </p>
          <a href="mailto:okhikugodwin123@gmail.com?subject=Support%20BatchProof"
            className="mt-7 inline-block rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white">
            Contact the BatchProof team
          </a>
        </div>
      </section>
      {/* Blockchain note */}
      <section className="bg-slate-900 py-16 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Trust, without leaking your data
            </h2>
            <p className="mt-4 text-slate-300">
              BatchProof stores a SHA-256 fingerprint of each batch record on the
              Arbitrum Sepolia test network. The chain proves a record existed,
              unchanged, at a point in time — while the record itself, and all of
              your business information, stays in your own controlled database.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-slate-300">
              <li className="flex gap-2">
                <span className="text-indigo-400" aria-hidden="true">✓</span>
                Anchoring is append-only: fingerprints can never be overwritten.
              </li>
              <li className="flex gap-2">
                <span className="text-indigo-400" aria-hidden="true">✓</span>
                OpenZeppelin access control limits who can anchor.
              </li>
              <li className="flex gap-2">
                <span className="text-indigo-400" aria-hidden="true">✓</span>
                Testnet evaluation — anchoring stays disabled until you configure it.
              </li>
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-800/60 p-6 font-mono text-xs leading-relaxed text-slate-300">
            <p className="text-slate-500">// what a batch record looks like off-chain</p>
            <p className="mt-2">
              {'{'}
              <br />
              &nbsp;&nbsp;batch_code: <span className="text-emerald-400">&quot;BATCH-2024-0041&quot;</span>,
              <br />
              &nbsp;&nbsp;producer: <span className="text-emerald-400">&quot;…&quot;</span>,
              &nbsp;origin: <span className="text-emerald-400">&quot;…&quot;</span>,
              <br />
              &nbsp;&nbsp;production_date: <span className="text-emerald-400">&quot;…&quot;</span>,
              &nbsp;expiry_date: <span className="text-emerald-400">&quot;…&quot;</span>,
              <br />
              {'}'}
            </p>
            <p className="mt-4 text-slate-500">// what goes on-chain</p>
            <p className="mt-2">
              anchorBatch(
              <span className="text-amber-300">
                0x9f2c…a41e
              </span>
              ) <span className="text-slate-500">// 32 bytes, nothing else</span>
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="rounded-3xl bg-indigo-600 px-6 py-12 text-center sm:px-12">
          <BrandMark className="mx-auto h-12 w-12" />
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white">
            Give every batch a verifiable story
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-indigo-100">
            Create a free business account, register your first batch, and print
            your first QR code in minutes.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-base font-semibold text-indigo-700 transition-colors hover:bg-indigo-50"
            >
              Get started free
            </Link>
            <Link
              href="/verify"
              className="inline-flex items-center justify-center rounded-lg border border-indigo-300 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-indigo-500"
            >
              Verify a batch
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}