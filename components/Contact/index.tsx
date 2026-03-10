import Modal from 'react-modal';
import styles from './styles.module.scss'

import Draggable from 'react-draggable';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import validator from 'validator'

import { useForm } from '../../hooks/useForm';
import { useLocale } from '../../contexts/LocaleContext';
import {
    useEffect,
    useRef,
    useState,
    type ComponentType,
    type KeyboardEvent as ReactKeyboardEvent,
    type MouseEvent as ReactMouseEvent,
    type ReactNode,
    type RefObject,
} from 'react';

interface contactProps {
    setIsOpen: (arg: boolean) => void;
    modalIsOpen: boolean;
    display: string;
}

export function Contact({ modalIsOpen, setIsOpen, display }: contactProps) {
    const { t } = useLocale();
    const DraggableContainer = Draggable as unknown as ComponentType<{
        children: ReactNode;
        nodeRef?: RefObject<HTMLElement>;
    }>;

    const [email, setEmail] = useState<string>("hidden")
    const [message, setMessage] = useState<string>("hidden")
    const [show, setShow] = useState<string>("hidden")
    const [error, setError] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [count, setCount] = useState(0);

    const notifySuccess = () => toast.success(t('contact.success'), {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        });

    const notifyError = (message: string) => toast.error(message, {
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

    function handleEasterEgg() {

        if(count === 0){
            toast.success(t('contact.easterEgg1'), {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                });
            setCount(count + 1)
        }else{
            toast.warning(t('contact.easterEgg2'), {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                });
            setCount(0)
        }
        
        

    }

    function handleNextLine(event: ReactKeyboardEvent<HTMLInputElement>) {
        if (event.key.toLowerCase() === 'enter') {
            const input = event.currentTarget;
            const form = input.form;

            if (!form) {
                return;
            }

            const formElements = Array.from(form.elements);
            const index = formElements.indexOf(input);

            if (index <= 0) {
                const nextInput = formElements[index + 1];

                if(values.name.length >= 2){
                if (nextInput instanceof HTMLElement) {
                    nextInput.focus();
                }
                setEmail("visible")
                }else {
                    setError(t('contact.errorName'))
                }            

            } else if (index <= 1) {
                const nextInput = formElements[index + 1];

                if (validator.isEmail(values.email.toString())) {
                    if (nextInput instanceof HTMLElement) {
                        nextInput.focus();
                    }
                    setMessage("visible")
                } else {
                    setError(t('contact.errorEmail'))
                }

            } else if (index <= 2) {
                const nextInput = formElements[index + 1];

                if (values.message.length >= 20) {
                    if (nextInput instanceof HTMLElement) {
                        nextInput.focus();
                    }
                    setShow("message")
                    setMessage("men")
                } else {
                    setError(t('contact.errorMessageShort'))
                }


            } else {

                setError(t('contact.errorMessageLeave'))
            }
        }
    }

    async function submitContactMessage() {
        if (isSubmitting) {
            return;
        }

        setIsSubmitting(true);

        try {
            await sendMail()
            notifySuccess()
            delayCloseModal()
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : t('contact.errorSend');

            setError(message)
            notifyError(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    async function sendMessage(
        event: ReactKeyboardEvent<HTMLInputElement> | ReactMouseEvent<HTMLButtonElement>
    ) {
        event.preventDefault();

        if(display === "desktop"){
            if (!('key' in event)) {
                return;
            }

            if (event.key.toLowerCase() === "y") {
                await submitContactMessage()
            } else if (event.key.toLowerCase() === "n") {
                closeModal()
            } else {
                setError(t('contact.errorPressYN'))
            }
        }

        if(display === "mobile"){

            if(values.name.length >= 2){

                if (validator.isEmail(values.email.toString())) {                   
                    if(values.message.length >=10 ){
                        await submitContactMessage()
                    } else {
                        setError(t('contact.errorMessageShort'))                   
                    }
                } else {
                    setError(t('contact.errorEmail'))
                }                
            } else {
                setError(t('contact.errorName'))
            }
            
        }
    }

    async function sendMail() {
        const response = await fetch('/api/sendMail', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: values.name,
                email: values.email,
                text: values.message,
            })
        })

        const responseData = await response.json().catch(() => null)

        if (!response.ok) {
            throw new Error(responseData?.message ?? t('contact.errorSend'))
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

    const nodeRef = useRef<HTMLElement>(null);
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
            <DraggableContainer nodeRef={nodeRef}>
                    <div className={styles.container}>
                    
                        <header className={styles.header} ref={nodeRef}>
                            <div>
                                <button type="button" onClick={closeModal} />
                                <button type="button" onClick={handleEasterEgg} />
                                <button type="button" onClick={handleEasterEgg} />
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
                                    placeholder={t('contact.placeholderNameStart')}
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
                                    placeholder={t('contact.placeholderEmail')}
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
                                    placeholder={t('contact.placeholderMessage')}
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
                                    value={isSubmitting ? t('contact.sending') : t('contact.confirmPrompt')}
                                    onKeyPress={sendMessage}
                                    required
                                />
                            </div>
                            {show === 'message' &&
                            <span>{error}</span>}                            
                        </form>
                    </div> 
                    </DraggableContainer>
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
                                <button type="button" onClick={closeModal} />
                                <button type="button" onClick={handleEasterEgg} />
                                <button type="button" onClick={handleEasterEgg} />
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
                                    placeholder={t('contact.placeholderName')}
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
                                    placeholder={t('contact.placeholderEmail')}
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
                                    placeholder={t('contact.placeholderMessage')}
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
                                <span>{">"}{t('contact.doYouWantToSend')}</span>                               
                            </div>
                            <br/>
                            <div className={styles.buttons}>
                                <button type="button" onClick={sendMessage} disabled={isSubmitting}>
                                    {isSubmitting ? t('contact.sendingShort') : t('contact.yes')}
                                </button>
                                <span>{t('contact.or')}</span>
                                <button type="button" onClick={closeModal} disabled={isSubmitting}>{t('contact.not')}</button>
                            </div>
                            <span>{error}</span>                                                        
                        </form>
                    </div> 
            </Modal>}
        </div>

    )
}
