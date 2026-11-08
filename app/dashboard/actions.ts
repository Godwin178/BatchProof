'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/auth'
import { computeBatchHash } from '@/lib/hash'
import { isBatchStatus, OWNER_STATUSES } from '@/lib/types'

const BATCH_CODE_PATTERN = /^[A-Za-z0-9_-]{4,64}$/

function errorFor(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`)
}

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? '').trim()
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

export async function createProduct(formData: FormData) {
  const user = await requireUser()
  const supabase = createClient()

  const name = text(formData, 'name')
  const sku = text(formData, 'sku').toUpperCase()
  const category = text(formData, 'category')
  const description = text(formData, 'description')

  if (!name || !sku) {
    errorFor('/dashboard/products', 'Product name and SKU are required.')
  }
  if (sku.length > 64) {
    errorFor('/dashboard/products', 'SKU is limited to 64 characters.')
  }

  const { error } = await supabase.from('products').insert({
    owner_id: user.id,
    name,
    sku,
    category: category || null,
    description: description || null,
  })

  if (error) {
    errorFor('/dashboard/products', error.code === '23505'
      ? 'You already have a product with this SKU.'
      : error.message)
  }

  revalidatePath('/dashboard/products')
  revalidatePath('/dashboard')
  redirect('/dashboard/products?saved=1')
}

export async function deleteProduct(formData: FormData) {
  const user = await requireUser()
  const supabase = createClient()
  const productId = text(formData, 'product_id')

  const { data: product } = await supabase
    .from('products')
    .select('id')
    .eq('id', productId)
    .eq('owner_id', user.id)
    .maybeSingle()

  if (!product) {
    errorFor('/dashboard/products', 'Product not found.')
  }

  const { error } = await supabase.from('products').delete().eq('id', productId).eq('owner_id', user.id)
  if (error) {
    errorFor('/dashboard/products', 'This product still has batches attached and cannot be deleted.')
  }

  revalidatePath('/dashboard/products')
  revalidatePath('/dashboard')
  redirect('/dashboard/products?saved=1')
}

// ---------------------------------------------------------------------------
// Batches
// ---------------------------------------------------------------------------

export async function createBatch(formData: FormData) {
  const user = await requireUser()
  const supabase = createClient()

  const batchCode = text(formData, 'batch_code').toUpperCase()
  const productId = text(formData, 'product_id')
  const producerName = text(formData, 'producer_name')
  const origin = text(formData, 'origin')
  const productionDate = text(formData, 'production_date')
  const expiryDate = text(formData, 'expiry_date')
  const description = text(formData, 'description')
  const basePath = '/dashboard/batches/new'

  if (!batchCode || !productId || !producerName || !origin || !productionDate || !expiryDate) {
    errorFor(basePath, 'All fields except the description are required.')
  }
  if (!BATCH_CODE_PATTERN.test(batchCode)) {
    errorFor(basePath, 'Batch ID must be 4–64 characters: letters, numbers, hyphens or underscores.')
  }
  if (new Date(expiryDate) <= new Date(productionDate)) {
    errorFor(basePath, 'Expiry date must be after the production date.')
  }

  const { data: product } = await supabase
    .from('products')
    .select('id')
    .eq('id', productId)
    .eq('owner_id', user.id)
    .maybeSingle()

  if (!product) {
    errorFor(basePath, 'Select one of your own products.')
  }

  const { data: existing } = await supabase
    .from('batches')
    .select('id')
    .eq('batch_code', batchCode)
    .maybeSingle()

  if (existing) {
    errorFor(basePath, 'This batch ID is already registered.')
  }

  const dataHash = computeBatchHash({
    batchCode,
    producerName,
    origin,
    productionDate,
    expiryDate,
    description,
  })

  const { data: inserted, error } = await supabase
    .from('batches')
    .insert({
      batch_code: batchCode,
      owner_id: user.id,
      product_id: productId,
      producer_name: producerName,
      origin,
      production_date: productionDate,
      expiry_date: expiryDate,
      description: description || null,
      status: 'registered',
      data_hash: dataHash,
    })
    .select('id')
    .single()

  if (error || !inserted) {
    errorFor(basePath, error?.message ?? 'The batch could not be created.')
  }

  await supabase.from('batch_events').insert({
    batch_id: inserted.id,
    event_type: 'registered',
    notes: 'Batch registered with producer, origin and dates above.',
    created_by: user.id,
  })

  revalidatePath('/dashboard/batches')
  revalidatePath('/dashboard')
  redirect(`/dashboard/batches/${inserted.id}?created=1`)
}

// ---------------------------------------------------------------------------
// Batch events (distribution, inspection, status updates)
// ---------------------------------------------------------------------------

const EVENT_TYPES = ['distribution', 'inspection', 'status_update'] as const

export async function addBatchEvent(formData: FormData) {
  const user = await requireUser()
  const supabase = createClient()

  const batchId = text(formData, 'batch_id')
  const eventType = text(formData, 'event_type')
  const location = text(formData, 'location')
  const result = text(formData, 'result')
  const newStatus = text(formData, 'new_status')
  const notes = text(formData, 'notes')
  const basePath = `/dashboard/batches/${batchId}`

  const { data: batch } = await supabase
    .from('batches')
    .select('id, status, batch_code')
    .eq('id', batchId)
    .eq('owner_id', user.id)
    .maybeSingle()

  if (!batch) {
    errorFor('/dashboard/batches', 'Batch not found.')
  }

  if (!(EVENT_TYPES as readonly string[]).includes(eventType)) {
    errorFor(basePath, 'Choose a valid event type.')
  }
  if (eventType === 'status_update') {
    if (!isBatchStatus(newStatus) || !OWNER_STATUSES.includes(newStatus)) {
      errorFor(basePath, 'Choose a valid status.')
    }
    if (newStatus === batch.status) {
      errorFor(basePath, 'The batch is already in this status.')
    }
    if (!notes) {
      errorFor(basePath, 'A status change requires a note explaining why.')
    }
  }
  if (result && !['passed', 'failed'].includes(result)) {
    errorFor(basePath, 'Inspection result must be passed or failed.')
  }
  if (eventType === 'distribution' && !location) {
    errorFor(basePath, 'A distribution event requires a location.')
  }

  if (eventType === 'status_update') {
    const { error: statusError } = await supabase
      .from('batches')
      .update({ status: newStatus })
      .eq('id', batchId)
      .eq('owner_id', user.id)
    if (statusError) {
      errorFor(basePath, statusError.message)
    }
  }

  const { error } = await supabase.from('batch_events').insert({
    batch_id: batchId,
    event_type: eventType,
    status: eventType === 'status_update' ? newStatus : null,
    location: location || null,
    result: result || null,
    notes: notes || null,
    created_by: user.id,
  })

  if (error) {
    errorFor(basePath, error.message)
  }

  revalidatePath(basePath)
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/batches')
  redirect(`${basePath}?event=saved`)
}

// ---------------------------------------------------------------------------
// Business profile
// ---------------------------------------------------------------------------

export async function updateProfile(formData: FormData) {
  const user = await requireUser()
  const supabase = createClient()

  const businessName = text(formData, 'business_name')
  const industry = text(formData, 'industry')
  const website = text(formData, 'website')
  const description = text(formData, 'description')

  if (!businessName) {
    errorFor('/dashboard/profile', 'A business name is required.')
  }
  if (website && !/^https?:\/\//i.test(website)) {
    errorFor('/dashboard/profile', 'Website must start with http:// or https://')
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      business_name: businessName,
      industry: industry || null,
      website: website || null,
      description: description || null,
    })
    .eq('id', user.id)

  if (error) {
    errorFor('/dashboard/profile', error.message)
  }

  revalidatePath('/dashboard/profile')
  revalidatePath('/dashboard')
  redirect('/dashboard/profile?saved=1')
}

// ---------------------------------------------------------------------------
// Blockchain anchoring (called from the client anchor button)
// ---------------------------------------------------------------------------

export async function recordAnchor(
  batchId: string,
  txHash: string,
): Promise<{ ok: boolean; error?: string }> {
  const user = await requireUser()
  const supabase = createClient()

  if (!/^0x[0-9a-fA-F]{64}$/.test(txHash)) {
    return { ok: false, error: 'The transaction hash looks invalid; nothing was recorded.' }
  }

  const { error } = await supabase
    .from('batches')
    .update({ anchor_tx_hash: txHash, anchored_at: new Date().toISOString() })
    .eq('id', batchId)
    .eq('owner_id', user.id)

  if (error) {
    return { ok: false, error: error.message }
  }

  revalidatePath(`/dashboard/batches/${batchId}`)
  return { ok: true }
}