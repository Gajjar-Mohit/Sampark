"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import type { AccountsResponse, AccountFilters } from "@/lib/types"
import { useBankContext } from "@/contexts/bank-context"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const defaultFilters: AccountFilters = {
  search: "",
  branch: "all",
  minBalance: "",
  maxBalance: "",
  sortBy: "accountHolderName",
  sortOrder: "asc",
}

export function useAccounts(filters: AccountFilters = defaultFilters) {
  const [debouncedFilters, setDebouncedFilters] = useState(filters)
  const { currentBank } = useBankContext()

  // Debounce filters to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters)
    }, 300)

    return () => clearTimeout(timer)
  }, [filters])

  // Build query string
  const queryParams = new URLSearchParams()
  queryParams.set("bankUrl", currentBank.url)
  if (debouncedFilters.search) queryParams.set("search", debouncedFilters.search)
  if (debouncedFilters.branch && debouncedFilters.branch !== "all") queryParams.set("branch", debouncedFilters.branch)
  if (debouncedFilters.minBalance) queryParams.set("minBalance", debouncedFilters.minBalance)
  if (debouncedFilters.maxBalance) queryParams.set("maxBalance", debouncedFilters.maxBalance)
  if (debouncedFilters.sortBy) queryParams.set("sortBy", debouncedFilters.sortBy)
  if (debouncedFilters.sortOrder) queryParams.set("sortOrder", debouncedFilters.sortOrder)

  const { data, error, isLoading, mutate } = useSWR<AccountsResponse>(
    `/api/accounts?${queryParams.toString()}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 0,
    },
  )

  return {
    data,
    accounts: data?.data || [],
    total: data?.total || 0,
    isLoading,
    error,
    mutate,
    bankStatus: data?.status,
    bankMessage: data?.message,
  }
}
