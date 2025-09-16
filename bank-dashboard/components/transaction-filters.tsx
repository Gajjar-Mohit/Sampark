"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar, Search, Filter, X, TrendingUp, TrendingDown } from "lucide-react"
import type { TransactionFilters } from "@/lib/types"

interface TransactionFiltersProps {
  filters: TransactionFilters
  onFiltersChange: (filters: Partial<TransactionFilters>) => void
  onReset: () => void
  transactionCount: number
}

export function TransactionFiltersComponent({
  filters,
  onFiltersChange,
  onReset,
  transactionCount,
}: TransactionFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const activeFiltersCount = Object.values(filters).filter((value) => value !== "").length

  const handleQuickFilter = (type: "today" | "week" | "month" | "credit" | "debit" | "high-amount") => {
    const today = new Date()
    const todayStr = today.toISOString().split("T")[0]

    switch (type) {
      case "today":
        onFiltersChange({ dateFrom: todayStr, dateTo: todayStr })
        break
      case "week":
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        onFiltersChange({ dateFrom: weekAgo.toISOString().split("T")[0], dateTo: todayStr })
        break
      case "month":
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
        onFiltersChange({ dateFrom: monthAgo.toISOString().split("T")[0], dateTo: todayStr })
        break
      case "credit":
        onFiltersChange({ mode: "CREDIT" })
        break
      case "debit":
        onFiltersChange({ mode: "DEBIT" })
        break
      case "high-amount":
        onFiltersChange({ minAmount: "1000" })
        break
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">Filters</CardTitle>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFiltersCount} active
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
              <Filter className="h-4 w-4 mr-2" />
              {isExpanded ? "Hide" : "Show"} Filters
            </Button>
            {activeFiltersCount > 0 && (
              <Button variant="outline" size="sm" onClick={onReset}>
                <X className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => handleQuickFilter("today")}>
            <Calendar className="h-3 w-3 mr-1" />
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleQuickFilter("week")}>
            <Calendar className="h-3 w-3 mr-1" />
            Last 7 Days
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleQuickFilter("month")}>
            <Calendar className="h-3 w-3 mr-1" />
            Last 30 Days
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleQuickFilter("credit")}>
            <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
            Credits
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleQuickFilter("debit")}>
            <TrendingDown className="h-3 w-3 mr-1 text-red-600" />
            Debits
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleQuickFilter("high-amount")}>
            High Amount (₹1000+)
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Transaction ID, description..."
                  value={filters.search}
                  onChange={(e) => onFiltersChange({ search: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Account ID */}
            <div className="space-y-2">
              <Label htmlFor="accountId">Account ID</Label>
              <Input
                id="accountId"
                placeholder="Filter by account ID..."
                value={filters.accountId}
                onChange={(e) => onFiltersChange({ accountId: e.target.value })}
              />
            </div>

            {/* Transaction Type */}
            <div className="space-y-2">
              <Label>Transaction Type</Label>
              <Select
                value={filters.mode || "all"}
                onValueChange={(value) => onFiltersChange({ mode: value === "all" ? "" : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="CREDIT">Credit Only</SelectItem>
                  <SelectItem value="DEBIT">Debit Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Min Amount */}
            <div className="space-y-2">
              <Label htmlFor="minAmount">Minimum Amount</Label>
              <Input
                id="minAmount"
                type="number"
                placeholder="₹0"
                value={filters.minAmount}
                onChange={(e) => onFiltersChange({ minAmount: e.target.value })}
              />
            </div>

            {/* Max Amount */}
            <div className="space-y-2">
              <Label htmlFor="maxAmount">Maximum Amount</Label>
              <Input
                id="maxAmount"
                type="number"
                placeholder="No limit"
                value={filters.maxAmount}
                onChange={(e) => onFiltersChange({ maxAmount: e.target.value })}
              />
            </div>

            {/* Sort By */}
            <div className="space-y-2">
              <Label>Sort By</Label>
              <Select value={filters.sortBy} onValueChange={(value) => onFiltersChange({ sortBy: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Date</SelectItem>
                  <SelectItem value="amount">Amount</SelectItem>
                  <SelectItem value="transactionId">Transaction ID</SelectItem>
                  <SelectItem value="description">Description</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date From */}
            <div className="space-y-2">
              <Label htmlFor="dateFrom">From Date</Label>
              <Input
                id="dateFrom"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => onFiltersChange({ dateFrom: e.target.value })}
              />
            </div>

            {/* Date To */}
            <div className="space-y-2">
              <Label htmlFor="dateTo">To Date</Label>
              <Input
                id="dateTo"
                type="date"
                value={filters.dateTo}
                onChange={(e) => onFiltersChange({ dateTo: e.target.value })}
              />
            </div>

            {/* Sort Order */}
            <div className="space-y-2">
              <Label>Sort Order</Label>
              <Select
                value={filters.sortOrder}
                onValueChange={(value: "asc" | "desc") => onFiltersChange({ sortOrder: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Newest First</SelectItem>
                  <SelectItem value="asc">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {transactionCount} transaction{transactionCount !== 1 ? "s" : ""} found
            </div>
            <Button onClick={onReset} variant="outline">
              Reset All Filters
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
