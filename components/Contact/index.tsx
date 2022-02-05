import Modal from 'react-modal';
import styles from './styles.module.scss'

import { useForm } from '../../hooks/useForm';
import { useEffect, useState } from 'react';

interface contactProps{
    setIsOpen: (arg: boolean) => void;
    modalIsOpen: boolean;
 }

export function Contact({modalIsOpen, setIsOpen} : contactProps){
    
    const [email, setEmail] = useState("hidden")
    const [message, setMessage] = useState("hidden")
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

        <div >            
            <Modal
                isOpen={modalIsOpen}                
                onRequestClose={closeModal}
                className={styles.container}
                overlayClassName={styles.overlay}
            >   
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

                    <p style={{visibility: `${email}`}}>email <span>~</span></p>
                    <div>
                        <span style={{visibility: `${email}`}}>{">"}</span>    
                        <input 
                            name="email" 
                            type="text"
                            onChange={onChange}
                            onKeyPress={handleAnswerChange}
                            required
                        />
                    </div>

                    <p style={{visibility: `${message}`}}>message <span>~</span></p>
                    <div>
                        <span style={{visibility: `${message}`}}>{">"}</span>                    
                        <input 
                            name="message" 
                            type="text"
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
               
                
                
            </Modal>
        </div>

    )
}