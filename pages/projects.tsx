import type { NextPage } from 'next'
import { RiReactjsFill, RiHtml5Fill } from 'react-icons/ri'
import { SiTypescript, SiNextdotjs, SiTailwindcss, SiStyledcomponents } from 'react-icons/si'
import { FaSass} from 'react-icons/fa'
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
          <div className={styles.card}>
            <img src="/letmeask.png" alt="Let Me Ask"/>            
            <div>
              <h2>Let Me Ask</h2>              
              <h3>Letmeask helps you answer questions more efficiently, you can select easily who you will answer first.</h3>              
              <div>
                <RiReactjsFill/>
                <SiTypescript/>
                <FaSass/>
                <RiHtml5Fill/>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <img src="/moveit.png" alt="Move it"/>            
            <div>
              <h2>Move.it</h2>              
              <h3>Move.it is an app to keep you in focus and help to remind you 
                to exercise while you are resting after coding.
              </h3>              
              <div>
                <SiNextdotjs/>
                <RiReactjsFill/>
                <SiTypescript/>
                <FaSass/>                
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <img src="/memory.png" alt="Weslley Oliveira"/>            
            <div>
              <h2>Memory Matching Game</h2>              
              <h3>
                Memory Match Game developed by me from scratch, using Figma 
                for layout and front end technologies
              </h3>              
              <div>
                <RiReactjsFill/>
                <SiStyledcomponents/>                
                <RiHtml5Fill/>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <img src="/evolucaointerior.png" alt="Evolucao interior"/>            
            <div>
              <h2>First Client</h2>              
              <h3>I made a single page aplication for my first client she was very satisfied with my work</h3>              
              <div>
                <SiNextdotjs/>
                <RiReactjsFill/>
                <SiTailwindcss/>                
                <RiHtml5Fill/>
              </div>
            </div>
          </div>

        </div>
      </main>

    </div>
  )
}

export default Projects
