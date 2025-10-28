'use client'

import { useSession } from '@/lib/auth-client'
import { useEffect } from 'react'

export function SessionSync() {
  const { refetch } = useSession()

  useEffect(() => {
    const bc = new BroadcastChannel('better-auth-session')

    bc.onmessage = (event) => {
      if (event.data === 'refresh') {
        refetch()
      }
    }

    return () => bc.close()
  }, [refetch])

  return null
}
