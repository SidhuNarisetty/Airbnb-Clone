import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"
import axios from "axios";
import PlaceGallery from "../PlaceGallary";
import BookingDates from "../BookingDates";
export default function BookingPage(){
    const {id} = useParams();
    const [booking,setBooking] = useState(null);
    useEffect(()=>{
        if(id){
            axios.get('/bookings').then(response =>{
                const foundBooking = response.data.find(({_id}) => _id === id);
                if(foundBooking){
                    setBooking(foundBooking);
                }
            });
        }
    },[id])

    if(!booking){
        return '';
    }

    return(
        <div className="my-8 ">
            <h1 className="text-3xl mb-8 mt-4">{booking.place.title}</h1>
            {/* <div className="bg-gray-200 p-6 mb-6 rounded-2xl flex items-center justify-between">
                    <div>
                        <h2 className="text-xl mb-4">Your Booking Information</h2>
                        <BookingDates booking = {booking}/>
                    </div>
                <div className="bg-primary p-4 text-white rounded-2xl">
                    <div>Total Price</div>
                    <div className="text-3xl">${booking.price}</div>
                </div> */}
                <PlaceGallery place={booking.place}/>
            </div>
        // </div>
    )
}