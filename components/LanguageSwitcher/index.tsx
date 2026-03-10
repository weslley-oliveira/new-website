import { BR, GB } from 'country-flag-icons/react/3x2';
import { useLocale } from '../../contexts/LocaleContext';
import styles from './style.module.scss';

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  return (
    <div className={styles.switcher} role="group" aria-label="Language selection">
      <button
        type="button"
        className={`${styles.flagButton} ${locale === 'pt' ? styles.active : ''}`}
        onClick={() => setLocale('pt')}
        aria-label="Switch to Portuguese"
        aria-pressed={locale === 'pt'}
        title="Português"
      >
        <BR className={styles.flag} title="Português" />
      </button>
      <button
        type="button"
        className={`${styles.flagButton} ${locale === 'en' ? styles.active : ''}`}
        onClick={() => setLocale('en')}
        aria-label="Switch to English"
        aria-pressed={locale === 'en'}
        title="English"
      >
        <GB className={styles.flag} title="English" />
      </button>
    </div>
  );
}
