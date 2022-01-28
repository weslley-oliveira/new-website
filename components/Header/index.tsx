import { useState } from 'react'
import { Navbar } from '../Navbar'
import styles from './style.module.scss'

export function Header() {
    const Title = "Oliveira"

    const [isToggled, setIsToggled] = useState(false)

    return (<>
        <header className={styles.header}>
            <div className={styles.title}>
                <h2> {"<"}{Title}<span>{"/>"}</span> </h2>
            </div>
            <div
                onClick={()=>setIsToggled(!isToggled)} 
                className={`${styles.menuBars}  ${isToggled?styles.active:''}`}>
                    
                <div className={styles.line1}></div>
                <div className={styles.line2}></div>
                <div className={styles.line3}></div>
            </div>           
        </header>
        <Navbar button={isToggled}/>
    </>)
}