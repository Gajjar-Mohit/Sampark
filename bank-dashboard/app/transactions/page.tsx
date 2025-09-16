"use client"

import { BankHeader } from "@/components/bank-header"
import { TransactionsTable } from "@/components/transactions-table"
import { TransactionFiltersComponent } from "@/components/transaction-filters"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTransactions } from "@/hooks/use-transactions"
import { useBank } from "@/contexts/bank-context"
import { TrendingUp, TrendingDown, Activity, CreditCard } from "lucide-react"

export default function TransactionsPage() {
  const { currentBank } = useBank()
  const { transactions, filters, updateFilters, resetFilters, isLoading, isLive } = useTransactions()

  // Calculate transaction statistics
  const totalTransactions = transactions.length
  const creditTransactions = transactions.filter((t: any) => t.mode === "CREDIT")
  const debitTransactions = transactions.filter((t  : any) => t.mode === "DEBIT")
  const totalCredits = creditTransactions.reduce((sum: any, t: any) => sum + t.amount, 0)
  const totalDebits = debitTransactions.reduce((sum: any, t: any) => sum + t.amount, 0)
  const netFlow = totalCredits - totalDebits

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-background">
      <BankHeader />
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Transaction Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTransactions}</div>
              <p className="text-xs text-muted-foreground">
                {isLive ? "Live data" : "Demo mode"} from {currentBank?.name}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalCredits)}</div>
              <p className="text-xs text-muted-foreground">{creditTransactions.length} credit transactions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Debits</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(totalDebits)}</div>
              <p className="text-xs text-muted-foreground">{debitTransactions.length} debit transactions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Flow</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${netFlow >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatCurrency(netFlow)}
              </div>
              <p className="text-xs text-muted-foreground">{netFlow >= 0 ? "Positive" : "Negative"} cash flow</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <TransactionFiltersComponent
          filters={filters}
          onFiltersChange={updateFilters}
          onReset={resetFilters}
          transactionCount={totalTransactions}
        />

        {/* Transactions Table */}
        <TransactionsTable />
      </main>
    </div>
  )
}
