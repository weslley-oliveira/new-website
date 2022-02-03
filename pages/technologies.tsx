import type { NextPage } from 'next'
import styles from '../styles/Technologies.module.scss'

import { RiReactjsFill, RiHtml5Fill } from 'react-icons/ri'
import { SiTypescript, SiNextdotjs, SiTailwindcss, SiStyledcomponents , SiMongodb} from 'react-icons/si'
import { BsGithub } from 'react-icons/bs';
import { FaSass, FaNodeJs, FaCss3} from 'react-icons/fa'


const Technologies: NextPage = () => {
  return (
    <div className={styles.container} id="technologies">
      <main className={styles.main}>
           <RiReactjsFill/>
           <RiHtml5Fill/>
           <SiTypescript/>
           <SiNextdotjs/>
           <SiTailwindcss/>
           <SiStyledcomponents/>
           <BsGithub/>
           <FaSass/>
           <FaNodeJs/>
           <FaCss3/>
           <SiMongodb/>        
      </main>
    </div>
  )
}

export default Technologies
