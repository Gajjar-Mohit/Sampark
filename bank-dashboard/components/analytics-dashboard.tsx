"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { TrendingUp, TrendingDown, Building2, AlertTriangle, CreditCard } from "lucide-react"
import { useAccounts } from "@/hooks/use-accounts"
import { useBankContext } from "@/contexts/bank-context"
import { useMemo } from "react"

export function AnalyticsDashboard() {
  const { currentBank } = useBankContext()
  const { data: accountsData, isLoading } = useAccounts()

  const analytics = useMemo(() => {
    if (!accountsData?.data) {
      return {
        branchData: [],
        balanceDistribution: [],
        totalAccounts: 0,
        totalBalance: 0,
        riskMetrics: [],
      }
    }

    const accounts = accountsData.data
    const totalAccounts = accounts.length
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0)

    // Calculate branch performance
    const branchMap = new Map()
    accounts.forEach((account) => {
      const branch = account.branchName || "Unknown Branch"
      if (!branchMap.has(branch)) {
        branchMap.set(branch, { accounts: 0, balance: 0 })
      }
      const branchData = branchMap.get(branch)
      branchData.accounts += 1
      branchData.balance += account.balance
    })

    const branchData = Array.from(branchMap.entries())
      .map(([name, data]) => ({
        name: name.length > 15 ? name.substring(0, 15) + "..." : name,
        accounts: data.accounts,
        balance: data.balance,
      }))
      .sort((a, b) => b.accounts - a.accounts)
      .slice(0, 5)

    // Calculate balance distribution
    const balanceRanges = {
      "Below ₹1K": accounts.filter((acc) => acc.balance < 1000).length,
      "₹1K-₹10K": accounts.filter((acc) => acc.balance >= 1000 && acc.balance < 10000).length,
      "₹10K-₹50K": accounts.filter((acc) => acc.balance >= 10000 && acc.balance < 50000).length,
      "Above ₹50K": accounts.filter((acc) => acc.balance >= 50000).length,
    }

    const balanceDistribution = Object.entries(balanceRanges).map(([name, count]) => ({
      name,
      value: totalAccounts > 0 ? Math.round((count / totalAccounts) * 100) : 0,
      color:
        name === "Below ₹1K"
          ? "#ef4444"
          : name === "₹1K-₹10K"
            ? "#f97316"
            : name === "₹10K-₹50K"
              ? "#22c55e"
              : "#3b82f6",
    }))

    // Calculate risk metrics
    const lowBalanceAccounts = accounts.filter((acc) => acc.balance < 1000).length
    const zeroBalanceAccounts = accounts.filter((acc) => acc.balance === 0).length
    const highValueAccounts = accounts.filter((acc) => acc.balance > 100000).length

    const riskMetrics = [
      {
        label: "Low Balance Accounts",
        value: lowBalanceAccounts,
        total: totalAccounts,
        percentage: totalAccounts > 0 ? ((lowBalanceAccounts / totalAccounts) * 100).toFixed(1) : "0",
        trend: "down",
      },
      {
        label: "Zero Balance Accounts",
        value: zeroBalanceAccounts,
        total: totalAccounts,
        percentage: totalAccounts > 0 ? ((zeroBalanceAccounts / totalAccounts) * 100).toFixed(1) : "0",
        trend: "up",
      },
      {
        label: "High Value Accounts",
        value: highValueAccounts,
        total: totalAccounts,
        percentage: totalAccounts > 0 ? ((highValueAccounts / totalAccounts) * 100).toFixed(1) : "0",
        trend: "up",
      },
    ]

    return {
      branchData,
      balanceDistribution,
      totalAccounts,
      totalBalance,
      riskMetrics,
    }
  }, [accountsData])

  // Mock monthly trends (would need historical data from API)
  const monthlyTrends = [
    { month: "Jan", newAccounts: 45, totalBalance: analytics.totalBalance * 0.8 },
    { month: "Feb", newAccounts: 52, totalBalance: analytics.totalBalance * 0.85 },
    { month: "Mar", newAccounts: 48, totalBalance: analytics.totalBalance * 0.9 },
    { month: "Apr", newAccounts: 61, totalBalance: analytics.totalBalance * 0.95 },
    { month: "May", newAccounts: 55, totalBalance: analytics.totalBalance * 0.98 },
    { month: "Jun", newAccounts: 67, totalBalance: analytics.totalBalance },
  ]

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Accounts</p>
                <p className="text-2xl font-bold">{analytics.totalAccounts.toLocaleString()}</p>
              </div>
              <CreditCard className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Balance</p>
                <p className="text-2xl font-bold">{formatCurrency(analytics.totalBalance)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Branches</p>
                <p className="text-2xl font-bold">{analytics.branchData.length}</p>
              </div>
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Balance</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(analytics.totalAccounts > 0 ? analytics.totalBalance / analytics.totalAccounts : 0)}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Branch Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Branch Performance - {currentBank.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.branchData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={analytics.branchData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} angle={-45} textAnchor="end" height={60} />
                <YAxis fontSize={12} />
                <Tooltip
                  formatter={(value, name) => [
                    name === "accounts" ? value : formatCurrency(value as number),
                    name === "accounts" ? "Accounts" : "Total Balance",
                  ]}
                />
                <Bar dataKey="accounts" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-muted-foreground py-8">No branch data available</div>
          )}
        </CardContent>
      </Card>

      {/* Balance Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Balance Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={analytics.balanceDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {analytics.balanceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, "Percentage"]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4 w-full">
              {analytics.balanceDistribution.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Monthly Trends (Projected)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip
                formatter={(value, name) => [
                  name === "newAccounts" ? value : formatCurrency(value as number),
                  name === "newAccounts" ? "New Accounts" : "Total Balance",
                ]}
              />
              <Line
                type="monotone"
                dataKey="newAccounts"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Risk Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Account Risk Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {analytics.riskMetrics.map((metric, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{metric.label}</span>
                <div className="flex items-center gap-2">
                  <Badge variant={metric.trend === "up" ? "destructive" : "secondary"}>
                    {metric.trend === "up" ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    {metric.percentage}%
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {metric.value}/{metric.total}
                  </span>
                </div>
              </div>
              <Progress value={metric.total > 0 ? (metric.value / metric.total) * 100 : 0} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <button className="w-full text-left p-3 rounded-lg border hover:bg-muted/50 transition-colors">
            <div className="font-medium text-sm">Generate Monthly Report</div>
            <div className="text-xs text-muted-foreground">Export account summary for {currentBank.name}</div>
          </button>
          <button className="w-full text-left p-3 rounded-lg border hover:bg-muted/50 transition-colors">
            <div className="font-medium text-sm">Review Risk Accounts</div>
            <div className="text-xs text-muted-foreground">
              {analytics.riskMetrics[0]?.value || 0} accounts need attention
            </div>
          </button>
          <button className="w-full text-left p-3 rounded-lg border hover:bg-muted/50 transition-colors">
            <div className="font-medium text-sm">Branch Comparison</div>
            <div className="text-xs text-muted-foreground">Compare {analytics.branchData.length} active branches</div>
          </button>
        </CardContent>
      </Card>
    </div>
  )
}
