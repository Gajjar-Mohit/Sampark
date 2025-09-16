"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  User,
  CreditCard,
  Building2,
  Phone,
  Calendar,
  Edit,
  Save,
  X,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react"
import type { Account } from "@/lib/types"

interface AccountDetailsModalProps {
  account: Account | null
  isOpen: boolean
  onClose: () => void
}

export function AccountDetailsModal({ account, isOpen, onClose }: AccountDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedAccount, setEditedAccount] = useState<Account | null>(null)

  if (!account) return null

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getAccountStatus = (balance: number) => {
    if (balance < 1000) return { status: "Low Balance", variant: "destructive" as const, icon: AlertTriangle }
    if (balance < 10000) return { status: "Active", variant: "secondary" as const, icon: Clock }
    return { status: "Healthy", variant: "default" as const, icon: CheckCircle }
  }

  const handleEdit = () => {
    setEditedAccount({ ...account })
    setIsEditing(true)
  }

  const handleSave = () => {
    // Here you would typically make an API call to update the account
    console.log("Saving account:", editedAccount)
    setIsEditing(false)
    // You could also update the local state or trigger a refetch
  }

  const handleCancel = () => {
    setEditedAccount(null)
    setIsEditing(false)
  }

  const accountStatus = getAccountStatus(account.balance)
  const StatusIcon = accountStatus.icon

  // Mock transaction history
  const transactions = [
    { id: 1, type: "Credit", amount: 5000, description: "Salary Deposit", date: "2025-09-15T10:30:00Z" },
    { id: 2, type: "Debit", amount: -1200, description: "ATM Withdrawal", date: "2025-09-14T14:20:00Z" },
    { id: 3, type: "Credit", amount: 2500, description: "Transfer from Savings", date: "2025-09-13T09:15:00Z" },
    { id: 4, type: "Debit", amount: -800, description: "Online Purchase", date: "2025-09-12T16:45:00Z" },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account Details - {account.accountHolderName}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <Button variant="outline" size="sm" onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Account Details</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="notes">Notes & Flags</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Account Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Account Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status</span>
                    <Badge variant={accountStatus.variant} className="flex items-center gap-1">
                      <StatusIcon className="h-3 w-3" />
                      {accountStatus.status}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <Label>Account Number</Label>
                    <div className="font-mono text-sm p-2 bg-muted rounded">{account.accountNo}</div>
                  </div>

                  <div className="space-y-2">
                    <Label>Current Balance</Label>
                    <div className="text-2xl font-bold text-primary">{formatCurrency(account.balance)}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>IFSC Code</Label>
                      <div className="font-mono text-sm p-2 bg-muted rounded">{account.ifscCode}</div>
                    </div>
                    <div className="space-y-2">
                      <Label>MMID</Label>
                      <div className="font-mono text-sm p-2 bg-muted rounded">{account.mmid}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <>
                      <div className="space-y-2">
                        <Label>Account Holder Name</Label>
                        <Input
                          value={editedAccount?.accountHolderName || ""}
                          onChange={(e) =>
                            setEditedAccount((prev) => (prev ? { ...prev, accountHolderName: e.target.value } : null))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Contact Number</Label>
                        <Input
                          value={editedAccount?.accountHolderContactNo || ""}
                          onChange={(e) =>
                            setEditedAccount((prev) =>
                              prev ? { ...prev, accountHolderContactNo: e.target.value } : null,
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>PAN Card Number</Label>
                        <Input
                          value={editedAccount?.panCardNo || ""}
                          onChange={(e) =>
                            setEditedAccount((prev) => (prev ? { ...prev, panCardNo: e.target.value } : null))
                          }
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{account.accountHolderName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono">{account.accountHolderContactNo}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono">PAN: {account.panCardNo}</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Branch Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Branch Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <div className="space-y-2">
                      <Label>Branch Name</Label>
                      <Select
                        value={editedAccount?.branchName || ""}
                        onValueChange={(value) =>
                          setEditedAccount((prev) => (prev ? { ...prev, branchName: value } : null))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Double Paisa Colony Branch">Double Paisa Colony Branch</SelectItem>
                          <SelectItem value="Kharcha Kam Area Branch">Kharcha Kam Area Branch</SelectItem>
                          <SelectItem value="Pagalpan Society Branch">Pagalpan Society Branch</SelectItem>
                          <SelectItem value="Main Branch">Main Branch</SelectItem>
                          <SelectItem value="City Center Branch">City Center Branch</SelectItem>
                          <SelectItem value="Industrial Area Branch">Industrial Area Branch</SelectItem>
                          <SelectItem value="Residential Colony Branch">Residential Colony Branch</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{account.branchName}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">IFSC: {account.ifscCode}</div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Account Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Account Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Created</span>
                      <span className="text-sm text-muted-foreground">{formatDate(account.createdAt)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Last Updated</span>
                      <span className="text-sm text-muted-foreground">{formatDate(account.updatedAt)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            transaction.type === "Credit" ? "bg-green-500" : "bg-red-500"
                          }`}
                        />
                        <div>
                          <div className="font-medium">{transaction.description}</div>
                          <div className="text-sm text-muted-foreground">{formatDate(transaction.date)}</div>
                        </div>
                      </div>
                      <div
                        className={`font-semibold ${transaction.type === "Credit" ? "text-green-600" : "text-red-600"}`}
                      >
                        {transaction.type === "Credit" ? "+" : ""}
                        {formatCurrency(transaction.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Account Notes & Flags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Internal Notes</Label>
                  <Textarea placeholder="Add internal notes about this account..." className="min-h-[100px]" />
                </div>

                <div className="space-y-2">
                  <Label>Account Flags</Label>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">Regular Customer</Badge>
                    <Badge variant="secondary">High Value</Badge>
                    {account.balance < 1000 && <Badge variant="destructive">Low Balance Alert</Badge>}
                  </div>
                </div>

                <Button className="w-full">Save Notes & Flags</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
