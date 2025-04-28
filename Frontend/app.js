const express = require('express');
const path = require('path');

const port = 5500;
const app = express();

// Middleware: Parse JSON and URL data BEFORE router
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware: Serve static frontend files
app.use(express.static(path.join(__dirname, '../Frontend')));

// Router: For switching pages if needed
const router = express.Router();
app.use(router);


router.get('/home-page', (req, res) => {
    console.log(`Request at ${req.url}`);  // Correct the template string here
    res.sendFile(path.join(__dirname, '../Frontend/index.html'));  // Correct path
});


router.get('/login-page', (req,res) =>{
    console.log(`Request at ${req.url}`);  // Correct the template string here
    res.sendFile(path.join(__dirname, '../Frontend/src/pages/login.html'));  // Correct path
})

router.get('/admin-dashboard-page', (req, res) => {
    console.log(`Request at ${req.url}`);
    res.sendFile(path.join(__dirname, '../Frontend/src/pages/admin_dashboard.html'));
});


router.get('/searching-page', (req, res) => {
    console.log(`Request at ${req.url}`);
    res.sendFile(path.join(__dirname, '../Frontend/src/pages/searching.html'));
});


router.get('/course-management-page', (req, res) =>{
    console.log(`Request at ${req.url}`);
    res.sendFile(path.join(__dirname, '../Frontend/src/pages/course_management.html'));
});

router.get('/menu-management-page', (req, res) =>{
    console.log(`Request at ${req.url}`);
    res.sendFile(path.join(__dirname, '../Frontend/src/pages/menu_management.html'));
});


router.get('/team-page', (req, res) =>{
    console.log(`Request at ${req.url}`);
    res.sendFile(path.join(__dirname, '../Frontend/src/pages/team.html'));
});

// Handle invalid routes
router.use((req, res) => {
    console.log(`Request at ${req.url}`);
    console.log('404: Invalid access');
    res.status(404).send('404 Not Found');
});



app.listen(port, () => {
    console.log(`🚀 Frontend Server running on port ${port}`);
});
