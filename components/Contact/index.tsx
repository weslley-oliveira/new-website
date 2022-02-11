import Modal from 'react-modal';
import styles from './styles.module.scss'

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import validator from 'validator'

import { useForm } from '../../hooks/useForm';
import { useEffect, useState } from 'react';

interface contactProps {
    setIsOpen: (arg: boolean) => void;
    modalIsOpen: boolean;
    display: string;
}

export function Contact({ modalIsOpen, setIsOpen, display }: contactProps) {

    const [email, setEmail] = useState<String>("hidden")
    const [message, setMessage] = useState<String>("hidden")
    const [show, setShow] = useState<String>("hidden")
    const [error, setError] = useState("")

    const notify = () => toast.success('Your message has been sent! Thank you for contact me!', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        });

    
   
    useEffect(
        () => {
            let timer = setTimeout(() => setError(""), 2000);

            return () => {
                clearTimeout(timer);
            };
        }, [error]);
    
    function delayCloseModal() {
            setTimeout(closeModal, 3000);
        }

    function closeModal() {
   
        reset()
        setIsOpen(false);
        setEmail("hidden")
        setMessage("hidden")
        setShow("hidden")
        setError("")
    }

    function handleNextLine(event: any) {
        if (event.key.toLowerCase() === 'enter') {
            const form = event.target.form;
            const index = [...form].indexOf(event.target);

            if (index <= 0) {

                if(values.name.length >= 2){
                form.elements[index + 1].focus();
                setEmail("visible")
                }else {
                    setError("Plese I need your name")
                }            

            } else if (index <= 1) {

                if (validator.isEmail(values.email.toString())) {
                    form.elements[index + 1].focus();
                    setMessage("visible")
                } else {
                    setError('Enter valid Email!')
                }

            } else if (index <= 2) {

                if (values.message.length >= 20) {
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
        if (event.key === '89') {
            
            setError("message enviada")

        }
    }

    function sendMessage(event: any) {
        event.preventDefault();

        if(display === "desktop"){
            if (event.key.toLowerCase() === "y") {
                sendMail()                               
                notify()
                delayCloseModal()
            } else if (event.key.toLowerCase() === "n") {
                closeModal()
            } else {
                setError("please press Y or N")
            }
        }

        if(display === "mobile"){

            if(values.name.length >= 2){

                if (validator.isEmail(values.email.toString())) {                   
                    if(values.message.length >=10 ){
                        sendMail()                               
                        notify()
                        delayCloseModal()
                    } else {
                        setError("Your message is to short")                   
                    }
                } else {
                    setError('Enter valid email!')
                }                
            } else {
                setError("Please inform your name")
            }
            
        }
    }

    function sendMail() {

        try {
            fetch('./api/sendMail', {
              method: 'post',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                name: values.name,
                email: values.email,
                text: values.message,
              }) 
            })             
            
          } catch(err) {
            console.log(err)
          }

    }
   
    const initialState = {
        name: "",
        email: "",
        message: "",

    };
    
    const { onChange, values, reset } = useForm(
        loginUserCallback,
        initialState
    );
    
    async function loginUserCallback() {


        // send "values" to database
    }

    return (
        <div>
            <ToastContainer />
            {display === "desktop" &&
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                className={styles.modal}
                overlayClassName={styles.overlay}
            >               
                    <div className={styles.container}>
                        <header className={styles.header}>
                            <div>
                                <button onClick={closeModal} />
                                <button onClick={closeModal} />
                                <button onClick={() => setEmail("hidden")} />
                            </div>
                            <p>contact-me:~</p>
                            <span>{""}</span>
                        </header>
                        <form>
                            {/* Name */}
                            <p>/ <span>~</span></p>
                            <div>
                                <span>{">"}</span>
                                <input
                                    autoFocus
                                    name="name"
                                    type="text"
                                    placeholder="type your name to start"
                                    onChange={onChange}
                                    onKeyPress={handleNextLine}
                                    required
                                />
                            </div>
                            {/* Email */}
                            <p className={`${email === 'hidden' && styles.visibility}`}>/{values.name}/<span>~</span></p>
                            <div>
                                <span className={`${email === 'hidden' && styles.visibility}`}>{">"}</span>
                                <input
                                    name="email"
                                    type="email"
                                    className={`${email === 'hidden' && styles.hidden}`}
                                    placeholder="type your best email"
                                    onChange={onChange}
                                    onKeyPress={handleNextLine}
                                    required
                                />
                            </div>
                            {message === "hidden" &&
                            <span>{error}</span>}
                            {/* Message */}
                            <p className={`${message === 'hidden' && styles.visibility}`}>/{values.name}/<span>~</span></p>
                            <div>
                                <span className={`${message === 'hidden' && styles.visibility}`}>{">"}</span>
                                <input
                                    name="message"
                                    type="text"
                                    className={`${message === 'hidden' && styles.hidden}`}
                                    placeholder="type your message"
                                    onChange={onChange}
                                    onKeyPress={handleNextLine}
                                    required
                                />
                            </div>
                            {message !== "hidden" && show !== 'message' &&
                            <span>{error}</span>}                            
                            <p className={`${show !== 'message' && styles.visibility}`}>/{values.name}/message:<span>~</span></p>
                            <div className={`${show !== 'message' && styles.visibility} ${styles.review}`}>
                                <code>
                                    {"{"}<br />
                                    <p>name:<span>{values.name}</span></p>
                                    <p>email:<span>{values.email}</span></p>
                                    <p>message:<span>{values.message}</span></p>
                                    {"}"}
                                </code>
                            </div>
                            {/* Send Message */}
                            <p className={`${show !== 'message' && styles.visibility}`}>/{values.name}/<span>~</span></p>
                            <div>
                                <span className={`${show !== 'message' && styles.visibility}`}>{">"}</span>
                                <input
                                    name="confirm"
                                    type="text"
                                    className={`${show !== 'message' && styles.hidden}`}
                                    placeholder=""
                                    readOnly
                                    value="do you want to send it? press Y or N"
                                    onKeyPress={sendMessage}
                                    required
                                />
                            </div>
                            {show === 'message' &&
                            <span>{error}</span>}                            
                        </form>
                    </div> 
            </Modal>}
            {display === "mobile" &&
                <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                className={styles.modal}
                overlayClassName={styles.overlay}
            >               
                    <div className={styles.container}>
                        <header className={styles.header}>
                            <div>
                                <button onClick={closeModal} />
                                <button onClick={closeModal} />
                                <button onClick={() => setEmail("hidden")} />
                            </div>
                            <p>contact-me:~</p>
                            <span>{""}</span>
                        </header>
                        <form>
                            {/* Name */}
                            <p>name<span>~</span></p>
                            <div>
                                <span>{">"}</span>
                                <input
                                    autoFocus
                                    name="name"
                                    type="text"
                                    placeholder="type your name"
                                    onChange={onChange}
                                    onKeyPress={handleNextLine}                                    
                                />
                            </div>
                            {/* Email */}
                            <p>email<span>~</span></p>
                            <div>
                                <span>{">"}</span>
                                <input
                                    name="email"
                                    type="email"                                    
                                    placeholder="type your best email"
                                    onChange={onChange}
                                    onKeyPress={handleNextLine}                                   
                                />
                            </div>
                            
                            <p>message<span>~</span></p>
                            <div>
                                <span>{">"}</span>
                                <input
                                    name="message"
                                    type="text"                                    
                                    placeholder="type your message"
                                    onChange={onChange}
                                    onKeyPress={handleNextLine}                                    
                                />
                            </div>                                                     
                            <br/>
                            <div className={styles.review}>
                                <code>
                                    {"{"}<br />
                                    <p>name:<span>{values.name}</span></p>
                                    <p>email:<span>{values.email}</span></p>
                                    <p>message:<span>{values.message}</span></p>
                                    {"}"}
                                </code>
                            </div>
                            {/* Send Message */}
                            <br/>
                            <div>
                                <span>{">"}do you want send it?</span>                               
                            </div>
                            <br/>
                            <div className={styles.buttons}>
                                <button onClick={sendMessage}>yes</button>
                                <span>or</span>
                                <button onClick={closeModal}>not</button>
                            </div>
                            <span>{error}</span>                                                        
                        </form>
                    </div> 
            </Modal>}
        </div>

    )
}
