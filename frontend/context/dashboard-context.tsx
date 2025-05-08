"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface DashboardInfo {
  server: string
  dashboard: string
  metrics: string[]
  category: string
  metric: string
}

interface DashboardContextType {
  dashboardInfo: DashboardInfo
  setDashboardInfo: (info: Partial<DashboardInfo>) => void
}

const initialDashboardInfo: DashboardInfo = {
  server: "",
  dashboard: "",
  metrics: [],
  category: "",
  metric: "",
}

const DashboardContext = createContext<DashboardContextType>({
  dashboardInfo: initialDashboardInfo,
  setDashboardInfo: () => {},
})

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [dashboardInfo, setDashboardInfoState] = useState<DashboardInfo>(initialDashboardInfo)

  const setDashboardInfo = (info: Partial<DashboardInfo>) => {
    setDashboardInfoState((prev) => ({ ...prev, ...info }))
  }

  return <DashboardContext.Provider value={{ dashboardInfo, setDashboardInfo }}>{children}</DashboardContext.Provider>
}

export const useDashboardContext = () => useContext(DashboardContext)
