"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, RefreshCw, Download, ExternalLink } from "lucide-react"
import { useTransactions } from "@/hooks/use-transactions"
import type { Transaction } from "@/lib/types"
import Link from "next/link"

export function TransactionsTable() {
  const { transactions, isLoading, error, filters, updateFilters, resetFilters, refetch, isLive, bankName } =
    useTransactions()

  const [showFilters, setShowFilters] = useState(false)

  const handleSearch = (value: string) => {
    updateFilters({ search: value })
  }

  const handleModeFilter = (value: string) => {
    updateFilters({ mode: value === "all" ? "" : value })
  }

  const handleAmountFilter = (field: "minAmount" | "maxAmount", value: string) => {
    updateFilters({ [field]: value })
  }

  const handleDateFilter = (field: "dateFrom" | "dateTo", value: string) => {
    updateFilters({ [field]: value })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy HH:mm")
  }

  const getTransactionBadgeVariant = (mode: string) => {
    return mode === "CREDIT" ? "default" : "secondary"
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            Failed to load transactions. Please try again.
            <Button onClick={() => refetch()} className="ml-2" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Transactions</CardTitle>
            <CardDescription>
              {bankName} - {isLive ? "Live Data" : "Demo Mode"} ({transactions.length} transactions)
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/transactions">
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                View All
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={filters.search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Transaction Type</label>
              <Select value={filters.mode || "all"} onValueChange={handleModeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="CREDIT">Credit</SelectItem>
                  <SelectItem value="DEBIT">Debit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Amount Range</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Min"
                  type="number"
                  value={filters.minAmount}
                  onChange={(e) => handleAmountFilter("minAmount", e.target.value)}
                />
                <Input
                  placeholder="Max"
                  type="number"
                  value={filters.maxAmount}
                  onChange={(e) => handleAmountFilter("maxAmount", e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Date Range</label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleDateFilter("dateFrom", e.target.value)}
                />
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleDateFilter("dateTo", e.target.value)}
                />
              </div>
            </div>

            <div className="md:col-span-2 lg:col-span-4">
              <Button variant="outline" onClick={resetFilters}>
                Clear Filters
              </Button>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            Loading transactions...
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground">
            No transactions found. Try adjusting your filters.
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Account ID</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction: Transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-mono text-sm">{transaction.transactionId}</TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>
                      <Badge variant={getTransactionBadgeVariant(transaction.mode)}>{transaction.mode}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      <span className={transaction.mode === "CREDIT" ? "text-green-600" : "text-red-600"}>
                        {transaction.mode === "CREDIT" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {transaction.accountId.slice(0, 8)}...
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(transaction.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {transactions.length > 5 && (
              <div className="p-4 text-center border-t">
                <Link href="/transactions">
                  <Button variant="outline">
                    View All {transactions.length} Transactions
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
