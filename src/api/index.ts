import { BACKEND_API } from '../constants'

interface LeaderboardResponse extends Response {
  entities: any
  nextPage: string
}

export const fetchDataByEvent = (
  event: string,
  view: string,
  page: number,
  size: number,
  sortOrder: number
) => {
  return fetch(
    `${BACKEND_API}/gamer?event_name=${event}&view=${view}&page=${page}&size=${size}&sortOrder=${sortOrder}`
  )
    .then((response: Response) => {
      if (!response.ok) {
        if (response.status === 429) throw new Error('Too many requests')
        return response.json().then((text) => {
          throw new Error(text?.message)
        })
      } else return response.json()
    })
    .then((response: LeaderboardResponse) => {
      return response
    })
}
