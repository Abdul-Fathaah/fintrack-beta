import { parseSmsTransaction } from './smsParser';

describe('parseSmsTransaction', () => {
  test('handles empty input', () => {
    expect(parseSmsTransaction('')).toEqual({ amount: '', text: '', type: 'expense' });
    expect(parseSmsTransaction(null as any)).toEqual({ amount: '', text: '', type: 'expense' });
    expect(parseSmsTransaction(undefined as any)).toEqual({ amount: '', text: '', type: 'expense' });
  });

  test('parses amount correctly', () => {
    expect(parseSmsTransaction('Rs. 500 debited for Swiggy').amount).toBe(500);
    expect(parseSmsTransaction('INR 1,200.50 credited from Salary').amount).toBe(1200.5);
    expect(parseSmsTransaction('₹75.25 spent at Amazon').amount).toBe(75.25);
    expect(parseSmsTransaction('$100.00 spent at Store').amount).toBe(100);
  });

  test('detects transaction type', () => {
    expect(parseSmsTransaction('Rs. 500 credited from Salary').type).toBe('income');
    expect(parseSmsTransaction('INR 1200 debited for Pizza').type).toBe('expense');
    expect(parseSmsTransaction('₹5000 invested in Mutual Fund').type).toBe('investment');
  });

  test('extracts merchant correctly', () => {
    expect(parseSmsTransaction('Rs. 500 debited for Swiggy on 05/09').text).toBe('Swiggy');
    expect(parseSmsTransaction('INR 1200 credited from Salary to account').text).toBe('Salary');
    expect(parseSmsTransaction('₹75 spent at Amazon.in using card').text).toBe('Amazon in');
    expect(parseSmsTransaction('UPI/CR/1234567890/axisbank/UPI transaction').text).toBe('axisbank');
  });

  test('handles edge cases', () => {
    expect(parseSmsTransaction('Random text without amount').amount).toBe('');
    expect(parseSmsTransaction('Rs. 0 debited for test').amount).toBe(0);
    expect(parseSmsTransaction('').text).toBe('');
  });
});