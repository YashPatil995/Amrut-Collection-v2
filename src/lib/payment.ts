// Amrut Collection — Payment Configuration
// UPI details for receiving payments directly to the owner's account

export const PAYMENT_CONFIG = {
  // UPI ID for receiving payments
  upiId: '7666891772@omni',
  // Payee name (shows in UPI app)
  payeeName: 'Yash Patil',
  // Note prefix for UPI transactions
  notePrefix: 'AMRUT',
  // Store info
  storeName: 'Amrut Collection',
}

/**
 * Generate a UPI deep link for payment.
 * Format: upi://pay?pa=PAYEE_VPA&pn=PAYEE_NAME&am=AMOUNT&cu=INR&tn=NOTE&mc=MERCHANT_CODE
 * This link opens the user's UPI app (GPay, PhonePe, Paytm) with payment pre-filled.
 */
export function generateUpiLink(amount: number, orderNo: string): string {
  const params = new URLSearchParams({
    pa: PAYMENT_CONFIG.upiId,
    pn: PAYMENT_CONFIG.payeeName,
    am: amount.toFixed(2),
    cu: 'INR',
    tn: `${PAYMENT_CONFIG.notePrefix} Order ${orderNo}`,
  })
  return `upi://pay?${params.toString()}`
}

/**
 * Generate a UPI payment string for QR codes.
 * Same as the deep link — scanning the QR opens the UPI app.
 */
export function generateUpiQrData(amount: number, orderNo: string): string {
  return generateUpiLink(amount, orderNo)
}
