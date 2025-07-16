// src/components/dashboard/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Bot,
  BookOpen,
  BarChart3,
  Settings,
  LogOut,
  Users,
} from "lucide-react";
import { signOut } from "@/app/auth/actions"; // Import the server action

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
    href: "/dashboard/teacher/resources",
    icon: BookOpen,
    label: "My Resources",
  },
  {
    href: "/dashboard/teacher/co-teacher",
    icon: Users,
    label: "AI Co-Teachers",
  },
  { href: "/dashboard/teacher/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/dashboard/teacher/settings", icon: Settings, label: "Settings" },
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen flex flex-col bg-brand-blue text-white p-4 fixed">
      <div className="font-serif text-2xl font-bold mb-10 pl-2">
        LearnBridgeEdu
      </div>
      <nav className="flex-grow">
        <ul className="space-y-2">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href}>
                <div
                  className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-colors ${
                    pathname === link.href
                      ? "bg-brand-orange text-white"
                      : "hover:bg-white/10"
                  }`}
                >
                  <link.icon className="h-5 w-5" />
                  <span>{link.label}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div>
        {/* Use a form to wrap the sign out button */}
        <form action={signOut}>
          <button
            type="submit"
            className="w-full flex items-center space-x-3 p-2 rounded-lg text-left hover:bg-white/10 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </form>
      </div>
    </aside>
  );
};
