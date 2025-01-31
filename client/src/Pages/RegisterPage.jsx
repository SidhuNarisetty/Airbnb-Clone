import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
export default function RegisterPage(){
    const [name,setName] = useState('');
    const [email,setemail] = useState('');
    const [password,setPassword] = useState('');
    async function registerUser(eve){
        eve.preventDefault();
        try {await axios.post('/register',{
            name,
            email,
            password,
        });
        alert('Registration Successfull. now you can login');}
        catch(e){
            alert('Registration Failed. Please try again later');
        }
    }
    return (
        <div className="mt-4 grow flex items-center justify-around">
            <div className="mb-64">
                <h1 className="text-4xl text-center mb-4">Register</h1>
                <form className="max-w-md mx-auto" onSubmit={registerUser} >
                    <input type="text" 
                            placeholder="John Doe" 
                            value={name} 
                            onChange={eve=>setName(eve.target.value)} />
                    <input type="email" 
                            placeholder="your@gmail.com"
                            value={email}
                            onChange={eve=>setemail(eve.target.value)}/>
                    <input type="password" 
                            placeholder="password"
                            value={password}
                            onChange={eve=>setPassword(eve.target.value)}/>
                    <button className="primary">Register</button>
                    <div className="text-center py-2 text-gray-500">
                        Already a member? <Link className='underline text-black'to={'/login'}>Login</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}