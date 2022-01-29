import type { NextPage } from 'next'
import styles from '../styles/About.module.scss'

import {  BsGithub } from 'react-icons/bs';
import {  BsLinkedin } from 'react-icons/bs';
import {  BsInstagram } from 'react-icons/bs';

const About: NextPage = () => {
  return (
    <div className={styles.container} id="about">
      <main className={styles.main}>
        
        <h1 className={styles.title}>
          Who Am I <span>?</span>
        </h1>

        <p className={styles.description}>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod 
          tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, 
          quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. 
          Excepteur sint occaecat cupidatat non proident
        </p>
        
        <div className={styles.social}>
          <div className={styles.github}>
            <BsGithub/> <span>weslley-oliveira</span>
          </div>
          <div className={styles.linkedin}>
            <BsLinkedin/> <span>weslley-oliveira-uk</span>
          </div>
          <div className={styles.instagram}>
            <BsInstagram/> <span>weslley-instagram</span>
          </div>          
        </div>
       
      </main>

    </div>
  )
}

export default About
