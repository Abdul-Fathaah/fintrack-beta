export interface ParsedSms {
  amount: number | '';
  text: string;
  type: 'income' | 'expense' | 'investment';
}

export function parseSmsTransaction(smsInput: string): ParsedSms {
  // 1. Amount Regex (Look for Rs, INR, ₹ followed by digits)
  const amountRegex = /(?:rs\.?|inr|₹)\s*([\d,]+(?:\.\d{1,2})?)/i;
  const amountMatch = smsInput.match(amountRegex);
  let amount: number | '' = '';
  if (amountMatch) {
    amount = parseFloat(amountMatch[1].replace(/,/g, ''));
  }

  // 2. Type Detection
  let type: 'income' | 'expense' | 'investment' = 'expense';
  if (/(credited|received|deposited|added)/i.test(smsInput)) {
    type = 'income';
  }

  // 3. Merchant/Description (Look for 'at', 'to', 'from')
  const merchantRegex = /(?:at|to|from)\s+([a-zA-Z0-9\s.]+?)(?:\s+(?:on|using|via|through|ref)|$)/i;
  const merchantMatch = smsInput.match(merchantRegex);
  const text = merchantMatch ? merchantMatch[1].trim() : 'SMS Transaction';

  return {
    amount,
    text,
    type,
  };
}
