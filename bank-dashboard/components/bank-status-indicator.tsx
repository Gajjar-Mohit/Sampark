"use client"

import { AlertCircle, CheckCircle, Wifi, WifiOff } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useAccounts } from "@/hooks/use-accounts"

export function BankStatusIndicator() {
  const { bankMessage, error, isLoading } = useAccounts({
    search: "",
    branch: "all",
    minBalance: "",
    maxBalance: "",
    sortBy: "accountHolderName",
    sortOrder: "asc",
  })

  if (isLoading) {
    return (
      <Badge variant="secondary" className="gap-1">
        <Wifi className="h-3 w-3 animate-pulse" />
        Connecting...
      </Badge>
    )
  }

  if (error) {
    return (
      <Badge variant="destructive" className="gap-1">
        <AlertCircle className="h-3 w-3" />
        Connection Error
      </Badge>
    )
  }

  const isUsingMockData = bankMessage?.includes("Demo Mode")

  return (
    <Badge variant={isUsingMockData ? "secondary" : "default"} className="gap-1">
      {isUsingMockData ? (
        <>
          <WifiOff className="h-3 w-3" />
          Demo Mode
        </>
      ) : (
        <>
          <CheckCircle className="h-3 w-3" />
          Live Data
        </>
      )}
    </Badge>
  )
}
