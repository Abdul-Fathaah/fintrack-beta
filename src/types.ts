export interface Transaction {
  id: string;
  user_id?: string;
  amount: number;
  text: string;
  type: 'income' | 'expense' | 'investment';
  category: string;
  date: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  joined?: string;
}
