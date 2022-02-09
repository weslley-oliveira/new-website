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
    const [show, setShow] = useState<String>("hidden")
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
        setShow("hidden")
        setError("")
    }

    function handleNextLine(event : any){
		if(event.key.toLowerCase() === 'enter'){
            const form = event.target.form;
            const index = [...form].indexOf(event.target);           

            if(index <= 0){
                form.elements[index + 1].focus();   
                setEmail("visible")                  
                
            } else if(index <= 1){
                form.elements[index + 1].focus();
                setMessage("visible")                    
            }else if(index <= 2){

                if(values.message.length >= 20){
                    form.elements[index + 1].focus();
                    setShow("message") 
                    setMessage("men")
                } else {
                    setError("Your message is to short")
                }
                
                
            } else {
                
                setError("please leave your message")
            }
        }
        if(event.key === '89'){
            setError("message enviada")
        }
	}   

    function sendMessage(event: any){
       
        if(event.key.toLowerCase() === "y"){
            setError("okay")
        } else if(event.key.toLowerCase() === "n"){
            closeModal()
        }else {
            setError("please press Y or N")
        }
    }

    // defining the initial state for the form
    const initialState = {
        name: "",
        email: "",
        message: "",

    };

    // getting the event handlers from our custom hook
    const { onChange, values, reset } = useForm(
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

           
            {/* // <Draggable>  */}
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
                                type="tel" 
                                placeholder="type your name to start"
                                onChange={onChange}
                                onKeyPress={handleNextLine}
                                required 
                            />
                        </div>

                        <p className={`${email === 'hidden' && styles.visibility}` }>/{values.name}/<span>~</span></p>
                        <div>
                            <span className={`${email === 'hidden' && styles.visibility}` }>{">"}</span>    
                            <input 
                                name="email" 
                                type="tel"
                                className={`${email === 'hidden' && styles.hidden}` }
                                placeholder="type your best email"  
                                onChange={onChange}
                                onKeyPress={handleNextLine}
                                required
                            />
                        </div>

                        <p className={`${message === 'hidden' && styles.visibility}`}>/{values.name}/<span>~</span></p>
                        <div>
                            <span className={`${message === 'hidden' && styles.visibility}`}>{">"}</span>                    
                            <input                             
                                name="message" 
                                type="tel"
                                className={`${message === 'hidden' && styles.hidden}` }
                                placeholder="type your message"
                                onChange={onChange}
                                onKeyPress={handleNextLine}
                                required
                            />
                        </div>
                        <p className={`${show !== 'message' && styles.visibility}`}>/{values.name}/message:<span>~</span></p>
                        <div className={`${show !== 'message' && styles.visibility} ${styles.review}`}>
                            <code>
                                {"{"}<br/>
                                <p>name:<span>{values.name}</span></p>
                                <p>email:<span>{values.email}</span></p>
                                <p>message:<span>{values.message}</span></p>
                                {"}"}
                            </code>
                        </div>

                        <p className={`${show !== 'message' && styles.visibility}`}>/{values.name}/<span>~</span></p>
                        <div>
                            <span className={`${show !== 'message' && styles.visibility}`}>{">"}</span>                    
                            <input                             
                                name="confirm" 
                                type="tel"
                                className={`${show !== 'message' && styles.hidden}` }
                                placeholder=""
                                value="do you want to send it? press Y or N"
                                onKeyPress={sendMessage}
                                required
                            />
                        </div>
                        <span>{error}</span>
                </form>
            </div>
            {/* // </Draggable> */}
                               
            </Modal>
            
        </div>
        
    )
}
