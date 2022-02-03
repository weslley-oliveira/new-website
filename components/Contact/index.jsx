import Modal from 'react-modal';
import styles from './styles.module.scss'

export function Contact({modalIsOpen, setIsOpen}){
    
    
    function closeModal() {
        setIsOpen(false);
    }
    return(

        <div >            
            <Modal
                isOpen={modalIsOpen}                
                onRequestClose={closeModal}
                className={styles.container}
                overlayClassName={styles.overlay}
            >
               
                <button onClick={closeModal}>close</button>
                
            </Modal>
        </div>

    )
}