// src/components/dashboard/StudentSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Compass,
  MessageSquare,
  Trophy,
  User,
  LogOut,
} from "lucide-react";
import { signOut } from "@/app/auth/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // We'll add this next

const navLinks = [
  { href: "/dashboard/student", icon: Home, label: "Home" },
  {
    href: "/dashboard/student/explore",
    icon: Compass,
    label: "Explore Subjects",
  },
  {
    href: "/dashboard/student/social",
    icon: MessageSquare,
    label: "My Study Circles",
  },
  {
    href: "/dashboard/student/achievements",
    icon: Trophy,
    label: "Achievements",
  },
];

export const StudentSidebar = ({
  userName,
  avatarUrl,
}: {
  userName: string;
  avatarUrl?: string;
}) => {
  const pathname = usePathname();
  const fallbackInitial = userName ? userName.charAt(0).toUpperCase() : "U";

  return (
    <aside className="w-72 h-screen flex flex-col bg-white border-r p-6 fixed">
      <div className="font-serif text-2xl font-bold text-brand-blue mb-8">
        LearnBridgeEdu
      </div>

      {/* User Profile Section */}
      <div className="flex items-center space-x-4 mb-10">
        <Avatar className="h-12 w-12">
          <AvatarImage src={avatarUrl} alt={userName} />
          <AvatarFallback className="bg-brand-orange text-white text-xl">
            {fallbackInitial}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold text-brand-blue">{userName}</p>
          <Link
            href="/dashboard/student/profile"
            className="text-sm text-slate-500 hover:underline"
          >
            View Profile
          </Link>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-grow">
        <p className="text-sm font-semibold text-slate-400 mb-4 px-2">MENU</p>
        <ul className="space-y-2">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href}>
                <div
                  className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors font-semibold ${
                    pathname === link.href
                      ? "bg-brand-orange text-white"
                      : "text-slate-600 hover:bg-slate-100"
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

      {/* Sign Out */}
      <div>
        <form action={signOut}>
          <button
            type="submit"
            className="w-full flex items-center space-x-3 p-3 rounded-lg text-left text-slate-600 hover:bg-slate-100 transition-colors font-semibold"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </form>
      </div>
    </aside>
  );
};
