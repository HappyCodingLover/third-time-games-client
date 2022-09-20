import { Button } from 'flowbite-react'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useLeaderboardContext } from '../context/LeaderboardContext'
import styles from '../styles/Leaderboard.module.css'

const LeaderboardTable = () => {
  // use values from context
  const { data, status, error, fetchData, setData } = useLeaderboardContext()
  const [eventName, setEventName] = useState<string | undefined>()
  const [range, setRange] = useState<string | undefined>()
  const [sortOrder, setSortOrder] = useState(-1)
  const [prevPage, setPrevPage] = useState(-1)

  // value for refreshing status
  const [isRefreshing, setIsRefreshing] = useState(false)

  const entities = useMemo(() => {
    return data?.entities
  }, [data])

  // get next page value in data from server
  const nextPage = useMemo(() => {
    if (data?.nextPage) return Number(data.nextPage)
    return -1
  }, [data])

  const handleChangeEventName = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const result = event.target.value.replace(/[^a-z]/gi, '')
      setEventName(result)
    },
    []
  )

  // makes refresh request
  const handleRefresh = useCallback(() => {
    if (eventName && range && status === 'resolved' && !isRefreshing) {
      fetchData(eventName, range, 1, -1)
      setPrevPage(-1)
      setSortOrder(-1)

      // prevents refreshing continuously
      setIsRefreshing(true)
      const hd = setTimeout(() => {
        setIsRefreshing(false)
        clearTimeout(hd)
      }, 500)
    }
  }, [eventName, range, status, isRefreshing])

  // fetches next page data
  const handleNext = useCallback(() => {
    if (eventName && range && Number(nextPage) > 1) {
      fetchData(eventName, range, nextPage, sortOrder)
      setPrevPage(nextPage - 1)
    }
  }, [nextPage, eventName, range, sortOrder])

  // fetches previous page data
  const handleBefore = useCallback(() => {
    if (eventName && range) {
      if (Number(nextPage) > 2)
        fetchData(eventName, range, Number(nextPage) - 2, sortOrder)
      else if (prevPage > 0) {
        fetchData(eventName, range, prevPage, sortOrder)
      }
    }
  }, [nextPage, eventName, range, sortOrder])

  // changes sort order
  const handleChangeRank = useCallback(() => {
    if (sortOrder === -1) setSortOrder(1)
    else setSortOrder(-1)
  }, [sortOrder])

  // fetches data when changing event name and range
  useEffect(() => {
    if (eventName && range) {
      fetchData(eventName, range, 1, sortOrder)
    }
  }, [eventName, range, sortOrder])

  useEffect(() => {
    if (eventName === '' && range !== undefined) {
      setData(null)
    }
  }, [eventName, range])

  // disables before button if it is not needed
  const beforeDisabled = useMemo(
    () => Boolean(!eventName || !range || !nextPage || nextPage === 2),
    [nextPage, eventName, range]
  )

  // disables next button if it is not needed
  const nextDisabled = useMemo(
    () => Boolean(!eventName || !range || !nextPage || nextPage < 2),
    [nextPage, eventName, range]
  )

  return (
    <div className='overflow-x-auto'>
      <form className='w-full flex items-center justify-center'>
        <div className='grid gap-6 mb-12 md:grid-cols-1'>
          <div>
            <div className='relative w-full'>
              <div className='flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none'>
                <svg
                  aria-hidden='true'
                  className='w-5 h-5 text-gray-500 dark:text-gray-400'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                  xmlns='http://www.w3.org/2000/svg'>
                  <path
                    fillRule='evenodd'
                    d='M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z'
                    clipRule='evenodd'></path>
                </svg>
              </div>
              <input
                type='text'
                id='simple-search'
                className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                placeholder='Event Name'
                value={eventName ?? ''}
                onChange={handleChangeEventName}
              />
            </div>
          </div>
          <div>
            <select
              id='default'
              className='bg-gray-50 border border-gray-300 text-gray-900 mb-6 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
              value={range}
              onChange={(e) => setRange(e.target.value)}>
              <option hidden value={undefined}>
                Choose a range
              </option>
              <option value='global'>Global Leaderboard</option>
              <option value='hundred'>Top 100</option>
            </select>
          </div>
        </div>
      </form>
      {status === 'idle' ? (
        <div>Please enter event name and range</div>
      ) : status === 'rejected' ? (
        <div>{error}</div>
      ) : (
        <div className=''>
          <table className='w-full text-sm text-left text-gray-500 dark:text-gray-400 shadow-md'>
            <thead className='text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400'>
              <tr>
                <th scope='col' className='py-3 px-6'>
                  <div className='flex items-center'>
                    Rank
                    <button type='button' onClick={handleChangeRank}>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='ml-1 w-3 h-3'
                        aria-hidden='true'
                        fill='currentColor'
                        viewBox='0 0 320 512'>
                        <path d='M27.66 224h264.7c24.6 0 36.89-29.78 19.54-47.12l-132.3-136.8c-5.406-5.406-12.47-8.107-19.53-8.107c-7.055 0-14.09 2.701-19.45 8.107L8.119 176.9C-9.229 194.2 3.055 224 27.66 224zM292.3 288H27.66c-24.6 0-36.89 29.77-19.54 47.12l132.5 136.8C145.9 477.3 152.1 480 160 480c7.053 0 14.12-2.703 19.53-8.109l132.3-136.8C329.2 317.8 316.9 288 292.3 288z' />
                      </svg>
                    </button>
                  </div>
                </th>
                <th scope='col' className='py-3 px-6'>
                  Gamer Name
                </th>
                <th scope='col' className='py-3 px-6'>
                  Profile Pic
                </th>
                <th scope='col' className='py-3 px-6'>
                  Score
                </th>
              </tr>
            </thead>
            <tbody>
              {entities?.map((entity: any, index: number) => (
                <tr
                  key={(entity?.id ?? '') + (entity?.rank ?? index)}
                  className='bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-600'>
                  <td className='p-4 w-4'>
                    <div className='flex items-center'>{entity?.rank}</div>
                  </td>
                  <td className={`py-4 px-6 ${styles['wide-td']}`}>
                    <div className='flex items-center'>{entity?.name}</div>
                  </td>
                  <td className='py-4 px-6'>
                    <div className='flex items-center'>
                      <img
                        className='w-10 h-10 rounded-full'
                        src={`/avatars/${entity?.pic}`}
                        alt={entity?.name ?? ''}
                      />
                    </div>
                  </td>
                  <td className='py-4 px-6'>
                    <div className='flex items-center'>
                      {entity?.score ?? 0}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <nav
            className='flex justify-end items-center pt-2'
            aria-label='Table navigation'>
            <ul className='inline-flex items-center -space-x-px'>
              <li>
                <button
                  type='button'
                  onClick={handleBefore}
                  disabled={beforeDisabled}
                  className='block py-2 px-3 ml-0 leading-tight text-gray-500 bg-white rounded-l-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'>
                  <span className='sr-only'>Previous</span>
                  <svg
                    className='w-5 h-5'
                    aria-hidden='true'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                    xmlns='http://www.w3.org/2000/svg'>
                    <path
                      fillRule='evenodd'
                      d='M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z'
                      clipRule='evenodd'></path>
                  </svg>
                </button>
              </li>
              <li>
                <button
                  type='button'
                  onClick={handleNext}
                  disabled={nextDisabled}
                  className='block py-2 px-3 leading-tight text-gray-500 bg-white rounded-r-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'>
                  <span className='sr-only'>Next</span>
                  <svg
                    className='w-5 h-5'
                    aria-hidden='true'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                    xmlns='http://www.w3.org/2000/svg'>
                    <path
                      fillRule='evenodd'
                      d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z'
                      clipRule='evenodd'></path>
                  </svg>
                </button>
              </li>
            </ul>
          </nav>
          <div className='flex justify-center'>
            {status !== 'idle' && (
              <Button
                disabled={isRefreshing}
                onClick={handleRefresh}
                color='light'>
                {isRefreshing ? (
                  <>
                    <svg
                      role='status'
                      className='inline mr-3 w-4 h-4 text-white animate-spin'
                      viewBox='0 0 100 101'
                      fill='none'
                      xmlns='http://www.w3.org/2000/svg'>
                      <path
                        d='M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z'
                        fill='#E5E7EB'
                      />
                      <path
                        d='M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z'
                        fill='currentColor'
                      />
                    </svg>
                    Refreshing
                  </>
                ) : (
                  <>Refresh Leaderboard</>
                )}
              </Button>
            )}
          </div>
        </div>
      )}
      {(status === 'pending' || isRefreshing) && (
        <div
          className={`absolute top-0 left-0 w-full h-full flex items-center justify-center fb-bg-loading ${styles['loading']}`}>
          <div role='status'>
            <svg
              className='inline mr-2 w-10 h-10 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600'
              viewBox='0 0 100 101'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'>
              <path
                d='M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z'
                fill='currentColor'
              />
              <path
                d='M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z'
                fill='currentFill'
              />
            </svg>
            <span className='sr-only'>Loading...</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default LeaderboardTable
