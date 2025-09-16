"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import type { TransactionsResponse, TransactionFilters } from "@/lib/types"
import { useBank } from "@/contexts/bank-context"

const defaultFilters: TransactionFilters = {
  search: "",
  accountId: "",
  mode: "",
  minAmount: "",
  maxAmount: "",
  dateFrom: "",
  dateTo: "",
  sortBy: "createdAt",
  sortOrder: "desc",
}

export function useTransactions(filters: Partial<TransactionFilters> = {}) {
  const { currentBank } = useBank()
  const [appliedFilters, setAppliedFilters] = useState<TransactionFilters>({
    ...defaultFilters,
    ...filters,
  })

  console.log("[v0] useTransactions called with bank:", currentBank?.name, "filters:", appliedFilters)

  const queryParams = new URLSearchParams({
    bankId: currentBank?.id || "babu-rao-ganpatrao",
    ...Object.fromEntries(Object.entries(appliedFilters).filter(([_, value]) => value !== "")),
  })

  const fetcher = async (url: string)=> {
    console.log("[v0] Fetching transactions from:", url)
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error("Failed to fetch transactions")
    }
    const data = await response.json()
    console.log("[v0] Transactions fetched:", data.data?.length || 0, "transactions")
    return data
  }

  const { data, error, isLoading, mutate } = useSWR(
    `/api/transactions?${queryParams.toString()}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    },
  )

  const updateFilters = (newFilters: Partial<TransactionFilters>) => {
    console.log("[v0] Updating transaction filters:", newFilters)
    setAppliedFilters((prev) => ({ ...prev, ...newFilters }))
  }

  const resetFilters = () => {
    console.log("[v0] Resetting transaction filters")
    setAppliedFilters(defaultFilters)
  }

  // Refetch when bank changes
  useEffect(() => {
    console.log("[v0] Bank changed, refetching transactions for:", currentBank?.name)
    mutate()
  }, [currentBank?.id, mutate])

  return {
    transactions: data?.data || [],
    isLoading,
    error,
    filters: appliedFilters,
    updateFilters,
    resetFilters,
    refetch: mutate,
    isLive: data?.isLive || false,
    bankName: data?.bankName || currentBank?.name,
  }
}
