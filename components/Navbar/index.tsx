import { useState } from 'react'
import style from './style.module.scss'
import { BsFillPersonLinesFill } from 'react-icons/bs';
import { BiHomeAlt } from 'react-icons/bi';
import { FaLaptopCode } from 'react-icons/fa';
import { GiTechnoHeart } from 'react-icons/gi';

import Lottie from 'react-lottie';
import animationData from './codeAnimation.json';

import { Link } from 'react-scroll'

export function Navbar() {

    const [isToggled, setIsToggled] = useState(false) 
    
    const [animationState, setAnimationState] = useState({
        isStopped: false, isPaused: false,
      });
    
      const defaultOptions = {
        loop: true,
        autoplay: true, 
        animationData: animationData,
        rendererSettings: {
          preserveAspectRatio: 'xMidYMid slice'
        }
      };

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
            
            <div className={`${style.listMenu}  ${isToggled?style.active:''}`}>
                <ul >
                    <li>
                        <Link activeClass="active" to="home" spy={true} smooth={true} offset={50} duration={500} >
                        <a href="#" onClick={()=>setIsToggled(!isToggled)}><span><BiHomeAlt/></span>Home</a>
                        </Link>
                    </li>
                    <li>
                        <Link activeClass="active" to="home" spy={true} smooth={true} offset={50} duration={500} >
                            <a href="#" onClick={()=>setIsToggled(!isToggled)}><span><BsFillPersonLinesFill/></span> Who Am I </a>
                        </Link>
                    </li> 
                    <li>
                        <Link activeClass="active" to="projects" spy={true} smooth={true} offset={50} duration={500} >
                            <a href="#" onClick={()=>setIsToggled(!isToggled)}><span><FaLaptopCode/></span>Projects</a>
                        </Link>
                    </li>
                    <li>
                        <Link activeClass="active" to="technologies" spy={true} smooth={true} offset={50} duration={500}  >
                            <a href="#" onClick={()=>setIsToggled(!isToggled)}><span><GiTechnoHeart/></span>Tecnologies</a>
                        </Link>
                    </li>
                </ul>                
            </div>
                        
        </nav>
    )

}