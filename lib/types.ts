export type UserRole = 'user' | 'admin'

export type BatchStatus =
  | 'registered'
  | 'in_distribution'
  | 'delivered'
  | 'recalled'
  | 'revoked'

export function isBatchStatus(value: unknown): value is BatchStatus {
  return (
    typeof value === 'string' &&
    ['registered', 'in_distribution', 'delivered', 'recalled', 'revoked'].includes(value)
  )
}

export const OWNER_STATUSES: BatchStatus[] = [
  'registered',
  'in_distribution',
  'delivered',
  'recalled',
]

export type EventType = 'registered' | 'distribution' | 'inspection' | 'status_update'

export interface Profile {
  id: string
  role: UserRole
  business_name: string | null
  contact_email: string | null
  industry: string | null
  website: string | null
  description: string | null
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  owner_id: string
  name: string
  sku: string
  category: string | null
  description: string | null
  created_at: string
}

export interface Batch {
  id: string
  batch_code: string
  owner_id: string
  product_id: string
  producer_name: string
  origin: string
  production_date: string
  expiry_date: string
  description: string | null
  status: BatchStatus
  data_hash: string
  anchor_tx_hash: string | null
  anchored_at: string | null
  created_at: string
  updated_at: string
}

export interface BatchWithProduct extends Batch {
  products: Pick<Product, 'name' | 'sku' | 'category'> | null
}

export interface BatchEvent {
  id: string
  batch_id: string
  event_type: EventType
  status: string | null
  location: string | null
  result: string | null
  notes: string | null
  created_by: string | null
  created_at: string
}

export interface Report {
  id: string
  batch_code: string
  reason: string
  details: string | null
  reporter_contact: string | null
  status: 'open' | 'reviewed' | 'resolved'
  reviewed_at: string | null
  created_at: string
}

export interface EventWithBatch extends BatchEvent {
  batches: { id: string; batch_code: string } | null
}
  
