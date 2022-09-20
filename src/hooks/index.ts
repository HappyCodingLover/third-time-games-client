import React, { useReducer } from 'react'

type PendingAction = {
  type: 'pending'
}

type ResolvedAction<T> = {
  type: 'resolved'
  data: T
}

type ErrorAction<T> = {
  type: 'rejected'
  error: T
}

type AsyncAction<D, E> = PendingAction | ResolvedAction<D> | ErrorAction<E>

export type AsyncState<D, E> = {
  status: string
  data: D | null
  error: E | null
}

function asyncReducer<D, E>(
  _state: AsyncState<D, E>,
  action: AsyncAction<D, E>
): AsyncState<D, E> {
  switch (action.type) {
    case 'pending':
      return {
        status: 'pending',
        error: null,
        data: _state.data,
      }
    case 'resolved':
      return {
        status: 'resolved',
        data: action.data,
        error: null,
      }
    case 'rejected':
      return {
        status: 'rejected',
        data: null,
        error: action.error,
      }
  }
}

function useSafeDispatch<D, E>(
  dispatch: (value: AsyncAction<any, any>) => void
) {
  const mounted = React.useRef(false)

  React.useEffect((): (() => void) => {
    mounted.current = true
    return () => (mounted.current = false)
  }, [])

  return React.useCallback(
    (args: AsyncAction<D, E>) => (mounted.current ? dispatch(args) : void 0),
    [dispatch]
  )
}

// a hook to manage async state from api
function useAsync<D, E, F>() {
  const [state, unSafeDispatch] = useReducer(asyncReducer, {
    status: 'idle',
    data: null,
    error: null,
  } as AsyncState<D, E>)

  const { error, data, status } = state

  const dispatch = useSafeDispatch(unSafeDispatch)

  const setData = React.useCallback(
    (data: any) => dispatch({ type: 'resolved', data }),
    [dispatch]
  )

  const run = React.useCallback((promise: Promise<F>) => {
    dispatch({ type: 'pending' })
    promise
      .then((data) => {
        dispatch({
          type: 'resolved',
          data,
        })
      })
      .catch((error) => {
        dispatch({
          type: 'rejected',
          error: error.message,
        })
      })
  }, [])

  return {
    error,
    status,
    data,
    run,
    setData,
  } as const
}

export default useAsync
