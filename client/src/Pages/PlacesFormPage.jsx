import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Navigate } from 'react-router-dom';
import PhotosUploader from '../PhotosUploader';
import Perks from '../Perks';
import AccountNav from './AccountNav';

axios.defaults.baseURL = 'http://localhost:4000';
axios.defaults.withCredentials = true;

export default function PlacesFormPage() {
    const { id } = useParams();
    const [title, setTitle] = useState('');
    const [address, setAddress] = useState('');
    const [addedPhotos, setAddedPhotos] = useState([]);
    const [description, setDescription] = useState('');
    const [perks, setPerks] = useState([]);
    const [extraInfo, setExtraInfo] = useState('');
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [maxGuests, setMaxGuests] = useState(1);
    const [price, setPrice] = useState(100);
    const [redirect, setRedirect] = useState(false);

    useEffect(() => {
        if (!id) return;

        axios.get(`/places/${id}`).then(response => {
            const data = response.data;
            setTitle(data.title);
            setAddress(data.address);
            setAddedPhotos(data.photos);
            setDescription(data.description);
            setPerks(data.perks);
            setExtraInfo(data.extraInfo);
            setCheckIn(data.checkIn);
            setCheckOut(data.checkOut);
            setMaxGuests(data.maxGuests);
            setPrice(data.price);
        }).catch(error => console.error('Error fetching place data:', error));
    }, [id]);

    async function savePlace(e) {
        e.preventDefault();
        const placeData = { title, address, addedPhotos, description, perks, extraInfo, checkIn, checkOut, maxGuests, price };
        try {
            if (id) {
                await axios.put('/places', { id, ...placeData });
            } else {
                await axios.post('/places', placeData);
            }
            setRedirect(true);
        } catch (error) {
            console.error('Error saving place:', error);
        }
    }

    if (redirect) {
        return <Navigate to="/account/places" />;
    }

    return (
        <div>
            <AccountNav />
            <form onSubmit={savePlace}>
                {preinput('Title', 'Title for your place. Should be short and catchy as in advertisement')}
                <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Title, for example: My Lovely Apartment"
                />
                {preinput('Address', 'Address to this place')}
                <input
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="Address"
                />
                {preinput('Photos', 'More = better')}
                <PhotosUploader addedPhotos={addedPhotos} onChange={setAddedPhotos} />
                {preinput('Description', 'Description of the place')}
                <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                />
                {preinput('Perks', 'Select all the perks of your place')}
                <div className="grid mt-2 gap-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                    <Perks selected={perks} onChange={setPerks} />
                </div>
                {preinput('Extra Info', 'House rules, etc')}
                <textarea
                    value={extraInfo}
                    onChange={e => setExtraInfo(e.target.value)}
                />
                {preinput('Check In, Check Out Time and Maximum number of guests', 'Add check-in and check-out times, remember to have some time window for cleaning the room between guests')}
                <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
                    <div>
                        <h3 className="mt-2 -mb-1">Check in time</h3>
                        <input
                            type="text"
                            value={checkIn}
                            onChange={e => setCheckIn(e.target.value)}
                            placeholder="14:00"
                        />
                    </div>
                    <div>
                        <h3 className="mt-2 -mb-1">Check out time</h3>
                        <input
                            type="text"
                            value={checkOut}
                            onChange={e => setCheckOut(e.target.value)}
                            placeholder="11:00"
                        />
                    </div>
                    <div>
                        <h3 className="mt-2 -mb-1">Maximum number of guests</h3>
                        <input
                            type="number"
                            value={maxGuests}
                            onChange={e => setMaxGuests(e.target.value)}
                        />
                    </div>
                    <div>
                        <h3 className="mt-2 -mb-1">Price per Night</h3>
                        <input
                            type="number"
                            value={price}
                            onChange={e => setPrice(e.target.value)}
                        />
                    </div>
                </div>
                <button className="primary my-4">Save</button>
            </form>
        </div>
    );

    function preinput(header, description) {
        return (
            <div>
                <h2 className="text-2xl mt-4">{header}</h2>
                <p className="text-gray-500 text-sm">{description}</p>
            </div>
        );
    }
}
