import type { NextPage } from 'next'
import styles from '../styles/Technologies.module.scss'
import { Reveal } from '../components/Reveal'

import { RiReactjsFill, RiHtml5Fill } from 'react-icons/ri'
import { SiTypescript, SiNextdotjs, SiTailwindcss, SiStyledcomponents , SiMongodb} from 'react-icons/si'
import { BsGithub } from 'react-icons/bs';
import { FaSass, FaNodeJs, FaCss3} from 'react-icons/fa'

const Technologies: NextPage = () => {
  return (
    <div className={styles.container} id="technologies">
      <main className={styles.main}>
          <Reveal animateIn="animate__fadeInUp">
           <RiReactjsFill/>
          </Reveal>
          <Reveal delay={300} animateIn="animate__fadeInUp">
            <RiHtml5Fill/>
          </Reveal>
          <Reveal delay={600} animateIn="animate__fadeInUp">
            <SiTypescript/>
          </Reveal>
          <Reveal delay={900} animateIn="animate__fadeInUp">
            <SiNextdotjs/>
          </Reveal>
          <Reveal delay={1200} animateIn="animate__fadeInUp">
            <SiTailwindcss/>
          </Reveal>
          <Reveal delay={1500} animateIn="animate__fadeInUp">
          <SiStyledcomponents/>
          </Reveal>
          <Reveal delay={1700} animateIn="animate__fadeInUp">
            <BsGithub/>
          </Reveal>
          <Reveal delay={1900} animateIn="animate__fadeInUp">
          <FaSass/>
          </Reveal>
          <Reveal delay={2100} animateIn="animate__fadeInUp">
          <FaNodeJs/>
          </Reveal>
          <Reveal delay={2300} animateIn="animate__fadeInUp">
          <FaCss3/>
          </Reveal>
          <Reveal delay={2400} animateIn="animate__fadeInUp">
          <SiMongodb/> 
          </Reveal>                   
      </main>
    </div>
  )
}

export default Technologies
