import { useLocale } from '../../contexts/LocaleContext'
import styles from './style.module.scss'

export function Footer(){
    const { t } = useLocale();
    return(
        <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t('footer.poweredBy')}
          <span className={styles.logo}>  Weslley Oliveira</span>
        </a>
      </footer>
    )
}