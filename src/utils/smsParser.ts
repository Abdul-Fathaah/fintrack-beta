export interface ParsedSms {
  amount: number | '';
  text: string;
  type: 'income' | 'expense' | 'investment';
}

export function parseSmsTransaction(smsInput: string): ParsedSms {
  // Handle empty input
  if (!smsInput || smsInput.trim() === '') {
    return { amount: '', text: '', type: 'expense' };
  }

  const input = smsInput.trim();

  // 1. Improved Amount Regex (handles more formats)
  const amountRegex = /(?:rs\.?|inr|₹|\$)\s*([\d,]+(?:\.\d{1,2})?)/i;
  const amountMatch = input.match(amountRegex);
  let amount: number | '' = '';
  if (amountMatch) {
    amount = parseFloat(amountMatch[1].replace(/,/g, ''));
  }

  // 2. Enhanced Type Detection
  const lower = input.toLowerCase();
  let type: 'income' | 'expense' | 'investment' = 'expense';

  if (/(credited|received|deposited|refunded|reversed|cashback|bonus|salary|interest)/i.test(lower)) {
    type = 'income';
  } else if (/(debited|spent|paid|sent|withdrawn|purchase|deducted|txn of|atm|pos)/i.test(lower)) {
    type = 'expense';
  } else if (/(invested|sip|mutual fund|zerodha|groww|upstox|angel|coin|shares|stocks)/i.test(lower)) {
    type = 'investment';
  }

  // 3. Better Merchant Extraction with multiple fallback patterns
  let text = 'SMS Transaction';

  // Pattern 1: "at/to/from [merchant]"
  const merchantPatterns = [
    /(?:at|to|from|for|atm|pos)\s+([^0-9@#$%^&*()]+?)(?:\s+(?:on|via|ref|rs|inr|₹|\$|id|txn|amount)|$)/i,
    // Pattern 2: "credited/debited with [amount] at [merchant]"
    /(?:credited|debited).*?with\s+[\d,.]+\s+(?:at|for|to|from)\s+([^0-9@#$%^&*()]+?)(?:\s+(?:on|via|ref|rs|inr|₹|\$|id|txn|amount)|$)/i,
    // Pattern 3: UPI style "UPI/CR/DR..."
    /upi\/(?:cr|dr)\/\d+\/([a-zA-Z0-9.\-_@\s]+?)(?:\s|$)/i
  ];

  for (const pattern of merchantPatterns) {
    const match = input.match(pattern);
    if (match && match[1]) {
      const candidate = match[1].trim();
      // Clean up common noise words
      const cleaned = candidate
        .replace(/\b(?:the|your|card|bank|account|ac|a\/c|inr|rs|upi|id|txn|amount|rs\.?|inr|₹|\$)\b/gi, '')
        .trim();

      if (cleaned.length > 1) {
        text = cleaned.replace(/[_-]/g, ' ').replace(/\s+/g, ' ').trim();
        break;
      }
    }
  }

  // 4. Fallback: Extract first meaningful phrase if no pattern matched
  if (text === 'SMS Transaction' && input.length > 10) {
    // Try to get first 2-3 words after amount/currency indicators
    const words = input.split(/\s+/);
    const meaningfulWords = words.filter(w =>
      !/^(rs\.?|inr|₹|\$|credited|debited|txn|id|amount|on|at|to|from|via|ref)$/i.test(w) &&
      w.length > 1
    );

    if (meaningfulWords.length >= 2) {
      text = meaningfulWords.slice(0, 3).join(' ');
    } else if (meaningfulWords.length === 1) {
      text = meaningfulWords[0];
    }
  }

  return {
    amount,
    text: text || 'SMS Transaction',
    type,
  };
}
