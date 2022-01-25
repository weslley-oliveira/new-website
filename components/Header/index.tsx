import { Navbar } from '../Navbar'
import styles from './style.module.scss'

export function Header() {
    const Title = "Dev Oliveira"
    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <div className={styles.logo}>                                    
                    <h2> {"<"}{Title}<span>{"/>"}</span> </h2> 
                </div>
                <Navbar/>
            </div>
        </header>
    )
}