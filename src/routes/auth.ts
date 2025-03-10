import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';

const router = Router();

// Register route
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    res.status(201).send('User registered');
  } catch (error) {
    res.status(400).send('Error registering user');
  }
});

// Login route
router.post('/login', async (req, res) => {
  console.log("Got a login request");
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (user) {
      if (user.enabled === "0") {
        console.log("User is disabled");
        res.status(403).send('User is disabled');
        return;
      }
      
      let passwordMatch = false;
      try {
        passwordMatch = await bcrypt.compare(password, user.password);
      } catch (bcryptError) {
        console.error('Error comparing passwords with bcrypt', bcryptError);
        
      }

      if (passwordMatch) {
        req.session.userId = user._id.toString();
        res.send('Logged in');
      } else {
        console.error('Bcrypt comparison failed, falling back to plaintext comparison');
        
        passwordMatch = password === user.password;              
        if (passwordMatch) {
          req.session.userId = user._id.toString();
          res.send('Logged in');
        } else {
          console.log ("Those passwords don't match");
          res.status(401).send('Invalid credentials');
        }
      }
    } else {
      console.log ("User ", username, " not found");
      res.status(401).send('Invalid credentials');
    }
  } catch (error) {
    console.error('Error logging in', error);
    res.status(400).send('Error logging in');
  }
});


// Logout route
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.send('Logged out');
  });
});

// Session check route
router.get('/me', async (req, res) => {
  if (req.session.userId) {
    // console.log("/auth/me Session has userId, looking up user" + req.session.userId);
    const
    user = await User.findById(req.session
    .userId);
    if (user) {
      console.log("/auth/me User found, returning username: " + user.username);
      res.send(user.username);
    } else {
      res.status(404).send('User not found');
    }
  } else {
    console.log("/auth/me Session has no userId, returning Not logged in");
    res.status(401).send('Not logged in');
  }
});

export default router;
