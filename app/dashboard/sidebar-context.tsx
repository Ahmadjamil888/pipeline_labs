"use client"

import { createContext, useContext, ReactNode } from "react"

interface SidebarContextType {
  sidebarOpen: boolean
}

const SidebarContext = createContext<SidebarContextType>({ sidebarOpen: true })

export function SidebarProvider({ children, sidebarOpen }: { children: ReactNode; sidebarOpen: boolean }) {
  return (
    <SidebarContext.Provider value={{ sidebarOpen }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  return useContext(SidebarContext)
}
