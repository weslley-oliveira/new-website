import { useEffect, useState } from 'react'
import { Navbar } from '../Navbar'
import styles from './style.module.scss'

import { animateScroll } from 'react-scroll'

export function Header() {
    const Title = "Oliveira"

    const [isToggled, setIsToggled] = useState(false)

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

    return (<>
        <header className={styles.header}>
            <div className={styles.title}>
                <h2> {"<"}{Title}<span>{"/>"}</span> </h2>
            </div>
            <div
                onClick={()=>setIsToggled(!isToggled)} 
                className={`${styles.menuBars} ${scrollPosition >=1 && styles.fixed}  ${isToggled?styles.active:''}`}>
                    
                <div className={styles.line1}></div>
                <div className={styles.line2}></div>
                <div className={styles.line3}></div>
            </div>           
        </header>
        <Navbar button={isToggled}/>
    </>)
}