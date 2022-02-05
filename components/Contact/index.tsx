import Modal from 'react-modal';
import styles from './styles.module.scss'

import { useForm } from '../../hooks/useForm';

interface contactProps{
    setIsOpen: (arg: boolean) => void;
    modalIsOpen: boolean;
 }

export function Contact({modalIsOpen, setIsOpen} : contactProps){
    
    
    function closeModal() {
        setIsOpen(false);
    }

    function handleAnswerChange(event : any){
		if(event.key === 'Enter'){

            if(values.message === "") {
                const form = event.target.form;
                const index = [...form].indexOf(event.target);

                if(index <= 1){
                    form.elements[index + 1].focus();
                    event.preventDefault();
                } else {
                    alert("please leave your message")
                }

                
            } else {
                if(values.message.length <= 10){
                    alert("your message is to short")
                } else {
                    alert("enviado"+values)
                }
            }
 
           	
        }
	}   

    // defining the initial state for the form
    const initialState = {
        name: "",
        email: "",
        message: "",

    };

    // getting the event handlers from our custom hook
    const { onChange, onSubmit, values } = useForm(
        loginUserCallback,
        initialState
    );

    // a submit function that will execute upon form submission
    async function loginUserCallback() {

       
        // send "values" to database
    }
    
    return(

        <div >            
            <Modal
                isOpen={modalIsOpen}                
                onRequestClose={closeModal}
                className={styles.container}
                overlayClassName={styles.overlay}
            >   
            <header className={styles.header}>
                <button onClick={closeModal}/>
                <p>contact-me:~</p>
                <span>{""}</span>
            </header>
                <form>                    
                    <p>name <span>~</span></p>
                    <div>
                        <span>{">"}</span>
                        <input 
                            autoFocus 
                            name="name" 
                            type="text" 
                            placeholder="type your name to start"
                            onChange={onChange}
                            onKeyPress={handleAnswerChange}
                            required 
                        />
                    </div>
                    <div>
                        <span>{">"}</span>    
                        <input 
                            name="email" 
                            type="text"                        
                            placeholder="email"
                            onChange={onChange}
                            onKeyPress={handleAnswerChange}
                            required
                        />
                    </div>

                    <div>
                        <span>{">"}</span>                    
                        <input 
                            name="message" 
                            type="text"                         
                            placeholder="message"
                            onChange={onChange}
                            onKeyPress={handleAnswerChange}
                            required
                        />
                    </div>
                    
                    {values.message.length >= 10 && 
                    <span>Press enter to submit</span>
                    }
                </form>
               
                
                
            </Modal>
        </div>

    )
}