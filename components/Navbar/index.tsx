import { useState } from 'react'
import style from './style.module.scss'

export function Navbar() {

    const [isToggled, setIsToggled] = useState(false)    

    return(
        <nav>
            <div 
                onClick={()=>setIsToggled(!isToggled)} 
                className={`${style.mobileMenu}  ${isToggled?style.active:''}`}
            >
                <div className={style.line1}></div>
                <div className={style.line2}></div>
                <div className={style.line3}></div>
            </div>          
            
            <ul className={`${style.listMenu}  ${isToggled?style.active:''}`}>
                <li><a href="#">Home</a></li>
                <li><a href="#">Who Am I</a></li>
                <li><a href="#">Projects</a></li>
                <li><a href="#">Tecnologies</a></li>
            </ul>            
        </nav>
    )

}