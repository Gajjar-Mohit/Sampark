import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, CreditCard, TrendingUp, AlertTriangle } from "lucide-react"

export function AccountsOverview() {
  const stats = [
    {
      title: "Total Accounts",
      value: "1,247",
      change: "+12%",
      icon: Users,
      trend: "up",
    },
    {
      title: "Total Balance",
      value: "₹62,35,000",
      change: "+8.2%",
      icon: CreditCard,
      trend: "up",
    },
    {
      title: "Active Accounts",
      value: "1,198",
      change: "+5.1%",
      icon: TrendingUp,
      trend: "up",
    },
    {
      title: "Flagged Accounts",
      value: "23",
      change: "-2",
      icon: AlertTriangle,
      trend: "down",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            <p className={`text-xs ${stat.trend === "up" ? "text-primary" : "text-destructive"}`}>
              {stat.change} from last month
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
