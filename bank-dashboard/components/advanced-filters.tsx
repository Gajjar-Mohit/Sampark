"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { Badge } from "@/components/ui/badge"
import { X, Filter, RotateCcw } from "lucide-react"
import type { AccountFilters } from "@/lib/types"
import type { DateRange } from "react-day-picker"

interface AdvancedFiltersProps {
  filters: AccountFilters
  onFiltersChange: (filters: AccountFilters) => void
  isOpen: boolean
  onToggle: () => void
}

export function AdvancedFilters({ filters, onFiltersChange, isOpen, onToggle }: AdvancedFiltersProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [balanceRanges, setBalanceRanges] = useState<string[]>([])

  const branches = [
    "Double Paisa Colony Branch",
    "Kharcha Kam Area Branch",
    "Pagalpan Society Branch",
    "Main Branch",
    "City Center Branch",
    "Industrial Area Branch",
    "Residential Colony Branch",
  ]

  const balanceRangeOptions = [
    { label: "Below ₹1,000", value: "below-1000", min: 0, max: 999 },
    { label: "₹1,000 - ₹10,000", value: "1000-10000", min: 1000, max: 10000 },
    { label: "₹10,000 - ₹50,000", value: "10000-50000", min: 10000, max: 50000 },
    { label: "Above ₹50,000", value: "above-50000", min: 50000, max: Number.POSITIVE_INFINITY },
  ]

  const updateFilter = (key: keyof AccountFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const handleBalanceRangeChange = (rangeValue: string, checked: boolean) => {
    let newRanges: string[]
    if (checked) {
      newRanges = [...balanceRanges, rangeValue]
    } else {
      newRanges = balanceRanges.filter((r) => r !== rangeValue)
    }
    setBalanceRanges(newRanges)

    // Apply balance filter based on selected ranges
    if (newRanges.length > 0) {
      const selectedRanges = balanceRangeOptions.filter((option) => newRanges.includes(option.value))
      const minBalance = Math.min(...selectedRanges.map((r) => r.min)).toString()
      const maxBalance = Math.max(
        ...selectedRanges.map((r) => (r.max === Number.POSITIVE_INFINITY ? 999999999 : r.max)),
      ).toString()

      updateFilter("minBalance", minBalance)
      updateFilter("maxBalance", maxBalance === "999999999" ? "" : maxBalance)
    } else {
      updateFilter("minBalance", "")
      updateFilter("maxBalance", "")
    }
  }

  const resetFilters = () => {
    const resetFilters: AccountFilters = {
      search: "",
      branch: "all",
      minBalance: "",
      maxBalance: "",
      sortBy: "accountHolderName",
      sortOrder: "asc",
    }
    onFiltersChange(resetFilters)
    setDateRange(undefined)
    setBalanceRanges([])
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.search) count++
    if (filters.branch && filters.branch !== "all") count++
    if (filters.minBalance || filters.maxBalance) count++
    if (dateRange?.from || dateRange?.to) count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  if (!isOpen) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onToggle} className="relative bg-transparent">
          <Filter className="h-4 w-4 mr-2" />
          Advanced Filters
          {activeFiltersCount > 0 && (
            <Badge
              variant="secondary"
              className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
        )}
      </div>
    )
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Advanced Filters</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset All
            </Button>
            <Button variant="ghost" size="icon" onClick={onToggle}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Search Filter */}
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              placeholder="Name, Account No, PAN, Phone..."
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
            />
          </div>

          {/* Branch Filter */}
          <div className="space-y-2">
            <Label>Branch</Label>
            <Select value={filters.branch} onValueChange={(value) => updateFilter("branch", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                {branches.map((branch) => (
                  <SelectItem key={branch} value={branch}>
                    {branch}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort Options */}
          <div className="space-y-2">
            <Label>Sort By</Label>
            <div className="flex gap-2">
              <Select value={filters.sortBy} onValueChange={(value) => updateFilter("sortBy", value)}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="accountHolderName">Name</SelectItem>
                  <SelectItem value="accountNo">Account No</SelectItem>
                  <SelectItem value="balance">Balance</SelectItem>
                  <SelectItem value="createdAt">Created Date</SelectItem>
                  <SelectItem value="branchName">Branch</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.sortOrder}
                onValueChange={(value) => updateFilter("sortOrder", value as "asc" | "desc")}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">↑</SelectItem>
                  <SelectItem value="desc">↓</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Balance Range Filter */}
          <div className="space-y-3">
            <Label>Balance Range</Label>
            <div className="space-y-2">
              {balanceRangeOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.value}
                    checked={balanceRanges.includes(option.value)}
                    onCheckedChange={(checked) => handleBalanceRangeChange(option.value, checked as boolean)}
                  />
                  <Label htmlFor={option.value} className="text-sm font-normal">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>

            {/* Custom Balance Range */}
            <div className="pt-2 border-t">
              <Label className="text-sm text-muted-foreground">Custom Range</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Min"
                  type="number"
                  value={filters.minBalance}
                  onChange={(e) => updateFilter("minBalance", e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="Max"
                  type="number"
                  value={filters.maxBalance}
                  onChange={(e) => updateFilter("maxBalance", e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="space-y-3">
            <Label>Account Created Date</Label>
            <DatePickerWithRange date={dateRange} onDateChange={setDateRange} placeholder="Select date range" />
            {dateRange?.from && (
              <div className="text-sm text-muted-foreground">
                {dateRange.from.toLocaleDateString()} - {dateRange.to?.toLocaleDateString() || "Present"}
              </div>
            )}
          </div>
        </div>

        {/* Active Filters Summary */}
        {activeFiltersCount > 0 && (
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium">Active Filters:</span>
              {filters.search && (
                <Badge variant="secondary" className="gap-1">
                  Search: {filters.search}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter("search", "")} />
                </Badge>
              )}
              {filters.branch && filters.branch !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  Branch: {filters.branch}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter("branch", "all")} />
                </Badge>
              )}
              {(filters.minBalance || filters.maxBalance) && (
                <Badge variant="secondary" className="gap-1">
                  Balance: {filters.minBalance || "0"} - {filters.maxBalance || "∞"}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => {
                      updateFilter("minBalance", "")
                      updateFilter("maxBalance", "")
                      setBalanceRanges([])
                    }}
                  />
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
