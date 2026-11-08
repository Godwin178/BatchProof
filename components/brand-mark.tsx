export default function BrandMark({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="7" fill="#4f46e5" />
      <path d="M16 6l8 4v7c0 5-3.4 8-8 9-4.6-1-8-4-8-9v-7l8-4z" fill="#ffffff" />
      <path
        d="M12.5 16l2.5 2.5 4.5-4.5"
        stroke="#4f46e5"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
