import express from 'express';
import { Request, Response, NextFunction } from 'express';
// import { MongoClient, ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import session from 'express-session';
import connectMongo from 'connect-mongo';
import authRoutes from './routes/auth';
import protectedRoutes from './routes/protected';
import bodyParser from 'body-parser';

import bcrypt from 'bcrypt';
import { connectToDatabase } from './db';
import dotenv from 'dotenv';


dotenv.config(); // Load environment variables from .env file

const app = express();
// const fs = require('fs');
// const uri = fs.readFileSync('./db.ini', 'utf8');
// console.log("MongoDB URI: " + uri);

const PORT = process.env.PORT || 5000;

const SESSION_SECRET = process.env.SESSION_SECRET as string; // Use the session secret from environment variables

if (!SESSION_SECRET) {
    throw new Error('SESSION_SECRET is not defined in the environment variables');
}


declare module 'express-session' {
  interface SessionData {
    userId: string;
    isAdmin: boolean;
  }
}

// Connect to the database
const MongoStore = connectMongo;


// Debugging middleware to log all incoming requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use(bodyParser.json());
app.use(cookieParser());
// Allow cross-origin requests from http://localhost:3000
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// app.use(session({
//   secret: SESSION_SECRET,
//   resave: false,
//   saveUninitialized: true,
//   cookie: { secure: false } // Set to true if using HTTPS
// }));
// Configure session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI! }),
    cookie: { secure: false }, // Set to true if using HTTPS
  })
);

app.use('/auth', authRoutes);
app.use('/protected', protectedRoutes);

mongoose.connect(process.env.MONGO_URI!)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);


// Connect to the database
// async function connectToDatabase() {
//   try {
//     await client.connect();
//     const db = client.db('streammon');

//     app.post('/api/register', async (req: Request, res: Response) => {
//       console.log("/api/register: Got a request to register");
//       const { username, password } = req.body;
//       const hashedPassword = await bcrypt.hash(password, 10);

//       const newUser: User = {
//         username,
//         password: hashedPassword,
//         enabled: '1',
//         isAdmin: false
//       };

//       try {
//         await db.collection('users').insertOne(newUser);
//         res.status(201).json({ message: 'User registered successfully' });
//       } catch (error) {
//         console.log(error);
//         res.status(500).json({ message: 'Error registering user' });
//       }

//       console.log('Got a request to register');
//     });

//     app.post('/api/login', async (req: Request, res: Response) => {
//       const { username, password } = req.body;
//       console.log('/api/login: Got a request to login ' + username);

//       try {
//         const user = await db.collection('users').findOne({ username });
//         if (user && password === user.password) {
//           console.log("User password is correct");
//           req.session.userId = user._id.toString();
//           req.session.isAdmin = user.isAdmin;

//           console.log('Login successful for userId:' + req.session.userId);

//           // Generate a new JWT token
//           const token = jwt.sign(
//             { userId: user._id.toString(), isAdmin: user.isAdmin },
//             SECRET_KEY as string,
//             { expiresIn: '1h' } // Token expires in 1 hour
//           );

//           // Add this to a list of allowed tokens
//           allowedTokens.add(token);

//           // Respond with the token
//           res.json({ token, username: user.username });
//         } else {
//           res.status(401).json({ message: 'Invalid username or password' });
//         }
//       } catch (error) {
//         console.log("Error: " + error);
//         res.status(500).json({ message: 'Error logging in' });
//       }

//     });

//     // Returns valid as true if the given token is valid
//     app.post('/api/validateToken', (req: Request, res: Response) => {
      
//       const token = req.body.token;
//       // console.log ("Got a request to validate a token: " + token);
//       jwt.verify(token, SECRET_KEY as string, (err:any, decoded:any) => {
//         if (err) {
//           console.log ("/api/validateToken: Token did not validate with SECRET_KEY, returning unauthorized");
//           res.json({ valid: false });
//         } else {
//           console.log ("/api/validateToken: Token validated with SECRET_KEY, returning valid");
//           res.json({ valid: true });
//         }
//       });
//     }
//     ); 
    


//     // Middleware to verify JWT token
//     function verifyToken(req: Request, res: Response, next: NextFunction) {      
//       // Get the token from the Authorization header
//       const token = req.headers['authorization']?.split(' ')[1];

//       console.log ("verifyToken(): Got a request to verify a token: " + token);

//       // If there is no token, return Unauthorized
//       if (!token) {
//         console.log ("verifyToken(): No token found in headers, returning unauthorized");
//         res.status(401).json({ message: 'Unauthorized' });
//         return;
//       }

//       // If the token is not in the allowedTokens set, return Unauthorized
//       if (!allowedTokens.has(token)) {
//         console.log ("verifyToken(): Token not found in allowedTokens, returning unauthorized");
//         res.status(401).json({ message: 'Unauthorized' });
//         return;
//       }
    
//       // If the token does not validate with the SECRET_KEY, return Unauthorized
//       jwt.verify(token, SECRET_KEY as string, (err, decoded) => {
//         if (err) {
//           console.log ("Token did not validate with SECRET_KEY, returning unauthorized");
//           res.status(401).json({ message: 'Unauthorized' });
//           allowedTokens.delete(token);
//           return;
//         }
//         req.session.userId = (decoded as any).userId;
//         req.session.isAdmin = (decoded as any).isAdmin;        
//         next();
//       });
//     }

//     app.post('/api/logout', (req: Request, res: Response) => {
//       console.log('Got a request to logout');
//       req.session.userId = undefined;
//       req.session.isAdmin = false;
      

//       // Invalidate the JWT token
//       const token = req.headers['authorization']?.split(' ')[1];
//       if (token) {
//         console.log('Invalidating token:', token);
//         allowedTokens.delete(token);
//       }

//       else {
//         console.log('No token to invalidate');
//       }



//     });

//     app.get('/api/login_status', verifyToken, (req: Request, res: Response) => {
//       // Verify the JWT token using verifyToken (above) and return the login status
//       res.json({ loggedIn: true, username: req.session.userId, isAdmin: req.session.isAdmin });
//     });

//     app.post('/api/updatePushover', verifyToken, async (req: Request, res: Response) => {
//       const { pushover_id, pushover_token } = req.body;

//       try {
//         await db.collection('users').updateOne(
//           { _id: new ObjectId(req.session.userId) },
//           { $set: { pushover_id, pushover_token } }
//         );
//         res.json({ message: 'Pushover details updated successfully' });
//       } catch (error) {
//         console.log(error);
//         res.status(500).json({ message: 'Error updating pushover details' });
//       }
//       console.log('Got a request to update pushover details');
//     });




//     app.listen(3000, () => {
//       console.log('Server is running on port 3000');
//     });
//   } catch (error) {
//     console.log(error);
//   }
});