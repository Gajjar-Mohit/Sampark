"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { type BankConfig, DEFAULT_BANK } from "@/lib/bank-config"

interface BankContextType {
  currentBank: BankConfig
  setCurrentBank: (bank: BankConfig) => void
}

const BankContext = createContext<BankContextType | undefined>(undefined)

export function BankProvider({ children }: { children: ReactNode }) {
  const [currentBank, setCurrentBank] = useState<BankConfig>(DEFAULT_BANK)

  const handleSetCurrentBank = (bank: BankConfig) => {
    console.log("[v0] BankProvider - Changing bank from:", currentBank.name, "to:", bank.name)
    setCurrentBank(bank)
  }

  console.log("[v0] BankProvider - Current bank in context:", currentBank)

  return (
    <BankContext.Provider value={{ currentBank, setCurrentBank: handleSetCurrentBank }}>
      {children}
    </BankContext.Provider>
  )
}

export function useBank() {
  const context = useContext(BankContext)
  if (context === undefined) {
    throw new Error("useBank must be used within a BankProvider")
  }
  return context
}

export { useBank as useBankContext }
