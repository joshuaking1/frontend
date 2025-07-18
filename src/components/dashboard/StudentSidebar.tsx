// frontend/src/components/dashboard/StudentSidebar.tsx
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
  Book,
  BrainCircuit,
  PenSquare,
  Camera,
  GraduationCap,
  BarChart,
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

export const StudentSidebar = ({
  userName,
  avatarUrl,
  userId,
}: {
  userName: string;
  avatarUrl?: string;
  userId: string;
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
    <aside className="w-72 h-screen flex flex-col bg-white border-r fixed">
      <div className="p-4 border-b">
        <Link href="/dashboard/student">
          <span className="font-serif text-2xl font-bold text-brand-blue">
            LearnBridgeEdu
          </span>
        </Link>
      </div>

      <div className="p-4 flex items-center space-x-4 border-b">
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
          >
            View Profile
          </Link>
        </div>
      </div>

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
                      <Link href={item.href}>
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

      <div className="p-4 border-t">
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
