import React, { useMemo, useState } from 'react';
import {
  Lightbulb,
  Filter,
  TrendingUp,
  TrendingDown,
  Share2,
  Download,
  Menu,
  ChevronDown
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  TypeAhead,
  ComposedChart
} from 'recharts';
import { Card } from '../components/ui/Card';
import { useTheme } from '../hooks/useTheme';
import { Transaction } from '../types';
import { Button } from '../components/ui/button';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#b8e986', '#ff9a76', '#d0bbff', '#fff1b8', '#edea9e'];

interface AnalysisTabProps {
  transactions: Transaction[];
}

interface CategoryData {
  name: string;
  value: number;
  percentage: number;
}

interface MonthlyData {
  month: string;
  income: number;
  expense: number;
}

interface TrendData {
  date: string;
  amount: number;
  type: 'income' | 'expense';
}

export const AnalysisTab: React.FC<AnalysisTabProps> = ({ transactions }) => {
  const { isDarkMode } = useTheme();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [chartType, setChartType] = useState<'pie' | 'bar' | 'line'>('pie');
  const [filterCategory, setFilterCategory] = useState<string>('All');

  // Filter transactions by time range
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return transactions.filter(t => new Date(t.date) >= startDate);
  }, [transactions, timeRange]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = [...new Set(filteredTransactions.map(t => t.category))];
    return ['All', ...cats.sort()];
  }, [filteredTransactions]);

  // Apply category filter
  const categorizedTransactions = useMemo(() => {
    if (filterCategory === 'All') return filteredTransactions;
    return filteredTransactions.filter(t => t.category === filterCategory);
  }, [filteredTransactions, filterCategory]);

  // Category totals for pie chart
  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    categorizedTransactions
      .filter(t => t.type === 'expense')
      .forEach((t) => {
        totals[t.category] = (totals[t.category] || 0) + t.amount;
      });

    return Object.entries(totals)
      .map(([name, value]) => ({
        name,
        value,
        percentage: 0 // Will calculate below
      }))
      .sort((a, b) => b.value - a.value);
  }, [categorizedTransactions]);

  // Calculate percentages
  const categoryDataWithPercentage = useMemo(() => {
    if (categoryTotals.length === 0) return [];

    const total = categoryTotals.reduce((sum, item) => sum + item.value, 0);
    return categoryTotals.map(item => ({
      ...item,
        percentage: total > 0 ? (item.value / total) * 100 : 0
    }));
  }, [categoryTotals]);

  // Monthly trend data
  const monthlyData = useMemo(() => {
    const months: Record<string, { income: number; expense: number }> = {};

    categorizedTransactions.forEach((t) => {
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
        month: new Date(`${month}-01`).toLocaleString('default', { month: 'short', year: 'numeric' }),
        income: values.income,
        expense: values.expense
      }))
      .sort((a, b) => {
        const dateA = new Date(`1 ${a.month}`);
        const dateB = new Date(`1 ${b.month}`);
        return dateA.getTime() - dateB.getTime();
      });
  }, [categorizedTransactions]);

  // Daily trend for selected time range
  const trendData = useMemo(() => {
    const dailyData: Record<string, { income: number; expense: number }> = {};

    categorizedTransactions.forEach((t) => {
      const date = new Date(t.date);
      const dateKey = date.toISOString().split('T')[0];

      if (!dailyData[dateKey]) {
        dailyData[dateKey] = { income: 0, expense: 0 };
      }

      if (t.type === 'income') {
        dailyData[dateKey].income += t.amount;
      } else if (t.type === 'expense') {
        dailyData[dateKey].expense += t.amount;
      }
    });

    const incomeTrend = Object.entries(dailyData)
      .map(([date, values]) => ({
        date,
        amount: values.income,
        type: 'income' as const
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const expenseTrend = Object.entries(dailyData)
      .map(([date, values]) => ({
        date,
        amount: values.expense,
        type: 'expense' as const
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return [...incomeTrend, ...expenseTrend];
  }, [categorizedTransactions]);

  // Key metrics
  const totalIncome = categorizedTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = categorizedTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  // Top expense category
  const topExpenseCategory = categoryDataWithPercentage[0] || { name: 'None', value: 0, percentage: 0 };

  // Average transaction size
  const avgTransactionSize = categorizedTransactions.length > 0
    ? categorizedTransactions.reduce((sum, t) => sum + t.amount, 0) / categorizedTransactions.length
    : 0;

  const renderChart = () => {
    switch (chartType) {
      case 'pie':
        return (
          <PieChart
            width={400}
            height={400}
          >
            <Pie
              data={categoryDataWithPercentage}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              labelLine={false}
              label={({ name, value, percentage }: any) =>
                `${name}\n₹{value.toLocaleString()}\n{percentage.toFixed(1)}%`
              }
            >
              {categoryDataWithPercentage.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => `₹${value.toLocaleString()}`}
              formatter={(value: number, name: string) =>
                `${name}: ₹${value.toLocaleString()}`}
            />
            <Legend
              verticalAlign="top"
              height={36}
              wrapperStyle={{
                left: 200,
                top: 20
              }}
            />
          </PieChart>
        );
      case 'bar':
        return (
          <BarChart
            width={400}
            height={300}
            data={categoryDataWithPercentage.slice(0, 8)}
            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
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
            >
              <YAxis
                orientation="right"
                tick={{
                  fontSize: 12,
                  fill: isDarkMode ? '#ccc' : '#666'
                }}
              />
            </YAxis>
            <Tooltip
              formatter={(value: number) => `₹${value.toLocaleString()}}`
            />
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
            <Bar
              dataKey="value"
              barSize={20}
              fill={isDarkMode ? '#4ade80' : '#10b981'}
              radius={[4, 4, 0, 0]}
            >
              {categoryDataWithPercentage.slice(0, 8).map((entry, index) => (
                <Cell key={`bar-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        );
      case 'line':
        return (
          <LineChart
            width={400}
            height={300}
            data={trendData}
            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          >
            <Defs>
              <LinearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={isDarkMode ? '#4ade80' : '#10b981'} stopOpacity={0.8} />
                <Stop offset="1" stopColor={isDarkMode ? '#4ade80' : '#10b981'} stopOpacity={0} />
              </LinearGradient>
              <LinearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={isDarkMode ? '#f87171' : '#ef4444'} stopOpacity={0.8} />
                <Stop offset="1" stopColor={isDarkMode ? '#f87171' : '#ef4444'} stopOpacity={0} />
              </LinearGradient>
            </Defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{
                fontSize: 12,
                fill: isDarkMode ? '#ccc' : '#666'
              }}
            >
              <XAxis
                tickFormatter={(date: string) => {
                  const d = new Date(date);
                  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                }}
              />
            </XAxis>
            <YAxis
              tick={{
                fontSize: 12,
                fill: isDarkMode ? '#ccc' : '#666'
              }}
            >
              <YAxis
                orientation="right"
                tick={{
                  fontSize: 12,
                  fill: isDarkMode ? '#ccc' : '#666'
                }}
              />
            </YAxis>
            <Tooltip
              formatter={(value: number) => `₹${value.toLocaleString()}}`
              contentStyle={{
                background: isDarkMode ? '#1f2937' : '#fff',
                border: isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb'
              }}
              labelStyle={{
                fontSize: 12,
                fill: isDarkMode ? '#fff' : '#111'
              }}
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
              dataKey="amount"
              stroke={isDarkMode ? '#4ade80' : '#10b981'}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
              isAnimationActive={false}
            >
              {trendData.filter(d => d.type === 'income').map((entry, index) => (
                <Dot key={`income-${index}`} cx={entry.date} cy={entry.amount} r={4} fill={isDarkMode ? '#4ade80' : '#10b981'} />
              ))}
            </Line>
            <Line
              type="monotone"
              dataKey="amount"
              stroke={isDarkMode ? '#f87171' : '#ef4444'}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
              isAnimationActive={false}
            >
              {trendData.filter(d => d.type === 'expense').map((entry, index) => (
                <Dot key={`expense-${index}`} cx={entry.date} cy={entry.amount} r={4} fill={isDarkMode ? '#f87171' : '#ef4444'} />
              ))}
            </Line>
          </LineChart>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-400" />
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Financial Analysis
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              onClick={() => setFilterCategory('All')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                filterCategory === 'All'
                  ? isDarkMode
                    ? 'bg-neutral-700 text-white'
                    : 'bg-blue-50 text-blue-600'
                  : isDarkMode
                    ? 'bg-neutral-800 text-neutral-200'
                    : 'bg-gray-100 text-gray-700'
              }`}
            >
              {filterCategory === 'All' ? 'All Categories' : filterCategory}
              <ChevronDown size={14} className="ml-1" />
            </button>
            {/* Dropdown menu for categories */}
            {filterCategory !== 'All' && (
              <div className="absolute left-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => {
                const ranges: Record<'week' | 'month' | 'quarter' | 'year', string> = {
                  week: 'Week',
                  month: 'Month',
                  quarter: 'Quarter',
                  year: 'Year'
                };
                setTimeRange(ranges[timeRange] === 'Week' ? 'month' :
                            ranges[timeRange] === 'Month' ? 'quarter' :
                            ranges[timeRange] === 'quarter' ? 'year' : 'week');
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                timeRange === 'week'
                  ? isDarkMode
                    ? 'bg-neutral-700 text-white'
                    : 'bg-blue-50 text-blue-600'
                  : timeRange === 'month'
                    ? isDarkMode
                      ? 'bg-neutral-700 text-white'
                      : 'bg-blue-50 text-blue-600'
                    : timeRange === 'quarter'
                      ? isDarkMode
                        ? 'bg-neutral-700 text-white'
                        : 'bg-blue-50 text-blue-600'
                      : isDarkMode
                        ? 'bg-neutral-700 text-white'
                        : 'bg-blue-50 text-blue-600'
              }`}
            >
              {timeRange === 'week' ? 'This Week' :
               timeRange === 'month' ? 'This Month' :
               timeRange === 'quarter' ? 'This Quarter' : 'This Year'}
            </button>
          </div>

          <div className="relative">
            <button
              onClick={() => {
                const types: Record<'pie' | 'bar' | 'line', string> = {
                  pie: 'Pie Chart',
                  bar: 'Bar Chart',
                  line: 'Line Chart'
                };
                setChartType(types[chartType] === 'Pie Chart' ? 'bar' :
                            types[chartType] === 'Bar Chart' ? 'line' : 'pie');
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                chartType === 'pie'
                  ? isDarkMode
                    ? 'bg-neutral-700 text-white'
                    : 'bg-blue-50 text-blue-600'
                  : chartType === 'bar'
                    ? isDarkMode
                      ? 'bg-neutral-700 text-white'
                      : 'bg-blue-50 text-blue-600'
                    : isDarkMode
                      ? 'bg-neutral-700 text-white'
                      : 'bg-blue-50 text-blue-600'
              }`}
            >
              {chartType === 'pie' ? 'Pie Chart' :
               chartType === 'bar' ? 'Bar Chart' : 'Line Chart'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {}}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-gray-100"
            >
              <Download size={16} />
              <span>Export Report</span>
            </button>
            <button
              onClick={() => {}}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-gray-100"
            >
              <Share2 size={16} />
              <span>Share Insights</span>
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-green-500/10">
                <TrendingUp size={18} className="text-green-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Total Income</p>
                <p className={`text-lg font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  ₹{totalIncome.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="text-xs">
              {totalIncome > 0 ?
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  savingsRate > 0
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {savingsRate.toFixed(1)}% Savings Rate
                </span> :
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  No Income Data
                </span>
              }
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-red-500/10">
                <TrendingDown size={18} className="text-red-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Total Expenses</p>
                <p className={`text-lg font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  ₹{totalExpenses.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="text-xs">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                topExpenseCategory.percentage > 0
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                Top: {topExpenseCategory.name} ({topExpenseCategory.percentage.toFixed(1)}%)
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-indigo-500/10">
                <Wallet size={18} className="text-indigo-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Net Savings</p>
                <p className={`text-lg font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  ₹{netSavings >= 0 ? netSavings.toLocaleString() : `-${Math.abs(netSavings).toLocaleString()}`}
                </p>
              </div>
            </div>
            <div className="text-xs">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                netSavings >= 0
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {netSavings >= 0 ? 'Positive' : 'Negative'} Cash Flow
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <div className="flex items-center gap-1">
                  <Calculator size={18} className="text-purple-400" />
                  <span className="text-xs">₹{avgTransactionSize.toFixed(0)}</span>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Avg Transaction</p>
                <p className={`text-lg font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  ₹{avgTransactionSize.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="text-xs">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                categorizedTransactions.length > 0
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {categorizedTransactions.length} Transactions
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Category Breakdown */}
        <Card className="p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Expense Breakdown by Category
            </h3>
            <div className="flex items-center gap-2 text-sm">
              <button
                onClick={() => setChartType('pie')}
                className={`px-2 py-1 rounded text-xs font-medium transition-all duration-200 ${
                  chartType === 'pie'
                    ? isDarkMode
                      ? 'bg-neutral-700 text-white'
                      : 'bg-blue-50 text-blue-600'
                    : isDarkMode
                      ? 'bg-neutral-800 text-neutral-200'
                      : 'bg-gray-100 text-gray-700'
                }`}
              >
                Pie
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`px-2 py-1 rounded text-xs font-medium transition-all duration-200 ${
                  chartType === 'bar'
                    ? isDarkMode
                      ? 'bg-neutral-700 text-white'
                      : 'bg-blue-50 text-blue-600'
                    : isDarkMode
                      ? 'bg-neutral-800 text-neutral-200'
                      : 'bg-gray-100 text-gray-700'
                }`}
              >
                Bar
              </button>
            </div>
          </div>

          {categoryDataWithPercentage.length > 0 ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                {renderChart()}
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-center py-8 text-xs opacity-60">
              No expense data available for the selected period.
            </p>
          )}
        </Card>

        {/* Income vs Expense Trend */}
        <Card className="p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Income vs Expense Trend
            </h3>
            <div className="flex items-center gap-2 text-sm">
              <button
                onClick={() => setChartType('line')}
                className={`px-2 py-1 rounded text-xs font-medium transition-all duration-200 ${
                  chartType === 'line'
                    ? isDarkMode
                      ? 'bg-neutral-700 text-white'
                      : 'bg-blue-50 text-blue-600'
                    : isDarkMode
                      ? 'bg-neutral-800 text-neutral-200'
                      : 'bg-gray-100 text-gray-700'
                }`}
              >
                Line Chart
              </button>
            </div>
          </div>

          {trendData.length > 0 ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                {renderChart()}
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-center py-8 text-xs opacity-60">
              No trend data available for the selected period.
            </p>
          )}
        </Card>
      </div>

      {/* Insights Section */}
      <Card className="p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Key Insights & Recommendations
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
          {/* Savings Insight */}
          <div className="flex items-start gap-3 p-4 rounded-lg border">
            <div className="flex-shrink-0">
              <div className="p-2 rounded-lg bg-green-500/10">
                <TrendingUp size={16} className="text-green-400" />
              </div>
            </div>
            <div className="flex-1">
              <h4 className={`font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Savings Opportunity
              </h4>
              <p className={`text-sm ${isDarkMode ? 'text-neutral-300' : 'text-gray-600'}`}>
                Based on your spending pattern, you could save an additional
                <span className="font-semibold">₹{(totalExpenses * 0.1).toLocaleString()}</span>
                monthly by reducing your top expense category ({topExpenseCategory.name}) by just 10%.
              </p>
            </div>
          </div>

          {/* Spending Trend Insight */}
          <div className="flex items-start gap-3 p-4 rounded-lg border">
            <div className="flex-shrink-0">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <TrendingUp size={16} className="text-blue-400" />
              </div>
            </div>
            <div className="flex-1">
              <h4 className={`font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Spending Trend
              </h4>
              <p className={`text-sm ${isDarkMode ? 'text-neutral-300' : 'text-gray-600'}`}>
                Your {timeRange === 'week' ? 'weekly' : timeRange === 'month' ? 'monthly' : 'quarterly'}
                spending trend shows
                <span className="font-semibold">
                  {monthlyData.length >= 2 ?
                    monthlyData[monthlyData.length - 1].expense > monthlyData[monthlyData.length - 2].expense
                      ? 'an increase'
                      : 'a decrease'
                    : 'stable'}
                </span> in expenses compared to the previous period.
              </p>
            </div>
          </div>

          {/* Category Concentration Insight */}
          <div className="flex items-start gap-3 p-4 rounded-lg border">
            <div className="flex-shrink-0">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Lightbulb size={16} className="text-purple-400" />
              </div>
            </div>
            <div className="flex-1">
              <h4 className={`font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Category Concentration
              </h4>
              <p className={`text-sm ${isDarkMode ? 'text-neutral-300' : 'text-gray-600'}`}>
                Your top 3 expense categories ({categoryDataWithPercentage.slice(0, 3).map(c => c.name).join(', ')})
                account for
                <span className="font-semibold">
                  {categoryDataWithPercentage.slice(0, 3).reduce((sum, c) => sum + c.percentage, 0).toFixed(1)}%
                </span> of your total expenses.
              </p>
            </div>
          </div>

          {/* Income Stability Insight */}
          <div className="flex items-start gap-3 p-4 rounded-lg border">
            <div className="flex-shrink-0">
              <div className="p-2 rounded-lg bg-indigo-500/10">
                <Wallet size={16} className="text-indigo-400" />
              </div>
            </div>
            <div className="flex-1">
              <h4 className={`font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Income Stability
              </h4>
              <p className={`text-sm ${isDarkMode ? 'text-neutral-300' : 'text-gray-600'}`}>
                Your income shows
                <span className="font-semibold">
                  {monthlyData.length >= 2 ?
                    Math.abs((monthlyData[monthlyData.length - 1].income - monthlyData[monthlyData.length - 2].income) /
                    (monthlyData[monthlyData.length - 2].income || 1) * 100).toFixed(1)}%
                  : '0%'
                </span> month-over-month change, indicating
                <span className="font-semibold">
                  {monthlyData.length >= 2 && Math.abs((monthlyData[monthlyData.length - 1].income - monthlyData[monthlyData.length - 2].income) /
                    (monthlyData[monthlyData.length - 2].income || 1) * 100) < 10
                    ? 'stable'
                    : 'variable'}
                </span> income patterns.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <Card className="p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Recent Transactions
          </h3>
          <button
            onClick={() => {}}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-gray-100"
          >
            <Filter size={16} />
            <span>Filter</span>
          </button>
        </div>

        <div className="space-y-3">
          {categorizedTransactions
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5)
            .map((transaction, index) => (
              <div
                key={index}
                className="p-3 rounded-lg border"
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="flex-1">
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {transaction.text}
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-neutral-400' : 'text-gray-500'}`}>
                      {new Date(transaction.date).toLocaleDateString()} •
                      {transaction.category}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${transaction.type === 'income'
                      ? isDarkMode
                        ? 'text-green-400'
                        : 'text-green-600'
                      : isDarkMode
                        ? 'text-red-400'
                        : 'text-red-600'}
                    `}>
                      {transaction.type === 'income' ? '+' : '-'}{₹{transaction.amount.toLocaleString()}}
                    </p>
                  </div>
                </div>
                <div className="h-0.5 bg-gray-200"></div>
              </div>
            ))}

          {categorizedTransactions.length === 0 && (
            <p className="text-center py-6 text-xs opacity-60">
              No transactions found for the selected filters.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper component for dots in line chart
const Dot = ({ cx, cy, r, fill }: { cx: string | number; cy: string | number; r: number; fill: string }) => (
  <circle cx={cx} cy={cy} r={r} fill={fill} />
);