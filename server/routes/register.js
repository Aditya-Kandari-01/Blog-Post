const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const adminLayout = '../views/layouts/login';
const registerLayout = '../views/layouts/register';
const logOutLayout = '../views/layouts/logout';
const jwtSecret = "MySecretBlog";

const authMiddleware = (req, res, next) => {
    const token = req.cookies.token; // cookies['token'] = <token_value>

    if (!token) {
        res.status(401).json({ message: 'Unauthorized' })
    }
    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Unauthorized' });
    }
}


//Registration Page
router.get('/register', async (req, res) => {
    try {
        const locals = {
            title: "Regsitration",
            description: "Feel free to add blog Posts"
        }
        res.render('admin/registeration', { locals, layout: registerLayout,currentRoute:'/register' });
    } catch (error) {
        console.log(error)
    }
});
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        try {
            const user = await User.create({ username, password: hashedPassword })
            return res.render('success', {
                currentRoute:'/register',
                message: 'You have registered successfully!'
            });
        } catch (error) {
            if (error.code === 11000) {
                res.status(409).json({ message: 'User already in use' })
            }
            res.status(500).json({ message: 'Internal Sever Error' })
        }

        // if (username && password){
        //     return res.render('success', {
        //         message: 'You have registered successfully!',
        //     });
        // }
        // return res.render('register',{error:"Username and Password are required"});
    } catch (error) {
        console.log(error)
    }
});



router.get('/login', async (req, res) => {
    try {
        const locals = {
            title: "Login",
            description: "Feel free to add blog Posts"
        }
        res.render('admin/login', { locals, layout: adminLayout });
    } catch (error) {
        console.log(error)
    }
});
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username })
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ userId: user._id }, jwtSecret)
        res.cookie('token', token, { httpOnly: true })
        res.redirect('/dashboard');

        // if (req.body.username === 'admin' && req.body.password === 'pass'){
        //     res.render('index', { locals, layout: adminLayout });
        // }
        // else {
        //     res.send("Wrong Username or Password")
        // }
    } catch (error) {
        console.log(error)
    }
});

router.get('/dashboard', authMiddleware, async (req, res) => {
    try {
        const locals = {
            title: "Dashboard",
            description: "Feel Free to write about yourself"
        }
        const data = await Post.find();
        res.render('admin/dashboard', { locals, data, layout: logOutLayout })
    } catch (error) {
        console.log(error)
    }
});
router.get('/add-post', authMiddleware, async (req, res) => {
    try {
        const locals = {
            title: "Add Post",
            description: "Feel Free to write about yourself"
        }
        const data = await Post.find();
        res.render('admin/add-post', { locals, layout: adminLayout })
    } catch (error) {
        console.log(error)
    }
});
router.post('/add-post', authMiddleware, async (req, res) => {
    try {
        try{
            const newPost = new Post({
                title: req.body.title,
                body: req.body.content_area
            });
            await Post.create(newPost);
            res.render('admin/add-post',{
                currentRoute:'/add-post'
            })
        }
        catch (error) {
            res.status(500).send('Server Error');    
        }
    } catch (error) {
        res.status(500).send('Server Error');
    }
});

router.get('/edit-post/:id', authMiddleware, async (req, res) => {
    try {
        const locals = {
            title: "Edit Post",
            description: "Feel Free to write about yourself"
        }
        const data = await Post.findOne({ _id: req.params.id });
        res.render('admin/edit-post', {
            locals,
            data,
            layout: adminLayout,
        })
    } catch (error) {
        console.log(error)
    }
});
router.put('/edit-post/:id', authMiddleware, async (req, res) => {
    try {
        await Post.findByIdAndUpdate(req.params.id, {
            title: req.body.title,
            body: req.body.content_area,
            updatedAt: Date.now()
        })
        res.redirect(`/edit-post/${req.params.id}`)
    }
    catch (error) {
        console.log(error)
    }
})

router.delete('/delete-post/:id', authMiddleware, async (req, res) => {
    try {
        await Post.deleteOne({ _id: req.params.id });
        res.redirect('/dashboard');
    } catch (error) {
        console.log(error)
    }
});

//LogOut
router.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
})



module.exports = router;


