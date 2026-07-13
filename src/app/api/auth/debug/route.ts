import { NextResponse } from 'next/server'

// Diagnostic endpoint to help debug Google OAuth issues
export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const nextauthUrl = process.env.NEXTAUTH_URL

  const config = {
    googleConfigured: !!(clientId && clientSecret),
    clientIdPresent: !!clientId,
    clientIdValue: clientId ? `${clientId.slice(0, 20)}...${clientId.slice(-20)}` : null,
    clientIdLength: clientId?.length || 0,
    clientSecretPresent: !!clientSecret,
    clientSecretLength: clientSecret?.length || 0,
    nextauthUrl: nextauthUrl || 'http://localhost:3000',
    expectedRedirectUri: `${nextauthUrl || 'http://localhost:3000'}/api/auth/callback/google`,
    callbackUrls: {
      signin: `${nextauthUrl || 'http://localhost:3000'}/api/auth/signin/google`,
      callback: `${nextauthUrl || 'http://localhost:3000'}/api/auth/callback/google`,
    },
  }

  return NextResponse.json(config)
}
