import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/User.js";
import Place from "./models/Place.js";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import imageDownloader from "image-downloader";
import { fileURLToPath } from "url";
import { dirname } from "path";
import multer from "multer";
import fs from 'fs';
import Booking from "./models/Booking.js";

dotenv.config();
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = process.env.JWT_SECRET || "default_jwt_secret";

app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));
app.use(cors({
    credentials: true,
    origin: 'http://localhost:5173',
}));

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000, // Increase to 30 seconds
    socketTimeoutMS: 45000, // Increase to 45 seconds
})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));

function getUserDataFromToken(req){
    return new Promise((resolve,reject) =>{
        jwt.verify(req.cookies.token, jwtSecret, {}, async (err, userData) => {
            if(err) throw err;
            resolve(userData);
        });
    });
}
    

app.get('/test', (req, res) => {
    res.json('test ok');
});

app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const userDoc = await User.create({
            name,
            email,
            password: bcrypt.hashSync(password, bcryptSalt),
        });
        res.json(userDoc);
    } catch (e) {
        res.status(422).json(e);
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const userDoc = await User.findOne({ email });
        if (userDoc) {
            const isPasswordCorrect = bcrypt.compareSync(password, userDoc.password);
            if (isPasswordCorrect) {
                jwt.sign({ email: userDoc.email, id: userDoc._id, name: userDoc.name }, jwtSecret, {}, (err, token) => {
                    if (err) throw err;
                    res.cookie('token', token).json(userDoc);
                });
            } else {
                res.status(422).json({ message: 'Invalid credentials' });
            }
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (e) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/profile', (req, res) => {
    const { token } = req.cookies;
    if (token) {
        jwt.verify(token, jwtSecret, {}, (err, user) => {
            if (err) {
                res.status(403).json({ message: 'Token is invalid' });
                return;
            }
            res.json(user);
        });
    } else {
        res.status(401).json({ message: 'No token provided' });
    }
});

app.post('/logout', (req, res) => {
    res.cookie('token', '').json(true);
});

app.post('/upload-by-link', async (req, res) => {
    const { link } = req.body;
    const newName = 'photo' + Date.now() + '.jpg';
    try {
        await imageDownloader.image({
            url: link,
            dest: __dirname + '/uploads/' + newName,
        });
        res.json(newName);
    } catch (e) {
        res.status(500).json({ message: 'Image download failed' });
    }
});

const photosMiddleware = multer({ dest: 'uploads/' });

app.post('/upload', photosMiddleware.array('photos', 100), (req, res) => {
    const uploadedFiles = [];
    try {
        for (let i = 0; i < req.files.length; i++) {
            const { path, originalname } = req.files[i];
            const parts = originalname.split('.');
            const extension = parts[parts.length - 1];
            const newpath = path + '.' + extension;
            fs.renameSync(path, newpath);
            uploadedFiles.push(newpath.replace('uploads\\', ''));
        }
        res.json(uploadedFiles);
    } catch (e) {
        res.status(500).json({ message: 'File upload failed' });
    }
});

app.post('/places', (req, res) => {
    const { token } = req.cookies;
    const { title, address, addedPhotos, description, perks, extraInfo, checkIn, checkOut, maxGuests, price } = req.body;
    jwt.verify(token, jwtSecret, {}, async (err, user) => {
        if (err) {
            res.status(403).json({ message: 'Invalid token' });
            return;
        }
        try {
            const placeDoc = await Place.create({
                owner: user.id,
                title, address, photos: addedPhotos, description, perks, extraInfo, checkIn, checkOut, maxGuests, price,
            });
            res.json(placeDoc);
        } catch (e) {
            res.status(500).json({ message: 'Place creation failed' });
        }
    });
});

app.get('/user-places', (req, res) => {
    const { token } = req.cookies;
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        if (err) {
            res.status(403).json({ message: 'Invalid token' });
            return;
        }
        try {
            const { id } = userData;
            const places = await Place.find({ owner: id });
            res.json(places);
        } catch (e) {
            res.status(500).json({ message: 'Failed to retrieve user places' });
        }
    });
});

app.get('/places/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const place = await Place.findById(id);
        res.json(place);
    } catch (e) {
        res.status(500).json({ message: 'Failed to retrieve place' });
    }
});

app.put('/places', async (req, res) => {
    const { token } = req.cookies;
    const { id, title, address, addedPhotos, description, perks, extraInfo, checkIn, checkOut, maxGuests, price } = req.body;
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        if (err) {
            res.status(403).json({ message: 'Invalid token' });
            return;
        }
        try {
            const placeDoc = await Place.findById(id);
            if (userData.id === placeDoc.owner.toString()) {
                placeDoc.set({
                    title, address, photos: addedPhotos, description, perks, extraInfo, checkIn, checkOut, maxGuests, price,
                });
                await placeDoc.save();
                res.json('ok');
            } else {
                res.status(403).json({ message: 'Unauthorized' });
            }
        } catch (e) {
            res.status(500).json({ message: 'Failed to update place' });
        }
    });
});

app.get('/places', async (req, res) => {
    try {
        const places = await Place.find();
        res.json(places);
    } catch (e) {
        res.status(500).json({ message: 'Failed to retrieve places' });
    }
});

app.post('/bookings', async (req, res) => {
    const userData = await getUserDataFromToken(req); 
    const {
        place, checkIn, checkOut, numberofGuests, name, phone, price
    } = req.body;
    try {
        const booking = await Booking.create({
            place, checkIn, checkOut, numberofGuests, name, phone, price, user:userData.id
        });
        res.json(booking);
    } catch (e) {
        res.status(500).json({ message: 'Booking creation failed' });
    }
});

app.get('/bookings',async(req,res)=>{
    const userData = await getUserDataFromToken(req);
    res.json(await Booking.find({user:userData.id}).populate('place'))
})

app.listen(4000, () => {
    console.log('Server is running on port 4000');
});
