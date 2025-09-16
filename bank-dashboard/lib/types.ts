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
