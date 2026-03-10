import type { NextPage } from 'next'
import { RiReactjsFill, RiHtml5Fill } from 'react-icons/ri'
import { SiTypescript, SiNextdotjs, SiTailwindcss, SiStyledcomponents } from 'react-icons/si'
import {  BsGithub , BsArrowRight} from 'react-icons/bs';
import { FaSass} from 'react-icons/fa'
import { useLocale } from '../contexts/LocaleContext'
import styles from '../styles/Projects.module.scss'

interface ProjectCard {
  title: string;
  description: string;
}

const projectImages = [
  '/letmeask.png',
  '/moveit.png',
  '/memory.png',
  '/evolucaointerior.png',
];

const projectTech = [
  [RiReactjsFill, SiTypescript, FaSass, RiHtml5Fill],
  [SiNextdotjs, RiReactjsFill, SiTypescript, FaSass],
  [RiReactjsFill, SiStyledcomponents, RiHtml5Fill],
  [SiNextdotjs, RiReactjsFill, SiTailwindcss, RiHtml5Fill],
];

const defaultCards: ProjectCard[] = [
  { title: 'Let Me Ask', description: 'Letmeask helps you answer questions more efficiently, you can select easily who you will answer first.' },
  { title: 'Move.it', description: 'Move.it is an app to keep you in focus and help to remind you to exercise while you are resting after coding.' },
  { title: 'Memory Matching Game', description: 'Memory Match Game developed by me from scratch, using Figma for layout and front end technologies' },
  { title: 'First Client', description: 'I made a single page aplication for my first client she was very satisfied with my work' },
];

const Projects: NextPage = () => {
  const { t, get } = useLocale();
  const cards = get<ProjectCard[]>('projects.cards') ?? defaultCards;
  return (
    <div className={styles.container} id="projects">
      <main className={styles.main}>
        
        <h1 className={styles.title}>
          {t('projects.title')}
        </h1>

        <p className={styles.description}>
         {t('projects.description')} <BsGithub/> 
        </p>

        <div className={styles.grid}>
          {cards.map((card, index) => (
            <div key={card.title} className={styles.card}>
              <img src={projectImages[index]} alt={card.title}/>            
              <div>
                <h2>{card.title}</h2>              
                <h3>{card.description}</h3>              
                <div>
                  {projectTech[index]?.map((Icon, i) => (
                    <Icon key={i} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <a href="https://github.com/weslley-oliveira" className={styles.description}>
         {t('projects.seeMore')} <BsGithub/> <BsArrowRight/>
        </a>
      </main>

    </div>
  )
}

export default Projects
