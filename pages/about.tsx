import type { NextPage } from 'next';
import { BsGithub, BsInstagram, BsLinkedin } from 'react-icons/bs';

import { Reveal } from '../components/Reveal';
import { useLocale } from '../contexts/LocaleContext';
import styles from '../styles/About.module.scss';

interface StoryCard {
  eyebrow: string;
  title: string;
  paragraphs: string[];
}

const defaultStoryCards: StoryCard[] = [
  {
    eyebrow: 'Origins',
    title: 'From electronics to software',
    paragraphs: [
      'I started my career repairing electronic equipment at the Methodist University of São Paulo, then I was promoted to the information technology department, where I worked in technical support whilst completing my Bachelor\'s degree in Computer Engineering in 2013.',
      'I said goodbye to that university with great fondness and set off on an adventure across Brazil, working with industrial automation and programming smart scales for weighing soya beans throughout the country.',
    ],
  },
  {
    eyebrow: 'Transition',
    title: 'England, language, and resilience',
    paragraphs: [
      'Driven by an adventurous spirit, I moved to England and, in the process of learning English, I took a chance on the most varied jobs: kitchen porter, courier, and furniture fitter.',
      'That journey eventually led me back to technology, this time as a remote Front End Developer, working mainly with React and JavaScript.',
    ],
  },
  {
    eyebrow: 'Purpose',
    title: 'Travel, creativity, and impact',
    paragraphs: [
      'Travelling has become my passion, and a big part of why I love what I do is because my career has given me exactly that. Getting to know other cultures and places gives me a better way of thinking and makes me more creative.',
      'My dream is to develop an application that impacts many people. I believe that, with digital inclusion on the rise and through my code, I will be able to transform many lives.',
    ],
  },
  {
    eyebrow: 'Mindset',
    title: 'Discipline behind the work',
    paragraphs: [
      'That\'s why I practise programming every day, study software development, and keep myself up to date. I\'m certain this will lead me there.',
      'In a world where attention has become a battleground, I\'ve learned that focus is a muscle. Through personal development and meditation, I\'ve built a disciplined routine that directly reflects on the quality of my work.',
    ],
  },
];

const socialLinks = [
  {
    href: 'https://github.com/weslley-oliveira',
    label: 'GitHub',
    handle: 'weslley-oliveira',
    icon: BsGithub,
  },
  {
    href: 'https://www.linkedin.com/in/weslley-oliveira-uk/',
    label: 'LinkedIn',
    handle: 'weslley-oliveira-uk',
    icon: BsLinkedin,
  },
  {
    href: 'https://www.instagram.com/programador_uk/',
    label: 'Instagram',
    handle: 'programador-uk',
    icon: BsInstagram,
  },
];

const About: NextPage = () => {
  const { t, get } = useLocale();
  const storyCards = (get<StoryCard[]>('about.storyCards') ?? defaultStoryCards);
  return (
    <>
      <div className={styles.container} id="about">
        <main className={styles.main}>
          <Reveal animateIn="animate__fadeInUp">
            <section className={styles.hero}>
              <p className={styles.eyebrow}>{t('about.eyebrow')}</p>
              <h1 className={styles.title}>
                {t('about.title')} <span>?</span>
              </h1>
              <p className={styles.lead}>
                {t('about.lead')}
              </p>
            </section>
          </Reveal>

          <section className={styles.storyGrid} aria-label="About Weslley Oliveira">
            {storyCards.map((card, index) => (
              <Reveal
                key={card.title}
                animateIn="animate__fadeInUp"
                delay={index * 120}
              >
                <article className={styles.storyCard}>
                  <p className={styles.cardEyebrow}>{card.eyebrow}</p>
                  <h2>{card.title}</h2>
                  <div className={styles.cardContent}>
                    {card.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </article>
              </Reveal>
            ))}
          </section>

          <Reveal animateIn="animate__fadeInUp" delay={220}>
            <section className={styles.socialPanel} aria-label="Social links">
              <div className={styles.socialIntro}>
                <p className={styles.cardEyebrow}>{t('about.findMeOnline')}</p>
                <h2>{t('about.keepInTouch')}</h2>
                <p>
                  {t('about.socialIntro')}
                </p>
              </div>

              <div className={styles.socialList}>
                {socialLinks.map(({ href, label, handle, icon: Icon }) => (
                  <a
                    key={label}
                    className={styles.socialLink}
                    href={href}
                    aria-label={`${label} profile`}
                  >
                    <span className={styles.socialIcon}>
                      <Icon />
                    </span>
                    <span className={styles.socialText}>
                      <strong>{label}</strong>
                      <span>{handle}</span>
                    </span>
                  </a>
                ))}
              </div>
            </section>
          </Reveal>
        </main>

        <div className={styles.dividerAbout}>
          <svg
            data-name="Layer 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M649.97 0L599.91 54.12 550.03 0 0 0 0 120 1200 120 1200 0 649.97 0z"
              className={styles.shapeFill}
            ></path>
          </svg>
        </div>
      </div>
    </>
  );
};

export default About;
