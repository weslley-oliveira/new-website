import type { NextPage } from 'next'
import { BsGithub } from 'react-icons/bs'
import styles from '../styles/Projects.module.scss'


const Projects: NextPage = () => {
  return (
    <div className={styles.container} id="projects">
      <main className={styles.main}>
        
        <h1 className={styles.title}>
          Projects
        </h1>

        <p className={styles.description}>
         Some problems solved by me
        </p>

        <div className={styles.grid}>
          <a href="https://nextjs.org/docs" className={styles.card}>
            <img src="/profile.jpg" alt="Weslley Oliveira"/>
            <p>Name</p>
            <h2>First Project</h2>
            <p>Description</p>
            <h3>Find in-depth information about Next.js features and API.</h3>
            <p>Technologies</p>
            <div>
              <BsGithub/>
              <BsGithub/>
              <BsGithub/>
              <BsGithub/>
            </div>
          </a>

          <a href="https://nextjs.org/learn" className={styles.card}>
            <h2>Learn &rarr;</h2>
            <p>Learn about Next.js in an interactive course with quizzes!</p>
          </a>

          <a
            href="https://github.com/vercel/next.js/tree/master/examples"
            className={styles.card}
          >
            <h2>Examples &rarr;</h2>
            <p>Discover and deploy boilerplate example Next.js projects.</p>
          </a>

          <a
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            className={styles.card}
          >
            <h2>Deploy &rarr;</h2>
            <p>
              Instantly deploy your Next.js site to a public URL with Vercel.
            </p>
          </a>
        </div>
      </main>

    </div>
  )
}

export default Projects
