import { NextResponse } from "next/server"
import { MOCK_BANK_DATA } from "@/lib/mock-data"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const bankUrl = searchParams.get("bankUrl") || "http://localhost:3001"
  const search = searchParams.get("search")
  const branch = searchParams.get("branch")
  const minBalance = searchParams.get("minBalance")
  const maxBalance = searchParams.get("maxBalance")
  const sortBy = searchParams.get("sortBy") || "accountHolderName"
  const sortOrder = searchParams.get("sortOrder") || "asc"

  let bankData
  let isUsingMockData = false

  try {
    const response = await fetch(`${bankUrl}/api/v1/account/all`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(5000),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const apiResponse = await response.json()

    if (apiResponse.status === "Success" && apiResponse.data) {
      bankData = apiResponse
    } else {
      throw new Error(`API returned status: ${apiResponse.status}`)
    }
  } catch (error) {
    console.log(`Bank API at ${bankUrl} unavailable, using mock data:`, error)
    bankData = MOCK_BANK_DATA[bankUrl as keyof typeof MOCK_BANK_DATA]
    isUsingMockData = true

    if (!bankData) {
      return NextResponse.json(
        {
          status: "Error",
          message: `No data available for bank at ${bankUrl}`,
          data: [],
          total: 0,
          error: "Bank not configured",
        },
        { status: 404 },
      )
    }
  }

  let filteredData = [...(bankData.data || [])]

  // Apply search filter
  if (search) {
    filteredData = filteredData.filter(
      (account) =>
        account.accountHolderName?.toLowerCase().includes(search.toLowerCase()) ||
        account.accountNo?.includes(search) ||
        account.panCardNo?.toLowerCase().includes(search.toLowerCase()) ||
        account.accountHolderContactNo?.includes(search),
    )
  }

  // Apply branch filter
  if (branch && branch !== "all") {
    filteredData = filteredData.filter((account) => account.branchName?.toLowerCase().includes(branch.toLowerCase()))
  }

  // Apply balance filters
  if (minBalance) {
    filteredData = filteredData.filter((account) => account.balance >= Number.parseInt(minBalance))
  }
  if (maxBalance) {
    filteredData = filteredData.filter((account) => account.balance <= Number.parseInt(maxBalance))
  }

  // Apply sorting
  filteredData.sort((a, b) => {
    let aValue = a[sortBy as keyof typeof a]
    let bValue = b[sortBy as keyof typeof b]

    if (typeof aValue === "string") {
      aValue = aValue.toLowerCase()
      bValue = (bValue as string).toLowerCase()
    }

    if (sortOrder === "desc") {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
    return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
  })

  return NextResponse.json({
    status: bankData.status || "Success",
    message: isUsingMockData
      ? `${bankData.message} (Demo Mode - API Unavailable)`
      : bankData.message || "Accounts fetched successfully",
    data: filteredData,
    total: filteredData.length,
    isUsingMockData,
    filters: {
      search,
      branch,
      minBalance,
      maxBalance,
      sortBy,
      sortOrder,
    },
  })
}
