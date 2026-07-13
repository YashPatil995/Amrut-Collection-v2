import { NextResponse } from 'next/server'
import { otpStore } from '../send/route'

export async function POST(req: Request) {
  try {
    const { identifier, channel, code } = await req.json()
    if (!identifier || !code) return NextResponse.json({ error: 'Identifier and code required' }, { status: 400 })

    const key = `${channel}:${identifier}`
    const entry = otpStore.get(key)

    if (!entry) {
      return NextResponse.json({ error: 'OTP expired or not requested. Please request a new OTP.' }, { status: 400 })
    }
    if (Date.now() > entry.expires) {
      otpStore.delete(key)
      return NextResponse.json({ error: 'OTP expired. Please request a new OTP.' }, { status: 400 })
    }
    if (entry.attempts >= 5) {
      otpStore.delete(key)
      return NextResponse.json({ error: 'Too many attempts. Please request a new OTP.' }, { status: 400 })
    }

    entry.attempts++

    if (entry.code !== code) {
      const remaining = 5 - entry.attempts
      return NextResponse.json({ error: `Invalid OTP. ${remaining} attempt(s) left.` }, { status: 400 })
    }

    // Success — clean up
    otpStore.delete(key)
    return NextResponse.json({ success: true, verified: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
