// main.js
const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const db = require('./connectDB');

const port = 3000;
const app = express();

// Middleware: Parse JSON and URL data BEFORE router
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware: Serve frontend files and enable CORS
app.use(cookieParser());

// Update cors() middleware to allow cookies:
const corsOptions = {
    origin: 'http://localhost:5500', // ✅ include http://
    credentials: true,
};
app.use(cors(corsOptions));

// Serve images as static files.
app.use('/images', express.static(path.join(__dirname, 'images')));

// Handling login Page
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const sql = 'SELECT * FROM admin_logins WHERE username = ? and password = ?';
    db.query(sql, [username, password], (err, result) => {
        if (err) return res.status(500).send('Database Error');
        if (result.length > 0) {

            // Set cookie on successful login
            res.cookie('user', username ,{
                httpOnly :true,
                maxAge: 24 * 60 * 60 * 1000,
            });

            res.send(`Welcome back, ${username}`);
        } else {
            res.status(401).send('Invalid credentials');
        }
    })
});

app.get('/check-login', (req, res)=>{
    const user = req.cookies.user;
    if (user) {
        res.send(`✅ User still logged in: ${user}`);
    } else {
        res.status(401).send('❌ Not logged in');
    }
});

app.get('/logout', (req , res) =>{
    res.clearCookie('user',{
        httpOnly : true,
        sameSite : 'Lax',
        secure : false,
    });
    res.send('✅ Logged out successfully');
})

app.get('/courses', (req ,res) =>{
    const query_course = 'SELECT * FROM courses';
    db.query(query_course , (err,result) =>{
        if(err){
            console.error('DB error:', err);
            return res.status(500).send('❌ Failed to fetch courses');
        }

        const setImageURL = result.map(course =>{
            return{
            ...course,
            imageurl: `http://localhost:3000/images/courses/${course.imageurl}`
            };
        });

        res.json(setImageURL); // send back course data
    });
});

// Handle invalid routes
app.use((req, res) => {
    res.status(404).send('Invalid Path');
});

app.listen(port, () => {
    console.log(`🚀 Backend Server running on port ${port}`);
});
