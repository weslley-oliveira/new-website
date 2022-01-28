import type { NextPage } from 'next'
import styles from '../styles/Projects.module.scss'


const About: NextPage = () => {
  return (
    <div className={styles.container} id="about">
      <main className={styles.main}>
        
        <h1 className={styles.title}>
          Who Am I
        </h1>

        <p className={styles.description}>
          Welcome to my website
        </p>

       
      </main>

    </div>
  )
}

export default About
