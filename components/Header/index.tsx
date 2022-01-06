import { Navbar } from '../Navbar'
import style from './style.module.scss'

export function Header() {
    return (
        <header className={style.content}>
            <div className={style.container}> 
                                    
                <h2 className={style.logo}>Front End <div className={style.lineTitle}></div></h2> 

                <Navbar/>              
               
            </div>
        </header>
    )
}