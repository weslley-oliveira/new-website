import { useState } from 'react'
import style from './style.module.scss'
import { BsFillPersonLinesFill } from 'react-icons/bs';
import { BiHomeAlt } from 'react-icons/bi';
import { FaLaptopCode } from 'react-icons/fa';
import { GiTechnoHeart } from 'react-icons/gi';


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
                <li><a href="#"><span><BiHomeAlt/></span>Home</a></li>
                <li><a href="#"><span><BsFillPersonLinesFill/></span> Who Am I </a></li>
                <li><a href="#"><span><FaLaptopCode/></span>Projects</a></li>
                <li><a href="#"><span><GiTechnoHeart/></span>Tecnologies</a></li>
            </ul>            
        </nav>
    )

}