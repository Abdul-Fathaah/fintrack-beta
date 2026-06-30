export interface Transaction {
  id: string;
  user_id?: string;
  amount: number;
  text: string;
  type: 'income' | 'expense' | 'investment';
  category: string;
  date: string;
}

export interface Obligation {
  id: string;
  user_id?: string;
  label: string;
  amount: number;
  isRecurring: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  joined?: string;
}

export interface UserProfile {
  name: string;
  email?: string;
  monthlySavingsTarget: number;
}

export interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}
