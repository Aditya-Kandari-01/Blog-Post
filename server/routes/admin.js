const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const adminLayout = "../views/layouts/admin";
const jwtSecret = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });

    }
    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.userId = decoded.userId;
        next();
    }
    catch (error) {
        res.status(401).json({ message: 'Unauthorized' });
    }
}


//Get Home - Admin Login Page
router.get('/admin', async (req, res) => {
    try {
        const locals = {
            title: "Admin Panel",
            description: "Simple Blog created with NodeJs, MongoDb, and Express"
        }

        res.render('admin/index', { 
            locals, 
            currentRoute: req.path,  
            layout: adminLayout 
        });
    }
    catch (error) {
        console.log(error);
    }
});

// Login Form
router.post('/admin', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials'});
        }
        const token = jwt.sign({ userId: user._id }, jwtSecret)
        res.cookie('token', token, { httpOnly: true });
        res.redirect('/dashboard');
    }
    catch (error) {
        console.log(error);
    }
});

//DashBoard


router.get('/dashboard', authMiddleware, async (req, res) => {
    
    try {
        const locals = {
            title: "Dashboard Page",
            description: "Welcome to Dashboard"
        };
        const data = await Post.find();
        res.render('admin/dashboard', {
            locals, data,
            currentRoute: req.path,
            layout:adminLayout
        });
    } catch (error) {
        res.status(500).send('Server Error');
    }
});

// Create New Post

router.get('/add-post', authMiddleware, async (req, res) => {
    
    try {
        const locals = {
            title: "Add Post",
            description: "Posts"
        };
        const data = await Post.find();
        res.render('admin/add-post', {
            locals,layout:adminLayout
        });
    } catch (error) {
        res.status(500).send('Server Error');
    }
});

//Posting the new post

router.post('/add-post', authMiddleware, async (req, res) => {
    try {
        try{
            const newPost = new Post({
                title: req.body.title,
                body: req.body.body
            });
            await Post.create(newPost);
            res.redirect('/dashboard');
        }
        catch (error) {
            res.status(500).send('Server Error');    
        }
    } catch (error) {
        res.status(500).send('Server Error');
    }
});

// Check Validity - Register Form
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        try {
            const user = await User.create({ username, password: hashedPassword });
            res.status(201).json({ message: 'user Created', user });
        }
        catch (error) {
            if (error.code === 11000) {
                res.status(409).json({ message: 'User already in use' });
            }
            res.status(500).json({ message: 'Internal Server error' });
        }
    }
    catch (error) {
        console.log(error);
    }
});

//Get Admin - Create New Post

router.get('/edit-post/:id', authMiddleware, async (req, res) => {
    try {
        const locals = {
            title:"Edit Post",
            description:"NodeJs Management System",
        };

        const data = await Post.findOne({ _id: req.params.id });
        
        res.render('admin/edit-post',{
            locals,data,layout:adminLayout
        });
    } catch (error) {
        console.log(error);
    }
});





//Put Admin - Create New Post
router.put('/edit-post/:id', authMiddleware, async (req, res) => {
    try {
        await Post.findByIdAndUpdate(req.params.id, {
            title: req.body.title,
            body: req.body.body,
            updateAt: Date.now()
        });
        res.redirect(`/edit-post/${req.params.id}`);
    } catch (error) {
        console.log(error);
    }
});

router.delete('/delete-post/:id', authMiddleware, async (req, res) => {
    
    try {
        await Post.deleteOne({ _id: req.params.id });
        res.redirect('/dashboard');
    } catch (error) {
        res.render(error);
    }
});

router.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
});

module.exports = router;


// login basic 
/*router.post('/admin', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (req.body.username === 'admin' && req.body.password === 'password') {
            res.send('You are logged in.');
        }else {
            res.send('Wrong username or password');
        }
    }
    catch (error) {
        console.log(error);
    }
});*/ 