import { useState } from 'react'
import style from './style.module.scss'
import { BsFillPersonLinesFill } from 'react-icons/bs';
import { BiHomeAlt } from 'react-icons/bi';
import { FaLaptopCode } from 'react-icons/fa';
import { GiTechnoHeart } from 'react-icons/gi';

import { Link } from 'react-scroll'

interface buttonProps{
    button: boolean
 }

export function Navbar({ button }: buttonProps) {

   const isToggled =  button;
        console.log(isToggled)
    return(
        <nav>                   
            <div className={`${style.listMenu}  ${isToggled?style.active:''}`}>
                <ul >
                    <li>
                        <Link activeClass="active" to="home" spy={true} smooth={true} offset={50} duration={500} >
                            <span><BiHomeAlt/></span>Home
                        </Link>
                    </li>
                    <li>
                        <Link activeClass="active" to="home" spy={true} smooth={true} offset={50} duration={500} >
                            <span><BsFillPersonLinesFill/></span> Who Am I
                        </Link>
                    </li> 
                    <li>
                        <Link activeClass="active" to="projects" spy={true} smooth={true} offset={50} duration={500} >
                           <span><FaLaptopCode/></span>Projects
                        </Link>
                    </li>
                    <li>
                        <Link activeClass="active" to="technologies" spy={true} smooth={true} offset={50} duration={500}  >
                            <span><GiTechnoHeart/></span>Tecnologies
                        </Link>
                    </li>
                </ul>                
            </div>                        
        </nav>
    )

}