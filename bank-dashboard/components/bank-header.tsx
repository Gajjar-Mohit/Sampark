"use client";

import {
  Building2,
  Bell,
  User,
  Settings,
  Home,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BankSwitcher } from "@/components/bank-switcher";
import { BankStatusIndicator } from "@/components/bank-status-indicator";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function BankHeader() {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/",
      label: "Dashboard",
      icon: Home,
      active: pathname === "/",
    },
    {
      href: "/transactions",
      label: "Transactions",
      icon: CreditCard,
      active: pathname === "/transactions",
    },
  ];

  return (
    <header className="bg-card border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-8 w-8 text-primary" />
              <div>
                <div className="flex items-center gap-2">
                  <BankSwitcher />
                  <BankStatusIndicator />
                </div>
                <p className="text-sm text-muted-foreground">
                  Account Management Dashboard
                </p>
              </div>
            </div>
          </div>

          <nav className="flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={item.active ? "default" : "ghost"}
                    size="sm"
                    className={cn(
                      "flex items-center gap-2",
                      item.active && "bg-primary text-primary-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                3
              </Badge>
            </Button>

            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>

            <div className="flex items-center gap-2 pl-4 border-l border-border">
              <div className="text-right">
                <p className="text-sm font-medium">Bank Manager</p>
                <p className="text-xs text-muted-foreground">
                  admin@brgbank.com
                </p>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
