/** Country code + national number; non-digits are stripped. */
const DEFAULT_WHATSAPP_DIGITS = "+917003827813";

/** `wa.me` URL or `null` if the number is too short to be valid. */
export function getWhatsAppHref(): string | null {
  const digits = (
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? DEFAULT_WHATSAPP_DIGITS
  ).replace(/\D/g, "");
  return digits.length >= 10 ? `https://wa.me/${digits}` : null;
}
