"use client"

import type { ReactNode } from "react"
import { DashboardProvider } from "@/context/dashboard-context"

export function Providers({ children }: { children: ReactNode }) {
  return <DashboardProvider>{children}</DashboardProvider>
}
