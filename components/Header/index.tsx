import { Navbar } from '../Navbar'
import style from './style.module.scss'

export function Header() {
    const Title = "Dev Oliveira"
    return (
        <header className={style.container}>
            <div className={style.logo}>                                    
                <h2> {"<"}{Title}<span>{"/>"}</span> </h2> 
            </div>
            <Navbar/>
        </header>
    )
}