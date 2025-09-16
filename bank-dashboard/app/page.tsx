import { BankHeader } from "@/components/bank-header"
import { AccountsOverview } from "@/components/accounts-overview"
import { AccountsTable } from "@/components/accounts-table"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { TransactionsTable } from "@/components/transactions-table"

export default function BankDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <BankHeader />
      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-6">
            {/* <AccountsOverview /> */}
            <AccountsTable />
            <TransactionsTable />
          </div>
          <div className="lg:w-80">
            <AnalyticsDashboard />
          </div>
        </div>
      </main>
    </div>
  )
}
