export function requireStripeSignature(req) {
  const signature = req.headers["stripe-signature"]
  if (!signature) {
    throw new Error("missing stripe signature")
  }
  return signature
}
