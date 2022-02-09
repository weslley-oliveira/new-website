import '../styles/globals.scss'
import Modal from 'react-modal'
import type { AppProps } from 'next/app'

import "animate.css/animate.min.css";


Modal.setAppElement('#root');

function MyApp({ Component, pageProps }: AppProps) {
  return (
     <Component {...pageProps} />
  )
}

export default MyApp
