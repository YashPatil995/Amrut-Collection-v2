import { NextResponse } from 'next/server'

// In-memory OTP store (phone/email => { code, expires, attempts })
// Note: resets on server restart — for production use Redis or DB
const otpStore = new Map<string, { code: string; expires: number; attempts: number }>()

export async function POST(req: Request) {
  try {
    const { identifier, channel } = await req.json()
    if (!identifier) return NextResponse.json({ error: 'Identifier required' }, { status: 400 })

    const key = `${channel}:${identifier}`
    // Rate limit: 1 OTP per 30 seconds per identifier
    const existing = otpStore.get(key)
    if (existing && existing.expires - Date.now() > 270000) {
      return NextResponse.json({ error: 'Please wait 30 seconds before requesting another OTP' }, { status: 429 })
    }

    // Generate real 6-digit OTP
    const code = String(Math.floor(100000 + Math.random() * 900000))
    otpStore.set(key, { code, expires: Date.now() + 300000, attempts: 0 }) // 5 min expiry

    // Try sending real SMS via MSG91 if configured
    const msg91Key = process.env.MSG91_AUTH_KEY
    const msg91Sender = process.env.MSG91_SENDER_ID || 'AMRUTS'
    const msg91Template = process.env.MSG91_TEMPLATE_ID

    let smsSent = false
    let smsError: string | undefined

    if (channel === 'phone' && msg91Key) {
      // Real SMS via MSG91
      try {
        const smsRes = await fetch(`https://control.msg91.com/api/v5/otp`, {
          method: 'POST',
          headers: {
            'authkey': msg91Key,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            template_id: msg91Template,
            mobile: `91${identifier}`,
            otp: code,
            sender: msg91Sender,
          }),
        })
        smsSent = smsRes.ok
        if (!smsSent) smsError = 'MSG91 request failed'
      } catch (e: any) {
        smsError = e.message
      }
    }

    if (channel === 'email' && process.env.RESEND_API_KEY) {
      // Real email via Resend (could be added) — for now, skip
      smsSent = false
    }

    // In dev/preview (no SMS provider), return the code so the UI can display it
    const devMode = !msg91Key
    return NextResponse.json({
      success: true,
      sent: smsSent,
      devCode: devMode ? code : undefined, // only returned when no SMS provider configured
      channel,
      identifier,
      expiresIn: 300,
      smsError,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export { otpStore }
