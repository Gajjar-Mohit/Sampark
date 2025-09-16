"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Filter,
  Download,
  ArrowUpDown,
  Eye,
  Edit,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AdvancedFilters } from "@/components/advanced-filters";
import { AccountDetailsModal } from "@/components/account-details-modal";
import { useAccounts } from "@/hooks/use-accounts";
import type { AccountFilters, Account } from "@/lib/types";

export function AccountsTable() {
  const [filters, setFilters] = useState<AccountFilters>({
    search: "",
    branch: "all",
    minBalance: "",
    maxBalance: "",
    sortBy: "accountHolderName",
    sortOrder: "asc",
  });

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [showAccountDetails, setShowAccountDetails] = useState(false);

  const { accounts, total, isLoading, error } = useAccounts(filters);

  const updateFilter = (key: keyof AccountFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toggleSort = (column: string) => {
    if (filters.sortBy === column) {
      updateFilter("sortOrder", filters.sortOrder === "asc" ? "desc" : "asc");
    } else {
      updateFilter("sortBy", column);
      updateFilter("sortOrder", "asc");
    }
  };

  const handleViewAccount = (account: Account) => {
    setSelectedAccount(account);
    setShowAccountDetails(true);
  };

  const handleEditAccount = (account: Account) => {
    setSelectedAccount(account);
    setShowAccountDetails(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getBalanceColor = (balance: number) => {
    if (balance < 1000) return "text-destructive";
    if (balance < 10000) return "text-orange-600";
    return "text-primary";
  };

  const branches = [
    "all",
    "Double Paisa Colony Branch",
    "Kharcha Kam Area Branch",
    "Pagalpan Society Branch",
    "Main Branch",
    "City Center Branch",
    "Industrial Area Branch",
    "Residential Colony Branch",
  ];

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            Error loading accounts. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <AdvancedFilters
        filters={filters}
        onFiltersChange={setFilters}
        isOpen={showAdvancedFilters}
        onToggle={() => setShowAdvancedFilters(!showAdvancedFilters)}
      />

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-xl font-semibold">
              Account Management
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm">Add Account</Button>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search accounts, PAN, phone..."
                value={filters.search}
                onChange={(e) => updateFilter("search", e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              value={filters.branch}
              onValueChange={(value) => updateFilter("branch", value)}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Select branch" />
              </SelectTrigger>
              <SelectContent>
                {branches.map((branch) => (
                  <SelectItem key={branch} value={branch}>
                    {branch === "all" ? "All Branches" : branch}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Input
                placeholder="Min balance"
                type="number"
                value={filters.minBalance}
                onChange={(e) => updateFilter("minBalance", e.target.value)}
                className="w-32"
              />
              <Input
                placeholder="Max balance"
                type="number"
                value={filters.maxBalance}
                onChange={(e) => updateFilter("maxBalance", e.target.value)}
                className="w-32"
              />
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {accounts.length} of {total} accounts
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => toggleSort("accountHolderName")}
                        className="h-auto p-0 font-semibold hover:bg-transparent"
                      >
                        Account Holder
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => toggleSort("accountNo")}
                        className="h-auto p-0 font-semibold hover:bg-transparent"
                      >
                        Account No.
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => toggleSort("balance")}
                        className="h-auto p-0 font-semibold hover:bg-transparent"
                      >
                        Balance
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => toggleSort("createdAt")}
                        className="h-auto p-0 font-semibold hover:bg-transparent"
                      >
                        Created
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.map((account) => (
                    <TableRow key={account.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {account.accountHolderName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            PAN: {account.panCardNo}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-sm">
                          {account.accountNo}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          MMID: {account.mmid}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div
                          className={`font-semibold ${getBalanceColor(
                            account.balance
                          )}`}
                        >
                          {formatCurrency(account.balance)}
                        </div>
                        {account.balance < 1000 && (
                          <Badge variant="destructive" className="text-xs mt-1">
                            Low Balance
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{account.branchName}</div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {account.ifscCode}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-mono">
                          {account.accountHolderContactNo}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(account.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleViewAccount(account)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEditAccount(account)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Account
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {accounts.length === 0 && !isLoading && (
            <div className="text-center py-8 text-muted-foreground">
              No accounts found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>

      <AccountDetailsModal
        account={selectedAccount}
        isOpen={showAccountDetails}
        onClose={() => {
          setShowAccountDetails(false);
          setSelectedAccount(null);
        }}
      />
    </div>
  );
}
