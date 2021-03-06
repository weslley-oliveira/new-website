import { useState } from "react";

interface Values {
    name:String;
    email: String;
    message:String;
}
// useForm functional componen
export const useForm = (callback: any, initialState : Values) => {
    const [values, setValues] = useState(initialState);

    // onChange
    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValues({ ...values, [event.target.name]: event.target.value });
    };    

    // reset
    const reset = () => {
        setValues(initialState);
    };

    // return values
    return {
        onChange,      
        values,
        reset,
    };

}

    