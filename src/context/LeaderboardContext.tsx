import { PropsWithChildren, useCallback, useMemo } from 'react'
import { createContext, useContext } from 'react'
import { fetchDataByEvent } from '../api'
import useAsync from '../hooks'

interface LeaderboardContextProps {
  fetchData: (
    eventName: string,
    range: string,
    page?: number,
    size?: number,
    sortOrder?: number
  ) => void
  data: any
  setData: (data: any) => void
  status: string
  error: any
}

export const LeaderboardContext = createContext<LeaderboardContextProps>(
  undefined!
)

export function LeaderboardLayout({
  children,
}: PropsWithChildren<Record<string, unknown>>) {
  const { status, error, data, run, setData } = useAsync()

  const fetchData = useCallback(
    (eventName: string, range: string, page = 0, sortOrder = 1, size = 5) => {
      run(fetchDataByEvent(eventName, range, page, size, sortOrder))
    },
    []
  )
  return (
    <LeaderboardContext.Provider
      value={{ fetchData, data, setData, status, error }}>
      {children}
    </LeaderboardContext.Provider>
  )
}

export default LeaderboardLayout

export function useLeaderboardContext(): LeaderboardContextProps {
  const context = useContext(LeaderboardContext)

  if (!context) {
    throw new Error(
      'useLeaderboardContext should be used within the LeaderboardContext provider!'
    )
  }

  return context
}
