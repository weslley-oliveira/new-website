import type { NextPage } from 'next'
import styles from '../styles/About.module.scss'

import {  BsGithub, BsLinkedin, BsInstagram} from 'react-icons/bs';

import ScrollAnimation from 'react-animate-on-scroll';

const About: NextPage = () => {
  return (
    <>
    <div className={styles.container} id="about">
      <main className={`${styles.main}`}>        
     
        <ScrollAnimation animateIn="animate__fadeInUpBig">
          <h1 className={styles.title}>
            Who Am I <span>?</span>
          </h1>
        </ScrollAnimation>        

        <ScrollAnimation animateIn="animate__bounceInLeft">
          <p className={styles.description}>
            My name is Weslley Oliveira, I&apos;m passionate about human-machine interaction, 
            being able to create these interactions is my job and also a hobby.
          </p>
        </ScrollAnimation>
        <ScrollAnimation animateIn="animate__bounceInRight">
          <p className={styles.description}>
          I started my career repairing electronic equipment at the Methodist University of São Paulo, 
          then I was promoted to the information technology department, working with technical support, 
          completing my Bachelor's degree in Computer Engineering in 2013, 
          I said goodbye to this university for which I am very grateful and 
          I went on an adventure through Brazil working with industrial automation, 
          programming smart scales for weighing soybeans across the country.
          </p>
          </ScrollAnimation>
        <ScrollAnimation animateIn="animate__bounceInLeft">

          <p className={styles.description}>
          Taken by the adventurous spirit, I moved to England and in the process of learning English I took a chance on the most diverse jobs,
          kitchen porter, courier, fitter furniture and finally, returning to my technological career,
          working remotely as a Front End Developer.
          </p>
          </ScrollAnimation>
        <ScrollAnimation animateIn="animate__bounceInRight">

          <p className={styles.description}>
          Travelling has become my passion, I love my job in parts because my current career has given me that, 
          a highlight for this passion and getting to know other cultures and places, 
          it gives me a better way of thinking and being more creative, very important for the realisation of my dream.
          </p>
          </ScrollAnimation>
        <ScrollAnimation animateIn="animate__bounceInLeft">

          <p className={styles.description}>
          My dream is to develop an application that can impact many people, 
          I believe that with digital inclusion on the rise and through my code, 
          I will be able to transform many lives, I try to practice a little programming every day, 
          studying software development, keeping myself updated, I'm sure this will lead me to the realisation of my dream.
          </p>
          </ScrollAnimation>
        <ScrollAnimation animateIn="animate__bounceInRight">

          <p className={styles.description}>
          Improving my focus is my daily struggle. Software that uses neuroscience and complex resources have been increased, 
          they easily get our attention. It's been hard work to be focused amidst the war of who gets my attention, 
          but through personal development and meditation, I've become a person a lot more focused on my job.
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
