/**
 * Ô nhập tiền VND: chỉ lấy chữ số (bỏ dấu chấm / khoảng khi user paste hoặc có format cũ).
 */
export function digitsFromMoneyInput(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * Hiển thị trong input: "100000" → "100.000" (locale vi-VN, không hậu tố "đ").
 */
export function formatMoneyInputDisplay(digits: string): string {
  if (!digits) return '';
  const n = Number(digits);
  if (!Number.isFinite(n)) return '';
  return n.toLocaleString('vi-VN');
}
