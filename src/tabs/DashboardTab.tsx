import React, { useMemo, useState } from 'react';
import {
  Plus,
  Wallet,
  Lock,
  Unlock,
  Trash2,
  Check,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Menu,
  Filter,
  PiggyBank
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { Card } from '../components/ui/Card';
import { useTheme } from '../hooks/useTheme';
import { Obligation } from '../types';
import { Transaction } from '../types';
import { UserProfile } from '../types';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#b8e986', '#ff9a76', '#d0bbff', '#fff1b8', '#edea9e'];

interface DashboardTabProps {
  transactions?: Transaction[];
  obligations: Obligation[];
  setObligations: (value: Obligation[] | ((prev: Obligation[]) => Obligation[])) => void;
  userProfile?: UserProfile | null;
}

interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number;
  monthlySavingsTarget: number;
  savingsProgress: number;
}

interface ObligationStats {
  total: number;
  recurring: number;
  nonRecurring: number;
  recurringAmount: number;
  nonRecurringAmount: number;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  transactions = [],
  obligations,
  setObligations,
  userProfile = null
}) => {
  const { isDarkMode } = useTheme();
  const [isEditingObligations, setIsEditingObligations] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'obligations' | 'goals'>('overview');

  // Financial Summary
  const financialSummary = useMemo((): FinancialSummary => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const netSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;
    const monthlySavingsTarget = userProfile?.monthlySavingsTarget || 0;
    const savingsProgress = monthlySavingsTarget > 0
      ? Math.min((netSavings / monthlySavingsTarget) * 100, 100)
      : 0;

    return {
      totalIncome,
      totalExpenses,
      netSavings,
      savingsRate,
      monthlySavingsTarget,
      savingsProgress
    };
  }, [transactions, userProfile]);

  // Obligation Statistics
  const obligationStats = useMemo((): ObligationStats => {
    const total = obligations.reduce((sum, o) => sum + o.amount, 0);
    const recurring = obligations.filter(o => o.isRecurring).length;
    const nonRecurring = obligations.filter(o => !o.isRecurring).length;
    const recurringAmount = obligations
      .filter(o => o.isRecurring)
      .reduce((sum, o) => sum + o.amount, 0);
    const nonRecurringAmount = obligations
      .filter(o => !o.isRecurring)
      .reduce((sum, o) => sum + o.amount, 0);

    return {
      total,
      recurring,
      nonRecurring,
      recurringAmount,
      nonRecurringAmount
    };
  }, [obligations]);

  // Monthly trend for income vs expenses
  const monthlyTrend = useMemo(() => {
    const months: Record<string, { income: number; expense: number }> = {};

    transactions.forEach((t) => {
      const date = new Date(t.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth().toString().padStart(2, '0')}`;

      if (!months[monthKey]) {
        months[monthKey] = { income: 0, expense: 0 };
      }

      if (t.type === 'income') {
        months[monthKey].income += t.amount;
      } else if (t.type === 'expense') {
        months[monthKey].expense += t.amount;
      }
    });

    return Object.entries(months)
      .map(([month, values]) => ({
        month: new Date(`${month}-01`).toLocaleString('default', { month: 'short' }),
        income: values.income,
        expense: values.expense
      }))
      .sort((a, b) => {
        const dateA = new Date(`1 ${a.month}`);
        const dateB = new Date(`1 ${b.month}`);
        return dateA.getTime() - dateB.getTime();
      });
  }, [transactions]);

  // Obligations by amount (for pie chart)
  const obligationsByAmount = useMemo(() => {
    return obligations.map(obligation => ({
      name: obligation.label,
      value: obligation.amount
    }));
  }, [obligations]);

  // Update obligation handler
  const updateObligation = (id: string | number, field: keyof Obligation, value: any) => {
    setObligations((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const toggleRecurring = (id: string | number) => {
    setObligations((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isRecurring: !item.isRecurring } : item))
    );
  };

  const addObligation = () => {
    const newItem: Obligation = { id: crypto.randomUUID(), label: 'New Bill', amount: 0, isRecurring: true };
    setObligations((prev) => [...prev, newItem]);
  };

  const deleteObligation = (id: string | number) => {
    if (confirm('Delete this obligation?')) {
      setObligations((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // Render Financial Overview Tab
  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Financial Health Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Income Card */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-3 rounded-lg bg-green-500/10">
                <DollarSign size={20} className="text-green-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Monthly Income</p>
                <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  ₹{financialSummary.totalIncome.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="text-xs">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                financialSummary.totalIncome > 0
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {financialSummary.totalIncome > 0 ? 'Active' : 'No Data'}
              </span>
            </div>
          </div>
          <div className="h-0.5 bg-gray-200 mb-3"></div>
          <p className="text-sm text-gray-500">
            Total incoming funds for the current month
          </p>
        </Card>

        {/* Expenses Card */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-3 rounded-lg bg-red-500/10">
                <TrendingDown size={20} className="text-red-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Monthly Expenses</p>
                <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  ₹{financialSummary.totalExpenses.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="text-xs">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                financialSummary.totalExpenses > 0
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {financialSummary.totalExpenses > 0 ? 'Tracked' : 'No Data'}
              </span>
            </div>
          </div>
          <div className="h-0.5 bg-gray-200 mb-3"></div>
          <p className="text-sm text-gray-500">
            Total outgoing funds for the current month
          </p>
        </Card>

        {/* Net Savings Card */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-3 rounded-lg bg-blue-500/10">
                <Wallet size={20} className="text-blue-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Net Savings</p>
                <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  ₹{financialSummary.netSavings >= 0
                    ? financialSummary.netSavings.toLocaleString()
                    : `-${Math.abs(financialSummary.netSavings).toLocaleString()}`}
                </p>
              </div>
            </div>
            <div className="text-xs">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                financialSummary.netSavings >= 0
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {financialSummary.netSavings >= 0 ? 'Positive' : 'Negative'} Cash Flow
              </span>
            </div>
          </div>
          <div className="h-0.5 bg-gray-200 mb-3"></div>
          <p className="text-sm text-gray-500">
            Income minus expenses - your available savings
          </p>
        </Card>

        {/* Savings Goal Card */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-3 rounded-lg bg-purple-500/10">
                <PiggyBank size={20} className="text-purple-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Savings Goal</p>
                <p className={`text-xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  ₹{financialSummary.monthlySavingsTarget.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <div className="h-0.5 bg-gray-200 mb-3"></div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
            <div
              className={`h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500 w-${financialSummary.savingsProgress}%`}
            ></div>
          </div>
          <div className="flex justify-between text-sm">
            <span>Saved: ₹{Math.max(financialSummary.netSavings, 0).toLocaleString()}</span>
            <span>{financialSummary.savingsProgress.toFixed(0)}% of goal</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Target: ₹{financialSummary.monthlySavingsTarget.toLocaleString()}/month
          </p>
        </Card>

        {/* Savings Rate Card */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-3 rounded-lg bg-indigo-500/10">
                <TrendingUp size={20} className="text-indigo-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Savings Rate</p>
                <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {financialSummary.savingsRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
          <div className="h-0.5 bg-gray-200 mb-3"></div>
          <p className="text-sm text-gray-500">
            Percentage of income saved after expenses
          </p>
        </Card>

        {/* Obligations Overview Card */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-3 rounded-lg bg-gray-500/10">
                <Lock size={20} className="text-gray-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Monthly Obligations</p>
                <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  ₹{obligationStats.total.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="text-xs">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                obligationStats.total > 0
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {obligationStats.recurring} recurring • {obligationStats.nonRecurring} one-time
              </span>
            </div>
          </div>
          <div className="h-0.5 bg-gray-200 mb-3"></div>
          <p className="text-sm text-gray-500">
            Fixed monthly commitments that affect your safe-to-spend
          </p>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Income vs Expense Trend */}
        <Card className="p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className={isDarkMode ? 'font-semibold text-white' : 'font-semibold text-gray-900'}>
              Income vs Expense Trend
            </h3>
            <div className="flex items-center gap-2 text-sm">
              <button
                onClick={() => {}}
                className="px-2 py-1 rounded text-xs font-medium transition-all duration-200 hover:bg-gray-100"
              >
                <Filter size={16} />
                <span>6M</span>
              </button>
            </div>
          </div>

          {monthlyTrend.length > 0 ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthlyTrend}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor={isDarkMode ? '#4ade80' : '#10b981'} stopOpacity={0.8} />
                      <stop offset="1" stopColor={isDarkMode ? '#4ade80' : '#10b981'} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor={isDarkMode ? '#f87171' : '#ef4444'} stopOpacity={0.8} />
                      <stop offset="1" stopColor={isDarkMode ? '#f87171' : '#ef4444'} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    tick={{
                      fontSize: 12,
                      fill: isDarkMode ? '#ccc' : '#666'
                    }}
                  />
                  <YAxis
                    tick={{
                      fontSize: 12,
                      fill: isDarkMode ? '#ccc' : '#666'
                    }}
                  />
                  <YAxis
                    orientation="right"
                    tick={{
                      fontSize: 12,
                      fill: isDarkMode ? '#ccc' : '#666'
                    }}
                  />
                  <Tooltip
                    formatter={(value: any) => `₹${Number(value || 0).toLocaleString()}`}
                  />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    wrapperStyle={{
                      left: 0,
                      top: -10
                    }}
                  >
                    <Legend
                      verticalAlign="top"
                      height={36}
                    >
                      <Legend
                        wrapperStyle={{
                          left: 0,
                          top: -10
                        }}
                      />
                    </Legend>
                  </Legend>
                  <Line
                    type="monotone"
                    dataKey="income"
                    stroke={isDarkMode ? '#4ade80' : '#10b981'}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                    isAnimationActive={false}
                  >
                    {monthlyTrend.map((entry, index) => (
                      <Dot key={'income-' + index} cx={entry.month} cy={entry.income} r={4} fill={isDarkMode ? '#4ade80' : '#10b981'} />
                    ))}
                  </Line>
                  <Line
                    type="monotone"
                    dataKey="expense"
                    stroke={isDarkMode ? '#f87171' : '#ef4444'}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                    isAnimationActive={false}
                  >
                    {monthlyTrend.map((entry, index) => (
                      <Dot key={'expense-' + index} cx={entry.month} cy={entry.expense} r={4} fill={isDarkMode ? '#f87171' : '#ef4444'} />
                    ))}
                  </Line>
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-center py-8 text-xs opacity-60">
              No transaction data available for trend analysis.
            </p>
          )}
        </Card>

        {/* Obligations Breakdown */}
        <Card className="p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className={isDarkMode ? 'font-semibold text-white' : 'font-semibold text-gray-900'}>
              Obligations Breakdown
            </h3>
          </div>

          {obligationsByAmount.length > 0 ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={obligationsByAmount}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    labelLine={false}
                    label={({ name, value, percentage }: any) =>
                      name + '\n₹' + value.toLocaleString() + '\n' + percentage.toFixed(1) + '%'
                    }
                  >
                    {obligationsByAmount.map((_, index) => (
                      <Cell key={'cell-' + index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => '₹' + Number(value || 0).toLocaleString()}
                  />
                  <Legend
                    verticalAlign="bottom"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-center py-8 text-xs opacity-60">
              No obligations to display.
            </p>
          )}
        </Card>
      </div>

      {/* Insights & Recommendations */}
      <Card className="p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className={isDarkMode ? 'font-semibold text-white' : 'font-semibold text-gray-900'}>
            Financial Insights
          </h3>
          <button
            onClick={() => {}}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-gray-100"
          >
            <Menu size={16} />
            <span>More Insights</span>
          </button>
        </div>

        <div className="space-y-4">
          {/* Cash Flow Insight */}
          <div className="flex items-start gap-3 p-4 rounded-lg border">
            <div className="flex-shrink-0">
              <div className="p-2 rounded-lg bg-green-500/10">
                <TrendingUp size={16} className="text-green-400" />
              </div>
            </div>
            <div className="flex-1">
              <h4 className={`font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Cash Flow Health
              </h4>
              <p className={`text-sm ${isDarkMode ? 'text-neutral-300' : 'text-gray-600'}`}>
                Your net cash flow is
                <span className="font-semibold">
                  {financialSummary.netSavings >= 0
                    ? 'positive'
                    : 'negative'}
                </span> (₹{Math.abs(financialSummary.netSavings).toLocaleString()}),
                meaning you
                <span className="font-semibold">
                  {financialSummary.netSavings >= 0
                    ? 'are saving'
                    : 'are overspending'}
                </span> each month.
              </p>
            </div>
          </div>

          {/* Savings Progress Insight */}
          <div className="flex items-start gap-3 p-4 rounded-lg border">
            <div className="flex-shrink-0">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <PiggyBank size={16} className="text-purple-400" />
              </div>
            </div>
            <div className="flex-1">
              <h4 className={`font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Savings Goal Progress
              </h4>
              <p className={`text-sm ${isDarkMode ? 'text-neutral-300' : 'text-gray-600'}`}>
                You've saved
                <span className="font-semibold">
                  ₹{Math.max(financialSummary.netSavings, 0).toLocaleString()}
                </span> this month toward your
                <span className="font-semibold">
                  ₹{financialSummary.monthlySavingsTarget.toLocaleString()}
                </span> monthly goal.
                {financialSummary.monthlySavingsTarget > 0
                  ? `You're at ${financialSummary.savingsProgress.toFixed(0)}% of your target.`
                  : 'Set a savings goal in Settings to track progress.'}
              </p>
            </div>
          </div>

          {/* Obligations Burden Insight */}
          <div className="flex items-start gap-3 p-4 rounded-lg border">
            <div className="flex-shrink-0">
              <div className="p-2 rounded-lg bg-red-500/10">
                <Wallet size={16} className="text-red-400" />
              </div>
            </div>
            <div className="flex-1">
              <h4 className={`font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Obligations Burden
              </h4>
              <p className={`text-sm ${isDarkMode ? 'text-neutral-300' : 'text-gray-600'}`}>
                Your monthly obligations total
                <span className="font-semibold">
                  ₹{obligationStats.total.toLocaleString()}
                </span>, which is
                <span className="font-semibold">
                  {(obligationStats.total / financialSummary.totalIncome * 100).toFixed(1)}%
                </span> of your income.
                {financialSummary.totalIncome > 0
                  ? obligationStats.total / financialSummary.totalIncome > 0.5
                    ? 'This is a high burden - consider reducing fixed costs.'
                    : obligationStats.total / financialSummary.totalIncome > 0.3
                      ? 'This is a moderate burden.'
                      : 'This is a manageable burden.'
                  : 'No income data to calculate burden ratio.'
                }
              </p>
            </div>
          </div>

          {/* Savings Rate Insight */}
          <div className="flex items-start gap-3 p-4 rounded-lg border">
            <div className="flex-shrink-0">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <TrendingUp size={16} className="text-blue-400" />
              </div>
            </div>
            <div className="flex-1">
              <h4 className={`font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Savings Rate Analysis
              </h4>
              <p className={`text-sm ${isDarkMode ? 'text-neutral-300' : 'text-gray-600'}`}>
                Your savings rate is
                <span className="font-semibold">
                  {financialSummary.savingsRate.toFixed(1)}%
                </span>.
                {financialSummary.savingsRate >= 20
                  ? 'Excellent! You\'re saving more than the recommended 20%.'
                  : financialSummary.savingsRate >= 10
                    ? 'Good! You\'re saving more than the minimum recommended 10%.'
                    : financialSummary.savingsRate > 0
                      ? 'You\'re saving, but consider increasing to reach 10-20%.'
                      : 'You\'re not saving anything - consider creating a budget to start saving.'}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  // Render Obligations Management Tab
  const renderObligationsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Manage Obligations
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEditingObligations(!isEditingObligations)}
            className={`text-xs px-3 py-1 rounded-full ${
              isEditingObligations
                ? 'bg-lime-500 text-black'
                : isDarkMode
                  ? 'bg-neutral-800 text-white'
                  : 'bg-gray-200 text-gray-900'
            }`}
          >
            {isEditingObligations ? 'Done' : 'Edit List'}
          </button>
          <button
            onClick={addObligation}
            className={`text-xs px-3 py-1 rounded-full ${
              isDarkMode
                ? 'bg-neutral-800 text-white'
                : 'bg-gray-200 text-gray-900'
            } hover:${isDarkMode ? 'bg-neutral-700' : 'bg-gray-100'}`}
          >
            <Plus size={16} /> Add
          </button>
        </div>
      </div>

      {/* TOTAL OBLIGATIONS CARD */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className={`text-xs font-medium ${isDarkMode ? 'text-neutral-400' : 'text-gray-500'}`}>
              Total Monthly Obligations
            </p>
            <h3 className={`text-3xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              ₹ {obligationStats.total.toLocaleString('en-IN')}
            </h3>
          </div>
          <div className={`p-4 rounded-full ${isDarkMode ? 'bg-neutral-800' : 'bg-lime-50'}`}>
            <Wallet size={24} className="text-lime-500" />
          </div>
        </div>
        <div className="h-0.5 bg-gray-200 mb-4"></div>
        <div className="text-sm text-gray-500">
          These are your fixed monthly commitments that are automatically deducted from your income
          to calculate your "Safe-to-Spend" limit.
        </div>
      </Card>

      <div
        className={`rounded-2xl overflow-hidden border ${
          isDarkMode ? 'border-neutral-800 bg-neutral-900/50' : 'border-gray-200 bg-white'
        }`}
      >
        {obligations.length === 0 && (
          <p className="p-4 text-center opacity-50 text-sm">
            No obligations added. Add your first obligation above.
          </p>
        )}
        {obligations.map((item) => (
          <div
            key={item.id}
            className={`p-4 border-b last:border-0 flex items-center gap-3 ${
              isDarkMode ? 'border-neutral-800' : 'border-gray-100'
            }`}
          >
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-neutral-800' : 'bg-gray-100'}`}>
              {item.isRecurring ? (
                <Lock size={18} className="text-lime-500" />
              ) : (
                <Unlock size={18} className="text-gray-400" />
              )}
            </div>

            {isEditingObligations ? (
              <>
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => updateObligation(item.id, 'label', e.target.value)}
                    className={`p-2 rounded-lg text-sm ${
                      isDarkMode ? 'bg-neutral-950 text-white' : 'bg-gray-50'
                    }`}
                  />
                  <input
                    type="number"
                    value={item.amount === 0 ? '' : item.amount}
                    placeholder="0"
                    onChange={(e) =>
                      updateObligation(item.id, 'amount', parseFloat(e.target.value) || 0)
                    }
                    className={`p-2 rounded-lg text-sm font-mono ${
                      isDarkMode ? 'bg-neutral-950 text-white' : 'bg-gray-50'
                    }`}
                  />
                </div>
                <button
                  onClick={() => deleteObligation(item.id)}
                  className="p-2 text-red-500 bg-red-500/10 rounded-lg"
                >
                  <Trash2 size={16} />
                </button>
              </>
            ) : (
              <div className="flex-1 flex justify-between items-center">
                <p
                  className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} ${
                    !item.isRecurring && 'opacity-50'
                  }`}
                >
                  {item.label}
                </p>
                <p className={`font-mono ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  ₹{item.amount}
                </p>
              </div>
            )}

            {isEditingObligations && (
              <button
                onClick={() => toggleRecurring(item.id)}
                className={`p-2 rounded-lg transition-colors ${
                  item.isRecurring ? 'bg-lime-500/20 text-lime-500' : 'bg-gray-500/20 text-gray-500'
                }`}
              >
                <Check size={16} />
              </button>
            )}
          </div>
        ))}
        {isEditingObligations && (
          <button
            onClick={addObligation}
            className={`w-full p-3 flex items-center justify-center gap-2 text-sm font-medium ${
              isDarkMode ? 'text-lime-500 hover:bg-neutral-800' : 'text-lime-600 hover:bg-gray-50'
            }`}
          >
            <Plus size={16} /> Add New Obligation
          </button>
        )}
      </div>
      <p className="text-[10px] text-center opacity-40 px-4">
        Items with <span className="text-lime-500">Green Lock</span> are Recurring and auto-deducted
        from your Safe-to-Spend limit.
      </p>
    </div>
  );

  // Render Goals Tab
  const renderGoalsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Savings Goals
        </h2>
        <button
          onClick={() => {}}
          className={`text-xs px-3 py-1 rounded-full ${
            isDarkMode
              ? 'bg-neutral-800 text-white'
              : 'bg-gray-200 text-gray-900'
          } hover:${isDarkMode ? 'bg-neutral-700' : 'bg-gray-100'}`}
        >
          <Plus size={16} /> Add Goal
        </button>
      </div>

      {/* Goals Overview */}
      <Card className="p-5">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-purple-500/10">
                <PiggyBank size={20} className="text-purple-400" />
              </div>
              <div>
                <h3 className={isDarkMode ? 'font-semibold text-white' : 'font-semibold text-gray-900'}>
                  Active Goals
                </h3>
                <p className="text-sm text-gray-500">
                  Track your progress toward financial objectives
                </p>
              </div>
            </div>
            <div className="text-xs">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                financialSummary.monthlySavingsTarget > 0
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {financialSummary.monthlySavingsTarget > 0 ? '1 Active' : 'No Goals Set'}
              </span>
            </div>
          </div>
          <div className="h-0.5 bg-gray-200 mb-4"></div>

          {/* Current Goal Progress */}
          {financialSummary.monthlySavingsTarget > 0 ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-lg border">
                <div className="flex-shrink-0">
                  <div className="p-3 rounded-lg bg-purple-500/10">
                    <PiggyBank size={24} className="text-purple-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className={`font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Monthly Savings Goal
                  </h4>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-lg font-bold">${Math.max(financialSummary.netSavings, 0).toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Saved This Month</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">${financialSummary.monthlySavingsTarget.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Monthly Target</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                    <div
                      className={`h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500 w-${financialSummary.savingsProgress}%`}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{financialSummary.savingsProgress.toFixed(0)}% Complete</span>
                    <span>
                      {financialSummary.savingsProgress < 100
                        ? `₹{(financialSummary.monthlySavingsTarget - Math.max(financialSummary.netSavings, 0)).toLocaleString()} to go`
                        : 'Goal Achieved!'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Goal Suggestions */}
              <div className="space-y-3">
                <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Suggested Goals
                </h4>
                <div className="grid gap-3">
                  {/* Emergency Fund */}
                  <Card className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                          <Shield size={18} className="text-blue-400" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          Emergency Fund
                        </p>
                        <p className="text-sm text-gray-500">
                          Build an emergency fund covering 3-6 months of expenses
                        </p>
                        <div className="flex items-center mt-2">
                          <span className="text-xs text-gray-500">Suggested: ₹{
                            (financialSummary.totalExpenses * 3).toLocaleString()
                          }</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                  {/* Debt Payoff */}
                  <Card className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="p-2 rounded-lg bg-red-500/10">
                          <CreditCard size={18} className="text-red-400" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          Debt Payoff
                        </p>
                        <p className="text-sm text-gray-500">
                          Accelerate debt repayment to save on interest
                        </p>
                        <div className="flex items-center mt-2">
                          <span className="text-xs text-gray-500">Suggested: Allocate extra to high-interest debt</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                  {/* Investment */}
                  <Card className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="p-2 rounded-lg bg-green-500/10">
                          <TrendingUp size={18} className="text-green-400" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium mb-1">${isDarkMode ? 'text-white' : 'text-gray-900'}</p>
                        <p className="text-sm text-gray-500">
                          Start investing for long-term wealth growth
                        </p>
                        <div className="flex items-center mt-2">
                          <span className="text-xs text-gray-500">Suggested: ₹{
                            Math.max(financialSummary.netSavings * 0.5, 500).toLocaleString()
                          }/month</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                No Savings Goal Set
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Setting a savings goal helps you stay on track with your financial objectives.
              </p>
              <button
                onClick={() => {}}
                className="px-4 py-2 bg-lime-500 hover:bg-lime-400 text-black font-semibold rounded-xl transition-all"
              >
                Set Your First Goal
              </button>
            </div>
          )}
        </div>
      </Card>

      {/* Goal History & Templates */}
      <Card className="p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className={isDarkMode ? 'font-semibold text-white' : 'font-semibold text-gray-900'}>
            Goal Templates
          </h3>
          <button
            onClick={() => {}}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-gray-100"
          >
            <Filter size={16} />
            <span>More Templates</span>
          </button>
        </div>

        <div className="grid gap-4">
          {/* Travel */}
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="p-2 rounded-lg bg-indigo-500/10">
                  <Plane size={18} className="text-indigo-400" />
                </div>
              </div>
              <div className="flex-1">
                <p className={`font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Vacation Fund
                </p>
                <p className="text-sm text-gray-500">
                  Save for your next getaway
                </p>
                <div className="flex items-center mt-2">
                  <span className="text-xs text-gray-500">Suggested: ₹5,000/month</span>
                </div>
              </div>
            </div>
          </Card>
          {/* Home Purchase */}
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Home size={18} className="text-green-400" />
                </div>
              </div>
              <div className="flex-1">
                <p className={`font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Home Down Payment
                </p>
                <p className="text-sm text-gray-500">
                  Save for a down payment on a house
                </p>
                <div className="flex items-center mt-2">
                  <span className="text-xs text-gray-500">Suggested: ₹10,000/month</span>
                </div>
              </div>
            </div>
          </Card>
          {/* Education */}
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <BookOpen size={18} className="text-purple-400" />
                </div>
              </div>
              <div className="flex-1">
                <p className={`font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Education Fund
                </p>
                <p className="text-sm text-gray-500">
                  Save for education or skill development
                </p>
                <div className="flex items-center mt-2">
                  <span className="text-xs text-gray-500">Suggested: ₹3,000/month</span>
                </div>
              </div>
            </div>
          </Card>
          {/* Retirement */}
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <Sun size={18} className="text-orange-400" />
                </div>
              </div>
              <div className="flex-1">
                <p className={`font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Retirement Savings
                </p>
                <p className="text-sm text-gray-500">
                  Save for your future financial security
                </p>
                <div className="flex items-center mt-2">
                  <span className="text-xs text-gray-500">Suggested: ₹{
                    Math.max(financialSummary.totalIncome * 0.1, 2000).toLocaleString()
                  }/month</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </Card>
    </div>
  );

  // Render based on active tab
  const tabContent = {
    overview: renderOverviewTab(),
    obligations: renderObligationsTab(),
    goals: renderGoalsTab()
  }[activeTab];

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Financial Dashboard
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'overview'
                ? isDarkMode
                  ? 'bg-neutral-700 text-white'
                  : 'bg-lime-500 text-black'
                : isDarkMode
                  ? 'bg-neutral-800 text-neutral-200'
                  : 'bg-gray-100 text-gray-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('obligations')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'obligations'
                ? isDarkMode
                  ? 'bg-neutral-700 text-white'
                  : 'bg-lime-500 text-black'
                : isDarkMode
                  ? 'bg-neutral-800 text-neutral-200'
                  : 'bg-gray-100 text-gray-700'
            }`}
          >
            Obligations
          </button>
          <button
            onClick={() => setActiveTab('goals')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'goals'
                ? isDarkMode
                  ? 'bg-neutral-700 text-white'
                  : 'bg-lime-500 text-black'
                : isDarkMode
                  ? 'bg-neutral-800 text-neutral-200'
                  : 'bg-gray-100 text-gray-700'
            }`}
          >
            Goals
          </button>
        </div>
      </div>

      {tabContent}
    </div>
  );
};

// Helper component for dots in line chart
const Dot = ({ cx, cy, r, fill }: { cx: string | number; cy: string | number; r: number; fill: string }) => (
  <circle cx={cx} cy={cy} r={r} fill={fill} />
);

interface IconProps {
  size?: number;
  className?: string;
}

const Shield = ({ size = 18, className = '' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const CreditCard = ({ size = 18, className = '' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
    <line x1="1" y1="10" x2="23" y2="10"/>
  </svg>
);

const Plane = ({ size = 18, className = '' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
  </svg>
);

const Home = ({ size = 18, className = '' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
  </svg>
);

const BookOpen = ({ size = 18, className = '' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3V2z"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 0 3-3Vz"/>
  </svg>
);

const Sun = ({ size = 18, className = '' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <circle cx="12" cy="12" r="5"/>
    <path d="M12 2v2"/>
    <path d="M12 20v2"/>
    <path d="M4.93 4.93l2.12-2.12"/>
    <path d="M18.36 18.36l2.12 2.12"/>
    <path d="M2 12h2"/>
    <path d="M20 12h2"/>
    <path d="M6.34 17.66l-2.12 2.12"/>
    <path d="M17.66 6.34l2.12-2.12"/>
  </svg>
);