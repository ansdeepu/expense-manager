
import React from "react";
import { Header } from "@/components/dashboard/header";
import { ReportDateProvider } from "@/context/report-date-context";
import { AuthGuard } from "@/components/dashboard/auth-guard";

export default async function DashboardLayout(props: {
  children: React.ReactNode;
  params: Promise<any>;
}) {
  // Await params for Next.js 15 compatibility
  await props.params;

  return (
      <AuthGuard>
        <ReportDateProvider>
            <div className="flex min-h-screen w-full flex-col overflow-x-hidden bg-background">
                <Header />
                <main className="mx-auto w-full max-w-7xl flex-1 p-4 md:p-6 lg:p-8">{props.children}</main>
            </div>
        </ReportDateProvider>
      </AuthGuard>
  );
}
