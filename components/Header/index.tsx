import style from './style.module.scss'

import Link from 'next/link'

export function Header() {
    return (
        <header className={style.content}>
            <div className={style.container}>                
                <h2>Weslley Oliveira</h2>
                <nav>
                    <Link href="/">
                        <a className={style.active}>Home</a>
                    </Link>
                    <a>About me</a>
                    <a>Technics</a>                    
                    <a>Projects</a>
                </nav>
            </div>
        </header>
    )
}