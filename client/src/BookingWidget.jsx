import { useContext, useEffect, useState } from "react";
import { differenceInCalendarDays } from "date-fns";
import { Navigate } from "react-router-dom";
import axios from "axios";
import {UserContext} from "./UserContext";

export default function BookingWidget({place}){
    const [checkIn,setCheckIn] = useState('');
    const [checkOut,setCheckOut] = useState('');
    const [numberofGuests,setNumberofGuests] = useState(1);
    const [name,setName] = useState('');
    const [phone,setPhone] = useState('');
    const [redirect,setRedirect] = useState('');
    const {user} = useContext(UserContext);
    useEffect(()=>{
        if(user){
            setName(user.name);
        }
    },[user]);
    let numberofNights = 0;
    if(checkIn && checkOut){
        numberofNights = differenceInCalendarDays(new Date(checkOut), new Date(checkIn));
    }
    async function bookThisPlace(){
        const response = await axios.post('/bookings', {
            checkIn,checkOut,numberofGuests,name,phone,
            place:place._id,
            price:numberofNights*(place.price)
        });
        const bookingId = response.data._id;
        setRedirect(`/account/bookings/${bookingId}`);
    }
    if(redirect){
        return <Navigate to = {redirect}/>
    }
    return(
        <div className="bg-white shadow p-4 rounded-2xl">
            <div className="text-2xl text-center">
                Price: ${place.price} per night
            </div>
            <div className="border rounded-2xl mt-4">
                <div className="flex">
                    <div className="py-3 px-4 ">
                        <label>Check In:</label>
                        <input type="date" value={checkIn} onChange={ev => setCheckIn(ev.target.value)}/>
                    </div>
                    <div className="py-3 px-4 border-l">
                        <label>Check Out:</label>
                        <input type="date" value={checkOut} onChange={ev => setCheckOut(ev.target.value)}/>
                    </div>
                </div>
                <div>
                    <div className="py-3 px-4 border-t">
                        <label>Number of Guests:</label>
                        <input type="number"  value={numberofGuests} onChange={ev => setNumberofGuests(ev.target.value)}/>
                    </div>
                    {numberofNights > 0 && (
                        <>
                            <div className="py-3 px-4 border-t">
                                <label>Your full Name:</label>
                                <input type="text" placeholder="Sidhu Narisetty" value={name} onChange={ev => setName(ev.target.value)}/>
                            </div>
                            <div className="py-3 px-4 border-t">
                                <label>Your Mobile Number:</label>
                                <input type="tel" placeholder="+91 1234567890" value={phone} onChange={ev => setPhone(ev.target.value)}/>
                            </div>
                        </>
                    )}
                </div>
            </div>
            <button onClick={bookThisPlace} className="primary mt-4">
                Book this place
                {numberofNights > 0 &&(
                    <span>${numberofNights * place.price}</span>
                )}
            </button>
        </div>
    );
}