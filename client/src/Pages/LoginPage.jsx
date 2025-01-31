import { useContext ,useState } from "react";
import { Link, Navigate } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../UserContext.jsx";
export default function LoginPage(){
    const [email,setEmail] = useState('');
    const [password,setPassword] = useState('');
    const [redirect,setRedirect] = useState('');
    const {setUser} = useContext(UserContext);
    async function handleloginSubmit(eve){
        eve.preventDefault();
        try{
            const {data} = await axios.post('/login',{email,password});
            setUser(data);
            alert('Login Successfull');
            setRedirect(true);
        } catch(err){
            alert('Login Failed');
        }
    }
    if(redirect){
        return <Navigate to={'/'} />
    }
    return (
        <div className="mt-4 grow flex items-center justify-around">
            <div className="mb-64">
                <h1 className="text-4xl text-center mb-4">Login</h1>
                <form className="max-w-md mx-auto" onSubmit={handleloginSubmit} action="">
                    <input type="email" placeholder="your@gmail.com"
                    value={email}
                    onChange={eve => setEmail(eve.target.value)} />
                    <input type="password" placeholder="password"
                    value = {password}
                    onChange={eve =>setPassword(eve.target.value)}/>
                    <button className="primary">Login</button>
                    <div className="text-center py-2 text-gray-500">
                        Don't have an account yet? <Link className='underline text-black'to={'/register'}>Register now</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}