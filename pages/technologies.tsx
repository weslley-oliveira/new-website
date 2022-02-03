import type { NextPage } from 'next'
import styles from '../styles/Technologies.module.scss'

import { RiReactjsFill, RiHtml5Fill } from 'react-icons/ri'
import { SiTypescript, SiNextdotjs, SiTailwindcss, SiStyledcomponents , SiMongodb} from 'react-icons/si'
import { BsGithub } from 'react-icons/bs';
import { FaSass, FaNodeJs, FaCss3} from 'react-icons/fa'

import ScrollAnimation from 'react-animate-on-scroll';

const Technologies: NextPage = () => {
  return (
    <div className={styles.container} id="technologies">
      <main className={styles.main}>
          <ScrollAnimation delay={500} animateIn="animate__fadeInUp">
           <RiReactjsFill/>
          </ScrollAnimation>
          <ScrollAnimation delay={700} animateIn="animate__fadeInUp">
            <RiHtml5Fill/>
          </ScrollAnimation>
          <ScrollAnimation delay={900} animateIn="animate__fadeInUp">
            <SiTypescript/>
          </ScrollAnimation>
          <ScrollAnimation delay={1100} animateIn="animate__fadeInUp">
            <SiNextdotjs/>
          </ScrollAnimation>
          <ScrollAnimation delay={1300} animateIn="animate__fadeInUp">
            <SiTailwindcss/>
          </ScrollAnimation>
          <ScrollAnimation delay={1500} animateIn="animate__fadeInUp">
          <SiStyledcomponents/>
          </ScrollAnimation>
          <ScrollAnimation delay={1700} animateIn="animate__fadeInUp">
            <BsGithub/>
          </ScrollAnimation>
          <ScrollAnimation delay={1900} animateIn="animate__fadeInUp">
          <FaSass/>
          </ScrollAnimation>
          <ScrollAnimation delay={2100} animateIn="animate__fadeInUp">
          <FaNodeJs/>
          </ScrollAnimation>
          <ScrollAnimation delay={2300} animateIn="animate__fadeInUp">
          <FaCss3/>
          </ScrollAnimation>
          <ScrollAnimation delay={2400} animateIn="animate__fadeInUp">
          <SiMongodb/> 
          </ScrollAnimation>                   
      </main>
    </div>
  )
}

export default Technologies
