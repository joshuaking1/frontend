// frontend/src/components/dashboard/StudentSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Home,
  Compass,
  MessageSquare,
  Trophy,
  User,
  LogOut,
  Book,
  BrainCircuit,
  PenSquare,
  Camera,
  GraduationCap,
  BarChart,
  Menu,
} from "lucide-react";
import { signOut } from "@/app/auth/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

// The new, 100x data structure for our navigation
const navGroups = [
  {
    title: "Dashboard",
    items: [
      { href: "/dashboard/student", icon: Home, label: "Home" },
      {
        href: "/dashboard/student/explore",
        icon: Compass,
        label: "Explore Subjects",
      },
    ],
  },
  {
    title: "AI Tools",
    items: [
      {
        href: "/dashboard/student/chat",
        icon: MessageSquare,
        label: "AI Tutor",
      },
      {
        href: "/dashboard/student/snap-solve",
        icon: Camera,
        label: "Snap & Solve",
      },
      {
        href: "/dashboard/student/essay-helper",
        icon: PenSquare,
        label: "Essay Helper",
      },
    ],
  },
  {
    title: "Knowledge Hub",
    items: [
      { href: "/dashboard/student/notes", icon: Book, label: "Notes & Decks" },
      {
        href: "/dashboard/student/review",
        icon: BrainCircuit,
        label: "Spaced Repetition",
      },
      {
        href: "/dashboard/student/graph",
        icon: BarChart,
        label: "Knowledge Graph",
      },
    ],
  },
  {
    title: "Progress",
    items: [
      {
        href: "/dashboard/student/exams",
        icon: GraduationCap,
        label: "Mock Exams",
      },
      {
        href: "/dashboard/student/achievements",
        icon: Trophy,
        label: "Achievements",
      },
    ],
  },
];

// Sidebar content component (shared between mobile and desktop)
const SidebarContent = ({
  userName,
  avatarUrl,
  userId,
  onLinkClick,
}: {
  userName: string;
  avatarUrl?: string;
  userId: string;
  onLinkClick?: () => void;
}) => {
  const pathname = usePathname();
  const fallbackInitial = userName ? userName.charAt(0).toUpperCase() : "U";

  const getActiveGroup = () => {
    for (const group of navGroups) {
      for (const item of group.items) {
        if (pathname.startsWith(item.href)) {
          return group.title;
        }
      }
    }
    return "Dashboard"; // Default open group
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 lg:p-6 border-b">
        <Link href="/dashboard/student" onClick={onLinkClick}>
          <span className="font-serif text-2xl font-bold text-brand-blue">
            LearnBridgeEdu
          </span>
        </Link>
      </div>

      {/* User Profile */}
      <div className="p-4 lg:p-6 flex items-center space-x-4 border-b">
        <Avatar className="h-12 w-12">
          <AvatarImage src={avatarUrl} alt={userName} />
          <AvatarFallback className="bg-brand-orange text-white text-xl">
            {fallbackInitial}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold text-brand-blue">{userName}</p>
          <Link
            href={`/dashboard/profile/${userId}`}
            className="text-sm text-slate-500 hover:underline"
            onClick={onLinkClick}
          >
            View Profile
          </Link>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-grow">
        <Accordion
          type="single"
          collapsible
          defaultValue={getActiveGroup()}
          className="w-full px-4 py-2"
        >
          {navGroups.map((group) => (
            <AccordionItem
              key={group.title}
              value={group.title}
              className="border-b-0"
            >
              <AccordionTrigger className="py-2 text-sm font-semibold uppercase text-slate-500 hover:no-underline hover:text-brand-blue">
                {group.title}
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-1 pl-2">
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} onClick={onLinkClick}>
                        <div
                          className={`flex items-center space-x-3 p-2 rounded-md cursor-pointer transition-colors font-semibold ${
                            pathname.startsWith(item.href)
                              ? "bg-brand-orange/10 text-brand-orange"
                              : "text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          <item.icon className="h-5 w-5" />
                          <span>{item.label}</span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ScrollArea>

      {/* Sign Out */}
      <div className="p-4 lg:p-6 border-t">
        <form action={signOut}>
          <button
            type="submit"
            className="w-full flex items-center space-x-3 p-3 rounded-lg text-left text-slate-600 hover:bg-slate-100 transition-colors font-semibold"
            onClick={onLinkClick}
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </form>
      </div>
    </div>
  );
};

// Floating hamburger menu button for mobile
const FloatingMenuButton = ({
  onMenuClick,
}: {
  onMenuClick: () => void;
}) => {
  return (
    <Button
      variant="default"
      size="sm"
      onClick={onMenuClick}
      className="lg:hidden fixed top-4 left-4 z-50 bg-brand-blue hover:bg-brand-blue/90 text-white shadow-lg rounded-full p-3"
      aria-label="Open menu"
    >
      <Menu className="h-5 w-5" />
    </Button>
  );
};

export const StudentSidebar = ({
  userName,
  avatarUrl,
  userId,
}: {
  userName: string;
  avatarUrl?: string;
  userId: string;
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      {/* Floating Hamburger Button - Only visible on mobile/tablet */}
      <FloatingMenuButton onMenuClick={() => setIsMobileMenuOpen(true)} />

      {/* Desktop Sidebar - Only visible on large screens */}
      <aside className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 lg:z-40 bg-white border-r shadow-lg">
        <SidebarContent
          userName={userName}
          avatarUrl={avatarUrl}
          userId={userId}
        />
      </aside>

      {/* Mobile Sidebar Sheet */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent
          side="left"
          className="w-72 p-0 bg-white border-r-0 shadow-xl"
        >
          <SidebarContent
            userName={userName}
            avatarUrl={avatarUrl}
            userId={userId}
            onLinkClick={closeMobileMenu}
          />
        </SheetContent>
      </Sheet>
    </>
  );
};