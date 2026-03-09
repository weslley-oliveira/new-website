import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Navbar } from '../Navbar'
import styles from './style.module.scss'

export function Header() {
    const Title = "Oliveira"
    const router = useRouter()

    const [isToggled, setIsToggled] = useState<boolean>(false)

    const [scrollPosition, setScrollPosition] = useState(0);
    const handleScroll = () => {
        const position = window.pageYOffset;
        setScrollPosition(position);
    };
    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true });
    
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const titleHref = router.pathname === '/' ? '#home' : '/'

    return (
        
        <header className={`${styles.header} ${scrollPosition >= 1 ? styles.scrolled : ''}`}>
            <div className={styles.title}>
                <a href={titleHref} className={styles.titleLink}>
                    <h2> {"<"}{Title}<span>{"/>"}</span> </h2>
                </a>
            </div>
            <button
                type="button"
                aria-label={isToggled ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={isToggled}
                aria-controls="primary-navigation"
                onClick={()=>setIsToggled(!isToggled)} 
                className={`${styles.menuBars} ${scrollPosition >=1 && styles.fixed}  ${isToggled?styles.active:''}`}>
                    
                <div className={styles.line1}></div>
                <div className={styles.line2}></div>
                <div className={styles.line3}></div>
            </button>   
            <Navbar button={isToggled} setIsToggled={setIsToggled}/>        
        </header>
    )
}