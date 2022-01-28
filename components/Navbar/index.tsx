import style from './style.module.scss'
import { BsFillPersonLinesFill } from 'react-icons/bs';
import { BiHomeAlt } from 'react-icons/bi';
import { FaLaptopCode } from 'react-icons/fa';
import { GiTechnoHeart } from 'react-icons/gi';

import { Link , animateScroll as Scroll} from 'react-scroll'

interface buttonProps{
    setIsToggled: (arg: boolean) => void;
    button: boolean;
 }

export function Navbar({ button, setIsToggled }: buttonProps) {

   const isToggled =  button;

   
   function scrollToTop() {
    Scroll.scrollToTop();
    setIsToggled(!isToggled);
  }
       
    return(
        <nav>                   
            <div className={`${style.listMenu}  ${isToggled?style.active:''}`}>
                <ul >
                    
                    <li>
                        <a onClick={scrollToTop}><span><BiHomeAlt/></span>Home</a>                        
                    </li>
                    <li>
                        <Link 
                            activeClass="active" 
                            to="about" spy={true} 
                            smooth={true} 
                            offset={50} 
                            duration={500} 
                            onClick={()=>setIsToggled(!isToggled)}
                        >
                            <span><BsFillPersonLinesFill/></span> Who Am I
                        </Link>
                    </li> 
                    <li>
                        <Link 
                            activeClass="active" 
                            to="projects" 
                            spy={true} 
                            smooth={true} 
                            offset={50} 
                            duration={500} 
                            onClick={()=>setIsToggled(!isToggled)} 
                        >
                           <span><FaLaptopCode/></span>Projects
                        </Link>
                    </li>
                    <li>
                        <Link 
                            activeClass="active" 
                            to="technologies" 
                            spy={true} 
                            smooth={true} 
                            offset={50} 
                            duration={500}  
                            onClick={()=>setIsToggled(!isToggled)}
                        >
                            <span><GiTechnoHeart/></span>Tecnologies
                        </Link>
                    </li>
                </ul>                
            </div>                        
        </nav>
    )

}