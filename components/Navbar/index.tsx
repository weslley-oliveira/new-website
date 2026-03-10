import style from './style.module.scss'
import { BsFillPersonLinesFill } from 'react-icons/bs';
import { BsTools } from 'react-icons/bs';
import { BiHomeAlt } from 'react-icons/bi';
import { FaLaptopCode } from 'react-icons/fa';
import { GiTechnoHeart } from 'react-icons/gi';
import { RiDashboardLine } from 'react-icons/ri';
import { useEffect, useRef, useState, type ComponentType } from 'react';
import { useRouter } from 'next/router';
import type { User } from '@supabase/supabase-js';

import { useActiveSection } from '../../hooks/useActiveSection';
import { useLocale } from '../../contexts/LocaleContext';
import { getUserAvatarUrl, getUserDisplayName } from '../../lib/user';
import { getSupabaseBrowserClient } from '../../lib/supabaseBrowser';

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
   const { t } = useLocale();
   const isHomePage = router.pathname === '/';
   const titleHref = isHomePage ? '#home' : '/';
   const sectionItems = [
    { id: 'home', label: t('nav.home'), icon: BiHomeAlt },
    { id: 'about', label: t('nav.whoAmI'), icon: BsFillPersonLinesFill },
    { id: 'projects', label: t('nav.projects'), icon: FaLaptopCode },
    { id: 'technologies', label: t('nav.technologies'), icon: GiTechnoHeart },
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
      id: 'tools',
      label: t('nav.tools'),
      icon: BsTools,
      href: '/tools',
      isActive: router.pathname === '/tools',
    },
    {
      id: 'dashboard',
      label: t('nav.dashboard'),
      icon: RiDashboardLine,
      href: '/dashboard',
      isActive: router.pathname === '/dashboard',
    },
   ];

   const isToggled =  button;

   const [authUser, setAuthUser] = useState<User | null>(null);
   const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
   const [isSigningOut, setIsSigningOut] = useState(false);
   const userMenuRef = useRef<HTMLDivElement | null>(null);

   useEffect(() => {
    let isMounted = true;

    try {
      const supabase = getSupabaseBrowserClient();
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!isMounted) return;
        setAuthUser(session?.user ?? null);
      });

      void supabase.auth.getSession().then(({ data }) => {
        if (!isMounted) return;
        setAuthUser(data.session?.user ?? null);
      });

      return () => {
        isMounted = false;
        subscription.unsubscribe();
      };
    } catch {
      // Supabase not configured
    }
   }, []);

   useEffect(() => {
    if (!isUserMenuOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
   }, [isUserMenuOpen]);

   async function handleSignOut() {
    setIsSigningOut(true);
    try {
      await getSupabaseBrowserClient().auth.signOut();
      closeMenu();
    } finally {
      setIsSigningOut(false);
    }
   }

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
                <a href={titleHref} className={style.menuBrand} onClick={closeMenu}>
                    <span>{'<'}</span>
                    Oliveira
                    <span>{'/>'}</span>
                </a>
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
                    {authUser && (
                        <li key="profile" className={style.userMenuDesktop}>
                            <div className={style.userMenuWrapper} ref={userMenuRef}>
                                <button
                                    type="button"
                                    className={style.userAvatarButton}
                                    onClick={() => setIsUserMenuOpen((prev) => !prev)}
                                    aria-expanded={isUserMenuOpen}
                                    aria-haspopup="true"
                                    aria-label="Open user menu"
                                >
                                    {getUserAvatarUrl(authUser) ? (
                                        <img
                                            src={getUserAvatarUrl(authUser)!}
                                            alt=""
                                            className={style.userAvatar}
                                            width={40}
                                            height={40}
                                        />
                                    ) : (
                                        <span className={style.userAvatarFallback}>
                                            {getUserDisplayName(authUser).slice(0, 2).toUpperCase()}
                                        </span>
                                    )}
                                </button>
                                {isUserMenuOpen && (
                                    <div className={style.userMenuDropdown}>
                                        <p className={style.userMenuName}>{getUserDisplayName(authUser)}</p>
                                        <p className={style.userMenuEmail}>{authUser.email ?? ''}</p>
                                        <button
                                            type="button"
                                            className={style.userMenuSignOut}
                                            onClick={() => {
                                                setIsUserMenuOpen(false);
                                                void handleSignOut();
                                            }}
                                            disabled={isSigningOut}
                                        >
                                            {isSigningOut ? t('nav.signingOut') : t('nav.signOut')}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </li>
                    )}
                </ul>
                {authUser && (
                    <div className={style.mobileUserCard}>
                        <div className={style.mobileUserCardAvatar}>
                            {getUserAvatarUrl(authUser) ? (
                                <img
                                    src={getUserAvatarUrl(authUser)!}
                                    alt=""
                                    className={style.mobileUserAvatar}
                                    width={64}
                                    height={64}
                                />
                            ) : (
                                <span className={style.mobileUserAvatarFallback}>
                                    {getUserDisplayName(authUser).slice(0, 2).toUpperCase()}
                                </span>
                            )}
                        </div>
                        <p className={style.mobileUserCardName}>{getUserDisplayName(authUser)}</p>
                        <p className={style.mobileUserCardEmail}>{authUser.email ?? ''}</p>
                        <button
                            type="button"
                            className={style.mobileUserCardSignOut}
                            onClick={() => {
                                closeMenu();
                                void handleSignOut();
                            }}
                            disabled={isSigningOut}
                        >
                            {isSigningOut ? t('nav.signingOut') : t('nav.signOut')}
                        </button>
                    </div>
                )}
            </div>                        
        </nav>
    )

}