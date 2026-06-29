export interface Transaction {
  id: number;
  amount: number;
  text: string;
  type: 'income' | 'expense' | 'investment';
  category: string;
  date: string;
}

export interface Obligation {
  id: string | number;
  label: string;
  amount: number;
  isRecurring: boolean;
}

export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
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
