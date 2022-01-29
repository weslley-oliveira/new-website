import type { NextPage } from 'next'
import styles from '../styles/About.module.scss'

import {  BsGithub } from 'react-icons/bs';
import {  BsLinkedin } from 'react-icons/bs';
import {  BsInstagram } from 'react-icons/bs';

const About: NextPage = () => {
  return (
    <>
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
      <div className={styles.dividerAbout}>
          <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M649.97 0L599.91 54.12 550.03 0 0 0 0 120 1200 120 1200 0 649.97 0z" className={styles.shapeFill}></path>
          </svg>
      </div>

    </div>
    
  </>
  )
}

export default About
