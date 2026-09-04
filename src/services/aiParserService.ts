export interface DetectedTransaction {
  id: string;
  amount: number;
  text: string;
  type: 'income' | 'expense' | 'investment';
  category: string;
  date: string;
  rawText?: string;
  source?: string;
  confidence: number;
}

// Category keyword dictionary for intelligent local classification
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Food: ['swiggy', 'zomato', 'restaurant', 'cafe', 'mcdonalds', 'kfc', 'starbucks', 'dominos', 'pizza', 'burger', 'food', 'dining', 'bake', 'bakery', 'blinkit', 'zepto', 'instamart'],
  Transport: ['uber', 'ola', 'rapido', 'metro', 'fuel', 'petrol', 'diesel', 'hpcl', 'bpcl', 'iocl', 'toll', 'fastag', 'irctc', 'flight', 'indigo', 'railway', 'bus'],
  Shopping: ['amazon', 'flipkart', 'myntra', 'ajio', 'zara', 'h&m', 'reliancedigital', 'croma', 'mall', 'retail', 'store', 'shop'],
  Bills: ['electricity', 'water', 'bescom', 'airtel', 'jio', 'vi', 'broadband', 'wifi', 'gas', 'bill', 'recharge', 'dth', 'tneb'],
  Entertainment: ['netflix', 'spotify', 'hotstar', 'prime', 'pvr', 'inox', 'cinema', 'movie', 'game', 'playstation', 'steam'],
  Health: ['apollo', 'pharmeasy', 'medplus', 'hospital', 'clinic', 'doctor', 'pharmacy', 'dental', '1mg', 'diagnostic'],
  Investment: ['zerodha', 'groww', 'kuvera', 'mutual fund', 'sip', 'etmoney', 'upstox', 'angel', 'coin', 'shares', 'stocks', 'gold', 'crypto'],
  Salary: ['salary', 'payroll', 'wages', 'stipend', 'bonus', 'earnings', 'remuneration'],
};

/**
 * High-speed local deterministic regex parser
 * Covers 30+ Indian and global bank SMS / notification formats
 */
export function parseTransactionLocally(rawText: string): DetectedTransaction | null {
  if (!rawText || rawText.trim().length < 10) return null;

  const text = rawText.trim();

  // 1. Amount Extraction (handles ₹, INR, Rs., USD, etc.)
  const amountRegex = /(?:(?:rs\.?|inr|₹|\$)\s*([\d,]+(?:\.\d{1,2})?)|(?:amount|inr)\s+of\s+([\d,]+(?:\.\d{1,2})?))/i;
  const amountMatch = text.match(amountRegex);

  let amount = 0;
  if (amountMatch) {
    const rawAmountStr = amountMatch[1] || amountMatch[2];
    amount = parseFloat(rawAmountStr.replace(/,/g, ''));
  }

  if (!amount || isNaN(amount) || amount <= 0) {
    return null; // Not a valid financial transaction SMS
  }

  // 2. Type Detection
  let type: 'income' | 'expense' | 'investment' = 'expense';
  const lower = text.toLowerCase();

  if (/(credited|received|deposited|refunded|reversed|cashback|bonus|salary)/i.test(lower)) {
    type = 'income';
  } else if (/(invested|sip\s*(?:debited|processed)|mutual fund|zerodha|groww)/i.test(lower)) {
    type = 'investment';
  } else if (/(debited|spent|paid|sent|withdrawn|purchase|deducted|txn of)/i.test(lower)) {
    type = 'expense';
  }

  // 3. Merchant / Recipient Extraction
  let merchant = 'Unknown Merchant';
  const merchantPatterns = [
    /(?:at|to|info\/|vpa\s+|trf to\s+)\s*([a-zA-Z0-9.\-_@\s]{2,25}?)(?:\s+(?:on|using|via|through|ref|bal|avl|effective|ending)|[.,;]|$)/i,
    /(?:paid to|transferred to|spent at)\s+([a-zA-Z0-9.\-_@\s]{2,25}?)(?:\s+(?:on|via|ref)|[.,;]|$)/i,
    /(?:upi\/(?:cr|dr)\/|upi\/)\d+\/([a-zA-Z0-9.\-_]+)/i,
  ];

  for (const pattern of merchantPatterns) {
    const match = text.match(pattern);
    if (match && match[1] && match[1].trim().length > 1) {
      const candidate = match[1].trim();
      // Filter out generic filler words
      if (!/^(the|your|card|bank|account|ac|a\/c|inr|rs|upi)$/i.test(candidate)) {
        merchant = candidate.replace(/[_-]/g, ' ');
        break;
      }
    }
  }

  // If merchant is still generic, infer from well-known brand names
  for (const keywords of Object.values(CATEGORY_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        if (merchant === 'Unknown Merchant') {
          merchant = kw.charAt(0).toUpperCase() + kw.slice(1);
        }
        break;
      }
    }
  }

  // 4. Category Classification
  let category = 'Other';
  if (type === 'income') {
    category = lower.includes('salary') ? 'Salary' : 'Other';
  } else if (type === 'investment') {
    category = 'Investment';
  } else {
    for (const [catName, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (keywords.some((kw) => lower.includes(kw))) {
        category = catName;
        break;
      }
    }
    if (category === 'Other') {
      if (/bill|electricity|recharge|dth|broadband|wifi/i.test(lower)) category = 'Bills';
      else if (/fuel|petrol|diesel|ride|cab/i.test(lower)) category = 'Transport';
      else if (/grocer|mart|supermarket/i.test(lower)) category = 'Food';
    }
  }

  // 5. Source / Bank detection
  let source = 'Bank Notification';
  const bankMatch = text.match(/(hdfc|sbi|icici|axis|kotak|pnb|bob|indusind|yes bank|idfc|paytm|phonepe|gpay)/i);
  if (bankMatch) {
    source = `${bankMatch[1].toUpperCase()} Alert`;
  }

  return {
    id: crypto.randomUUID(),
    amount,
    text: merchant,
    type,
    category,
    date: new Date().toISOString().split('T')[0],
    rawText,
    source,
    confidence: 0.9,
  };
}

/**
 * Free Open-Source LLM Parser (Groq or OpenRouter Llama 3)
 * Calls open-source Meta Llama 3 models if an API key is configured
 */
export async function parseTransactionWithOpenSourceLLM(
  rawText: string,
  apiKey?: string,
  provider: 'groq' | 'openrouter' = 'groq'
): Promise<DetectedTransaction | null> {
  const localResult = parseTransactionLocally(rawText);

  // If no API key is provided, use the high-accuracy local parser directly
  if (!apiKey) {
    return localResult;
  }

  const endpoint =
    provider === 'groq'
      ? 'https://api.groq.com/openai/v1/chat/completions'
      : 'https://openrouter.ai/api/v1/chat/completions';

  const model =
    provider === 'groq'
      ? 'llama-3.3-70b-versatile'
      : 'meta-llama/llama-3.1-8b-instruct:free';

  const prompt = `You are an expert financial transaction parser. Extract details from this bank notification SMS.
Return ONLY valid JSON matching this exact schema, without markdown blocks or explanation:
{
  "amount": number,
  "merchant": "Clean merchant or recipient name",
  "type": "expense" | "income" | "investment",
  "category": "Food" | "Transport" | "Shopping" | "Bills" | "Entertainment" | "Health" | "Investment" | "Salary" | "Other",
  "source": "Bank or app name"
}

SMS text:
"""
${rawText}
"""`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'You are a precise JSON-only financial data extractor.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      console.warn('Open-source LLM returned error, falling back to local parser:', await response.text());
      return localResult;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return localResult;

    const parsed = JSON.parse(content);

// Validate required fields
    if (!parsed.amount || isNaN(Number(parsed.amount))) {
      console.warn('LLM returned invalid amount, falling back to local parser');
      return localResult;
    }

    return {
      id: crypto.randomUUID(),
      amount: Number(parsed.amount),
      text: parsed.merchant || localResult?.text || 'Transaction',
      type: (parsed.type === 'income' || parsed.type === 'expense' || parsed.type === 'investment')
            ? parsed.type
            : localResult?.type || 'expense',
      category: (['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Investment', 'Salary', 'Other'].includes(parsed.category))
              ? parsed.category
              : localResult?.category || 'Other',
      date: new Date().toISOString().split('T')[0],
      rawText,
      source: parsed.source || localResult?.source || 'Bank Alert',
      confidence: 0.98,
    };
  } catch (error) {
    console.error('Failed calling open-source LLM, falling back:', error);
    return localResult;
  }
}
