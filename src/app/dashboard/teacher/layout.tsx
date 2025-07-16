// src/app/dashboard/teacher/layout.tsx
import { Sidebar } from "@/components/dashboard/Sidebar";

export default function TeacherDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 bg-slate-100 min-h-screen">
        {children}
      </main>
    </div>
  );
}
