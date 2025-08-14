
"use client"

import { SessionProvider as NextSessionProvider } from "next-auth/react"
import { ReactNode } from "react"

interface SessionProviderProps {
  children: ReactNode
}

export function SessionProvider({ children }: SessionProviderProps) {
  return (
    <NextSessionProvider>
      {children}
    </NextSessionProvider>
  )
}