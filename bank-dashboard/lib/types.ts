export interface Account {
  id: string
  balance: number
  accountNo: string
  accountHolderName: string
  accountHolderContactNo: string
  ifscCode: string
  mmid: string
  branchName: string
  panCardNo: string
  createdAt: string
  updatedAt: string
}

export interface AccountsResponse {
  status: string
  message: string
  data: Account[]
  total?: number
  filters?: {
    search?: string | null
    branch?: string | null
    minBalance?: string | null
    maxBalance?: string | null
    sortBy?: string | null
    sortOrder?: string | null
  }
}

export interface AccountFilters {
  search: string
  branch: string
  minBalance: string
  maxBalance: string
  sortBy: string
  sortOrder: "asc" | "desc"
}

export interface Transaction {
  id: string
  amount: number
  accountId: string
  transactionId: string
  description: string
  createdAt: string
  updatedAt: string
  mode: "DEBIT" | "CREDIT"
}

export interface TransactionsResponse {
  status: string
  message: string
  data: Transaction[]
  total?: number
  filters?: {
    search?: string | null
    accountId?: string | null
    mode?: string | null
    minAmount?: string | null
    maxAmount?: string | null
    dateFrom?: string | null
    dateTo?: string | null
    sortBy?: string | null
    sortOrder?: string | null
  }
}

export interface TransactionFilters {
  search: string
  accountId: string
  mode: string
  minAmount: string
  maxAmount: string
  dateFrom: string
  dateTo: string
  sortBy: string
  sortOrder: "asc" | "desc"
}
