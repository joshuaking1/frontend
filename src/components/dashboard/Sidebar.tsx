// src/components/dashboard/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  FileText,
  Bot,
  BookOpen,
  BarChart3,
  Settings,
  LogOut,
  Users,
  Wrench,
  Menu,
} from "lucide-react";
import { signOut } from "@/app/auth/actions";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/dashboard/teacher", icon: LayoutDashboard, label: "Dashboard" },
  {
    href: "/dashboard/teacher/lesson-planner",
    icon: Bot,
    label: "AI Lesson Planner",
  },
  {
    href: "/dashboard/teacher/assessments",
    icon: FileText,
    label: "Assessments",
  },
  {
    href: "/dashboard/teacher/advanced-tools",
    icon: Wrench,
    label: "Advanced Tools",
  },
  {
    href: "/dashboard/teacher/editor",
    icon: BookOpen,
    label: "Content Editor",
  },
  {
    href: "/dashboard/teacher/co-teacher",
    icon: Users,
    label: "AI Co-Teachers",
  },
  { href: "/dashboard/teacher/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/dashboard/teacher/settings", icon: Settings, label: "Settings" },
];

// Sidebar content component (shared between mobile and desktop)
const SidebarContent = ({ onLinkClick }: { onLinkClick?: () => void }) => {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 lg:p-6">
        <div className="font-serif text-xl lg:text-2xl font-bold text-white">
          LearnBridgeEdu
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 lg:px-6">
        <ul className="space-y-1 lg:space-y-2">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href} onClick={onLinkClick}>
                <div
                  className={`flex items-center space-x-3 p-2 lg:p-3 rounded-lg cursor-pointer transition-colors ${
                    pathname === link.href
                      ? "bg-brand-orange text-white"
                      : "hover:bg-white/10 text-slate-200 hover:text-white"
                  }`}
                >
                  <link.icon className="h-4 w-4 lg:h-5 lg:w-5 flex-shrink-0" />
                  <span className="text-sm lg:text-base font-medium">
                    {link.label}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Sign Out */}
      <div className="p-4 lg:p-6 border-t border-white/10">
        <form action={signOut}>
          <button
            type="submit"
            className="w-full flex items-center space-x-3 p-2 lg:p-3 rounded-lg text-left hover:bg-white/10 transition-colors text-slate-200 hover:text-white"
            onClick={onLinkClick}
          >
            <LogOut className="h-4 w-4 lg:h-5 lg:w-5 flex-shrink-0" />
            <span className="text-sm lg:text-base font-medium">Sign Out</span>
          </button>
        </form>
      </div>
    </div>
  );
};

// Mobile header component
const MobileHeader = ({ onMenuClick }: { onMenuClick: () => void }) => {
  return (
    <div className="lg:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between">
      <div className="font-serif text-lg font-bold text-brand-blue">
        LearnBridgeEdu
      </div>
      <Button variant="ghost" size="sm" onClick={onMenuClick} className="p-2">
        <Menu className="h-6 w-6" />
      </Button>
    </div>
  );
};

export const Sidebar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      {/* Mobile Header */}
      <MobileHeader onMenuClick={() => setIsMobileMenuOpen(true)} />

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:z-50 bg-brand-blue">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar (Sheet) */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="w-64 p-0 bg-brand-blue border-r-0">
          <SidebarContent onLinkClick={closeMobileMenu} />
        </SheetContent>
      </Sheet>
    </>
  );
};
