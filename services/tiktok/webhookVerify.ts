export const verifyWebhookSignature = (
  _signature: string,
  _payload: string,
  _secret: string
): boolean => {
  throw new Error('Not implemented: TikTok webhook signature verification.');
};
