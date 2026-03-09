import style from './style.module.scss'
import { BsFillPersonLinesFill } from 'react-icons/bs';
import { BiHomeAlt } from 'react-icons/bi';
import { FaLaptopCode } from 'react-icons/fa';
import { GiTechnoHeart } from 'react-icons/gi';
import { RiDashboardLine } from 'react-icons/ri';
import { useEffect, type ComponentType } from 'react';
import { useRouter } from 'next/router';

import { useActiveSection } from '../../hooks/useActiveSection';

interface buttonProps{
    setIsToggled: (arg: boolean) => void;
    button: boolean;
}

interface NavigationItem {
    id: string;
    label: string;
    href: string;
    icon: ComponentType;
    isActive: boolean;
}

export function Navbar({ button, setIsToggled }: buttonProps) {
   const router = useRouter();
   const isHomePage = router.pathname === '/';
   const sectionItems = [
    { id: 'home', label: 'Home', icon: BiHomeAlt },
    { id: 'about', label: 'Who Am I', icon: BsFillPersonLinesFill },
    { id: 'projects', label: 'Projects', icon: FaLaptopCode },
    { id: 'technologies', label: 'Technologies', icon: GiTechnoHeart },
   ];
   const activeSection = useActiveSection(sectionItems.map(({ id }) => id));
   const navigationItems: NavigationItem[] = [
    ...sectionItems.map(({ id, label, icon }) => ({
      id,
      label,
      icon,
      href: isHomePage ? `#${id}` : `/#${id}`,
      isActive: isHomePage && activeSection === id,
    })),
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: RiDashboardLine,
      href: '/dashboard',
      isActive: router.pathname === '/dashboard',
    },
   ];

   const isToggled =  button;

   useEffect(() => {
    if (!isToggled) {
      document.body.style.overflow = '';
      return;
    }

    document.body.style.overflow = 'hidden';

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsToggled(false);
      }
    };

    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
   }, [isToggled, setIsToggled]);

   function closeMenu() {
    setIsToggled(false);
   }
       
    return(
        <nav aria-label="Primary navigation">
            <button
                type="button"
                aria-label="Close navigation menu"
                aria-hidden={!isToggled}
                tabIndex={isToggled ? 0 : -1}
                className={`${style.backdrop} ${isToggled ? style.backdropVisible : ''}`}
                onClick={closeMenu}
            />
            <div id="primary-navigation" className={`${style.listMenu} ${isToggled ? style.active : ''}`}>
                <ul>
                    {navigationItems.map(({ id, label, href, icon: Icon, isActive }) => (
                        <li key={id}>
                            <a
                                href={href}
                                className={`${style.navLink} ${isActive ? style.activeLink : ''}`}
                                aria-current={isActive ? 'page' : undefined}
                                onClick={closeMenu}
                            >
                                <span><Icon /></span>
                                {label}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>                        
        </nav>
    )

}