
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ADD_ONS, AddOnId } from '@/app/constants/pricing'

/**
 * POST /api/billing/purchase-addon
 * Purchases an add-on using the company's wallet balance.
 * 
 * @param req - NextRequest object containing companyId and addonId
 * @returns JSON response with success message or error
 */
export async function POST(req: NextRequest) {
  try {
    const { companyId, addonId } = await req.json()
    const supabase = await createClient()

    // Validate Addon
    const addon = ADD_ONS[addonId as AddOnId]
    if (!addon) {
      return new NextResponse('Invalid addon', { status: 400 })
    }

    // Check Wallet Balance
    const { data: wallet } = await supabase
      .from('wallets')
      .select('id, balance')
      .eq('company_id', companyId)
      .single()

    const costCents = addon.price * 100

    if (!wallet || wallet.balance < costCents) {
      return new NextResponse('Insufficient funds. Please Top Up first.', { status: 402 })
    }

    // Deduct from Wallet
    const { error: rpcError } = await supabase.rpc('increment_wallet_balance', {
      wallet_id: wallet.id,
      amount: -costCents
    })

    if (rpcError) throw rpcError

    // Record Transaction
    await supabase.from('wallet_transactions').insert({
      wallet_id: wallet.id,
      amount: -costCents,
      type: 'addon_purchase',
      description: `Purchased Add-on: ${addon.name}`,
    })

    // Insert Addon Record
    const { error: insertError } = await supabase.from('billing_addons').insert({
      company_id: companyId,
      type: addonId,
      quantity: 1,
      cost_cents: costCents,
      status: 'active'
    })

    if (insertError) throw insertError

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Addon purchase error:', error)
    return new NextResponse(error.message || 'Internal Server Error', { status: 500 })
  }
}
