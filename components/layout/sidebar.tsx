"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useAuth } from "@/contexts/auth-context"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Menu,
  Home,
  BarChart3,
  TrendingUp,
  Calendar,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronDown,
  DollarSign,
  PieChart,
  Users,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { 
    name: "Jastip", 
    icon: DollarSign,
    children: [
      { name: "Pengeluaran", href: "/pengeluaran", icon: TrendingUp },
      { name: "Pendapatan", href: "/pendapatan", icon: BarChart3 },
      { name: "Periode", href: "/periods", icon: Calendar },
      { name: "Analytics", href: "/analytics", icon: PieChart },
    ]
  },
  { name: "Jastiper", href: "/jastipers", icon: Users },
  { name: "Pengeluaran Bulanan", href: "/monthly-expenses", icon: TrendingUp },
  { name: "Pengaturan", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const { logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<string[]>([])

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  const toggleMenu = (menuName: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuName) 
        ? prev.filter(name => name !== menuName)
        : [...prev, menuName]
    )
  }

  const isMenuExpanded = (menuName: string) => expandedMenus.includes(menuName)

  // Auto-expand menu if current path is a child
  useEffect(() => {
    navigation.forEach(item => {
      if (item.children) {
        const hasActiveChild = item.children.some(child => pathname === child.href)
        if (hasActiveChild && !expandedMenus.includes(item.name)) {
          setExpandedMenus(prev => [...prev, item.name])
        }
      }
    })
  }, [pathname, expandedMenus])

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">J</span>
          </div>
          {!isCollapsed && (
            <span className="font-bold text-lg text-foreground">JastipdiGW</span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3">
        <nav className="space-y-1">
          {navigation.map((item) => {
            if (item.children) {
              // Dropdown menu item
              const isExpanded = isMenuExpanded(item.name)
              const hasActiveChild = item.children.some(child => pathname === child.href)
              
              return (
                <div key={item.name}>
                  <Button
                    variant={hasActiveChild ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3",
                      hasActiveChild && "bg-secondary text-secondary-foreground"
                    )}
                    onClick={() => toggleMenu(item.name)}
                  >
                    <item.icon className="h-4 w-4" />
                    {!isCollapsed && (
                      <>
                        <span className="flex-1 text-left">{item.name}</span>
                        <ChevronDown 
                          className={cn(
                            "h-4 w-4 transition-transform duration-200",
                            isExpanded ? "rotate-180" : ""
                          )} 
                        />
                      </>
                    )}
                  </Button>
                  
                  {/* Dropdown children */}
                  {!isCollapsed && isExpanded && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.children.map((child) => {
                        const isActive = pathname === child.href
                        return (
                          <Button
                            key={child.name}
                            variant={isActive ? "secondary" : "ghost"}
                            size="sm"
                            className={cn(
                              "w-full justify-start gap-3 h-8 text-sm",
                              isActive && "bg-secondary text-secondary-foreground"
                            )}
                            onClick={() => router.push(child.href)}
                          >
                            <child.icon className="h-3 w-3" />
                            <span>{child.name}</span>
                          </Button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            } else {
              // Regular menu item
              const isActive = pathname === item.href
              return (
                <Button
                  key={item.name}
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3",
                    isActive && "bg-secondary text-secondary-foreground"
                  )}
                  onClick={() => router.push(item.href)}
                >
                  <item.icon className="h-4 w-4" />
                  {!isCollapsed && <span>{item.name}</span>}
                </Button>
              )
            }
          })}
        </nav>
      </ScrollArea>

      {/* User & Logout */}
      <div className="border-t p-3">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && <span>Logout</span>}
        </Button>
      </div>

      {/* Collapse Toggle */}
      <div className="border-t p-3">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-center"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")} />
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <div
          className={cn(
            "flex h-screen flex-col border-r bg-background transition-all duration-300",
            isCollapsed ? "w-16" : "w-64"
          )}
        >
          <SidebarContent />
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="px-3 pt-3 pb-2">
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  )
}
