const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

//Routes
router.get('', async (req, res) => {
    try{
    const locals = {
        title: "NodeJs Blog",
        description: "Simple Blog created with NodeJs,MongoDb and Express"
    }
    let perPage = 5;
    let page = parseInt(req.query.page) || 1;
    const data = await Post.aggregate([{ $sort: { createdAt: -1 } }]).skip(perPage * page - perPage).limit(perPage).exec();
    const count = await Post.countDocuments();
    const nextPage = page + 1;
    const hasNextpage = nextPage <= Math.ceil(count/perPage);
    res.render('index', {
        locals, data, current: page, nextPage: hasNextpage ? nextPage : null,currentRoute : '/'
    });
    }
    catch (error) {
        console.log(error);
    }
});




/*router.get('', async(req, res) => {
    const locals = {
        title: "NodeJs Blog",
        description:"Simple Blog created with NodeJs,MongoDb and Express"
    }

    try {
        const data = await Post.find();
        res.render('index', { locals, data });
    }catch (error) {
        console.log(error);
    }
});
*/

//Get Post : Passing Id

router.get('/post/:id', async (req, res) => {
    try {
        let slug = req.params.id;
        const data = await Post.findById({ _id: slug });

        const locals = {
            title: "NodeJs Blog",
            description: "Simple Blog created with NodeJs,MongoDb and Express",
            currentRoute : `/post/${slug}`
        }
        res.render('post', { locals, data ,currentRoute:'/'});
    }
    catch (error) {
        console.log(error);
    }
});

//Get Post : Id


router.post('/search', async (req, res) => {
    try {
        const locals = {
            title: "Search",
            description: "Simple Blog created with NodeJs,MongoDb and Express"
        }
        let searchTerm = req.body.searchTerm;
        const searchspecialchar = searchTerm.replace(/[^a-zA-Z0-9]/g, "")
        const data = await Post.find({
            $or: [
                { title: { $regex: new RegExp(searchspecialchar), $options: 'i' } },
                { body: { $regex: new RegExp(searchspecialchar), $options: 'i' } }
            ]
        });
        res.render("search", {
            data, locals
        });
    }
    catch (error) {
        console.log(error);
    }
});

router.get('/about', (req, res) => {
    res.render('about', {
        currentRoute:'/about'
    });
}
);



module.exports = router;

//insertPostData();
/*    
function insertPostData() {
        Post.insertMany([
            {
                title:"Building a Blog",
                body:"This is the body text"
            },
            {
                title: "Introduction to JavaScript",
                body: "JavaScript is a versatile language used for both client-side and server-side development."
            },
            {
                title: "Getting Started with Node.js",
                body: "Node.js allows you to run JavaScript outside the browser, making backend development easier and faster."
            },
            {
            title: "Mastering MongoDB",
            body: "MongoDB is a NoSQL database that stores data in flexible, JSON-like documents."
        },
        {
            title: "Understanding REST APIs",
            body: "REST APIs allow different software systems to communicate over HTTP using simple URL structures."
        },
        {
            title: "Deploying Applications to Heroku",
            body: "Heroku makes deployment of web applications seamless, supporting multiple languages and databases."
        },
        {
            title: "A Guide to Express.js",
            body: "Express.js is a lightweight web framework for Node.js, perfect for building APIs and web apps."
        }
        ])
    }
*/