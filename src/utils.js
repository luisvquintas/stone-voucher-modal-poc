export const VOUCHER_BRANDS = {
  PLUXEE: 'pluxee',
  VR: 'vr',
  ALELO: 'alelo',
  TICKET: 'ticket',
};

// Mock BIN patterns for detection
export const BIN_PATTERNS = {
  [VOUCHER_BRANDS.PLUXEE]: /^6035/,
  [VOUCHER_BRANDS.VR]: /^5070/,
  [VOUCHER_BRANDS.ALELO]: /^5076/,
  [VOUCHER_BRANDS.TICKET]: /^6060/,
};
