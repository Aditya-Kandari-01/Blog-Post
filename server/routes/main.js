const express = require('express')
const router = express.Router();
const Post = require('../models/Post')
const Contact = require('../models/Contact')


//Home Page
router.get('', async (req, res) => {
    try {
        const locals = {
            title: "NodeJs Blog Posts",
            description: "repracticing the simple blog post webpage designing and deploying it"
        }
        let perpage = 10;
        let page = parseInt(req.query.page) || 1;
        const data = await Post.aggregate([{
            $sort: { createdAt: -1 } //-1:desc(newest to oldest) 1:asc(oldest to newest) 0:no sorting
        }]).skip(perpage * page - perpage).limit(perpage).exec();
        const count = await Post.countDocuments();
        const nextPage = parseInt(page) + 1
        const hasNextPage = nextPage <= Math.ceil(count / perpage);

        res.render('index', { locals, data, current: page, nextPage: hasNextPage ? nextPage : null ,currentRoute:'/'});
    }
    catch (error) {
        console.log(error);
    }
});



router.get('/post/:id', async (req, res) => {
    try {
        let slug = req.params.id;
        const data = await Post.findById({ _id: slug });
        const locals = {
            title: data.title,
            description: "repracticing the simple blog post webpage designing and deploying it",
        }
        res.render('post', { locals, data, currentRoute: `/post/${slug}` });
    }
    catch (error) {
        console.log(error);
    }
});
router.post('/search', async (req, res) => {
    try {
        const locals = {
            title: "Search",
            description: "repracticing the simple blog post webpage designing and deploying it"
        }
        let searchTerm = req.body.searchTerm;
        const searchNoSpecialCharacters = searchTerm.replace(/[^a-zA-Z0-9]/g, "")
        const data = await Post.find({
            $or: [
                { title: { $regex: new RegExp(searchNoSpecialCharacters, 'i') } },
                { body: { $regex: new RegExp(searchNoSpecialCharacters, 'i') } }
            ]
        });
        res.render('search', { locals, data });
    }
    catch (error) {
        console.log(error);
    }
});


router.get('/about', (req, res) => {
    res.render('about',{
        currentRoute:'/about'
    });
});
router.get('/contact', (req, res) => {
    res.render('contact',{
        currentRoute:'/contact'
    });
});

router.post('/contact',async(req,res)=>{
    console.log('POST /contact called', req.body);
    try{
        const newContact = new Contact({
            name: req.body.name,
            email: req.body.email,
            message: req.body.message,
        })
        await Contact.create(newContact);
        
        res.render('contact',{
            currentRoute:'/contact'
        });
    }
    catch(error){
        console.error(error);
        res.status(500).send("Something went wrong");
    }
})
// function insertPostData() {
//     Post.insertMany([
//         {
//             title: "Building a Blog",
//             body: "This is the body text"
//         },
//         {
//             title: "Introduction to JavaScript",
//             body: "JavaScript is a versatile language used for both client-side and server-side development."
//         },
//         {
//             title: "Getting Started with Node.js",
//             body: "Node.js allows you to run JavaScript outside the browser, making backend development easier and faster."
//         },
//         {
//             title: "Mastering MongoDB",
//             body: "MongoDB is a NoSQL database that stores data in flexible, JSON-like documents."
//         },
//         {
//             title: "Understanding REST APIs",
//             body: "REST APIs allow different software systems to communicate over HTTP using simple URL structures."
//         },
//         {
//             title: "Deploying Applications to Heroku",
//             body: "Heroku makes deployment of web applications seamless, supporting multiple languages and databases."
//         },
//         {
//             title: "A Guide to Express.js",
//             body: "Express.js is a lightweight web framework for Node.js, perfect for building APIs and web apps."
//         }
//     ])
// }

// insertPostData();
module.exports = router;