import type { NextPage } from 'next'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import LeaderboardTable from '../components/LeaderboardTable'

const EventView: NextPage = () => {
  return (
    <div className={styles['container']}>
      <Head>
        <title>Leaderboard</title>
        <meta name='description' content='Leaderboard client' />
        <link rel='icon' href='/favicon.png' />
      </Head>

      <main className={styles['main']}>
        <LeaderboardTable />
      </main>
    </div>
  )
}

export default EventView
