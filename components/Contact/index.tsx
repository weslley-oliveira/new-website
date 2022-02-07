import Modal from 'react-modal';
import styles from './styles.module.scss'

import Draggable from 'react-draggable';

import { useForm } from '../../hooks/useForm';
import { useEffect, useState } from 'react';

interface contactProps{
    setIsOpen: (arg: boolean) => void;
    modalIsOpen: boolean;
 }

export function Contact({modalIsOpen, setIsOpen} : contactProps){
    
    const [email, setEmail] = useState<String>("hidden")
    const [message, setMessage] = useState<String>("hidden")
    const [error, setError] = useState("")

    const delay = 2;
    useEffect(
        () => {
          let timer1 = setTimeout(() => setError(""), delay * 1000);    
          
          return () => {
            clearTimeout(timer1);
          };
        },[error]);

    function closeModal() {
        reset()
        setIsOpen(false);
        setEmail("hidden")
        setMessage("hidden")
        setError("")
    }

    function handleAnswerChange(event : any){
		if(event.key === 'Enter'){

            if(values.message === "") {
                const form = event.target.form;
                const index = [...form].indexOf(event.target);

                if(index <= 0){
                    form.elements[index + 1].focus();  
                    setEmail("visible")                  
                    event.preventDefault();
                } else if(index <= 1){
                    form.elements[index + 1].focus();  
                    setMessage("visible")                    
                } else {
                    setError("please leave your message")
                }
                
            } else {
                if(values.message.length <= 10){
                    setError("your message is to short speak with me")
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
    const { onChange, onSubmit, values, reset } = useForm(
        loginUserCallback,
        initialState
    );

    // a submit function that will execute upon form submission
    async function loginUserCallback() {

       
        // send "values" to database
    }
    
    return(

        
        <div> 
                    
            <Modal
                isOpen={modalIsOpen}                
                onRequestClose={closeModal}
                className={styles.modal}
                overlayClassName={styles.overlay}
            >  
            <Draggable>
            <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <button onClick={closeModal}/> 
                    <button onClick={closeModal}/>                    
                    <button onClick={()=>setEmail("hidden")}/>
                </div>
                <p>contact-me:~</p>
                <span>{""}</span>
            </header>
                <form>                    
                    <p>/ <span>~</span></p>
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

                    <p className={`${email === 'hidden' && styles.visibility}` }>/{values.name}/<span>~</span></p>
                    <div>
                        <span className={`${email === 'hidden' && styles.visibility}` }>{">"}</span>    
                        <input 
                            name="email" 
                            type="text"
                            className={`${email === 'hidden' && styles.hidden}` }
                            placeholder="type your best email"  
                            onChange={onChange}
                            onKeyPress={handleAnswerChange}
                            required
                        />
                    </div>

                    <p className={`${message === 'hidden' && styles.visibility}`}>/{values.name}/email:{values.email}<span>~</span></p>
                    <div>
                        <span className={`${message === 'hidden' && styles.visibility}`}>{">"}</span>                    
                        <input                             
                            name="message" 
                            type="text"
                            className={`${message === 'hidden' && styles.hidden}` }
                            placeholder="type your message"
                            onChange={onChange}
                            onKeyPress={handleAnswerChange}
                            required
                        />
                    </div>
                    
                    {values.message.length >= 10 && 
                    
                        <span>press enter to submit</span>
                       
                    } 
                    {error === "please leave your message" && 
                        <span>{error}</span>
                    }
                    {error === "your message is to short speak with me" && 
                        <span>{error}</span>
                    }
                    
                </form>
                </div>
                </Draggable>
               
                
                
            </Modal>
            
        </div>
        
    )
}