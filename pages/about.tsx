import type { NextPage } from 'next'
import styles from '../styles/About.module.scss'

import {  BsGithub } from 'react-icons/bs';
import {  BsLinkedin } from 'react-icons/bs';
import {  BsInstagram } from 'react-icons/bs';

import ScrollAnimation from 'react-animate-on-scroll';

const About: NextPage = () => {
  return (
    <>
    <div className={styles.container} id="about">
      <main className={styles.main}>        
     
        <ScrollAnimation animateIn="animate__fadeInUpBig">
          <h1 className={styles.title}>
            Who Am I <span>?</span>
          </h1>
        </ScrollAnimation>        

        <ScrollAnimation animateIn="animate__fadeInUp">
          <p className={styles.description}>          
            Hi, my name is Weslley Oliveira I&apos;m a software engineer.
            tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, 
            quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. 
            Excepteur sint occaecat cupidatat non proident
          </p>
        </ScrollAnimation>
        
        <div className={styles.social}>
          <ScrollAnimation animateIn="animate__fadeInBottomLeft">
            <a className={styles.github} href="https://github.com/weslley-oliveira">
              <BsGithub/> <span>weslley-oliveira</span>
            </a>
          </ScrollAnimation>
          <ScrollAnimation animateIn="animate__fadeInUp">
            <a className={styles.linkedin} href="https://www.linkedin.com/in/weslley-oliveira-uk/">
              <BsLinkedin/> <span>weslley-oliveira-uk</span>
            </a>
          </ScrollAnimation>
          
          <ScrollAnimation animateIn="animate__fadeInBottomRight">            
          <a className={styles.instagram} href="https://www.instagram.com/programador_uk/">
            <BsInstagram/> <span>programador-uk</span>
          </a>
          </ScrollAnimation>          
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
