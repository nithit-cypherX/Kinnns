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
            res.cookie('user', username, {
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000,
            });

            res.send(`Welcome back, ${username}`);
        } else {
            res.status(401).send('Invalid credentials');
        }
    })
});

app.get('/check-login', (req, res) => {
    const user = req.cookies.user;
    if (user) {
        res.send(`✅ User still logged in: ${user}`);
    } else {
        res.status(401).send('❌ Not logged in');
    }
});

app.get('/logout', (req, res) => {
    res.clearCookie('user', {
        httpOnly: true,
        sameSite: 'Lax',
        secure: false,
    });
    res.send('✅ Logged out successfully');
})

app.get('/courses', (req, res) => {
    const query_course = 'CALL GetAllCoursesWithCategories();';
    db.query(query_course, (err, results) => {
        if (err) {
            console.error('DB error:', err);
            return res.status(500).send('❌ Failed to fetch courses');
        }

        const courses = results[0]; // ✅ Only take the first result set (the real courses)

        const setImageURL = courses.map(course => ({
            ...course,
            imageurl: `http://localhost:3000/images/courses/${course.imageurl}`
        }));

        res.json(setImageURL); // ✅ send back clean array
    });
});


// ✅ Route to get all categories
app.get('/categories', (req, res) => {
    const query = 'SELECT * FROM categories';

    db.query(query, (err, results) => {
        if (err) {
            console.error('DB error:', err);
            return res.status(500).send('❌ Failed to fetch categories');
        }

        res.json(results); // ✅ send categories as an array
    });
});


// ✅ Route to filter courses by selected categories and selected price
// app.post('/filter-courses', (req, res) => {
//     const selectedCategories = req.body.categories || [];
//     const selectedPrices = req.body.prices || [];

//     let sql = `
//         SELECT 
//             courses.course_id,
//             courses.course_name,
//             courses.course_description,
//             courses.price,
//             courses.imageurl,
//             cat1.cat_name AS category_1_name,
//             cat2.cat_name AS category_2_name,
//             cat3.cat_name AS category_3_name
//         FROM courses
//         LEFT JOIN categories AS cat1 ON courses.cat_id_1 = cat1.cat_id
//         LEFT JOIN categories AS cat2 ON courses.cat_id_2 = cat2.cat_id
//         LEFT JOIN categories AS cat3 ON courses.cat_id_3 = cat3.cat_id
//         WHERE 1=1
//     `;

//     const params = [];

//     // Add category filters
//     if (selectedCategories.length > 0) {
//         const categoryPlaceholders = selectedCategories.map(() => '?').join(',');
//         sql += ` AND (
//             courses.cat_id_1 IN (${categoryPlaceholders})
//             OR courses.cat_id_2 IN (${categoryPlaceholders})
//             OR courses.cat_id_3 IN (${categoryPlaceholders})
//         )`;
//         params.push(...selectedCategories, ...selectedCategories, ...selectedCategories);
//     }

//     // Add price filters
//     if (selectedPrices.length > 0) {
//         sql += ` AND (`;

//         selectedPrices.forEach((range, index) => {
//             const [min, max] = range.split('-').map(Number);
//             sql += ` (courses.price BETWEEN ? AND ?) `;
//             if (index !== selectedPrices.length - 1) {
//                 sql += ` OR `;
//             }
//             params.push(min, max);
//         });

//         sql += `)`;
//     }

//     db.query(sql, params, (err, results) => {
//         if (err) {
//             console.error('DB error:', err);
//             return res.status(500).send('❌ Failed to filter courses');
//         }
//         res.json(results);
//     });
// });

app.post('/search-courses', (req, res) => {
    const { search_choice, search_value } = req.body;

    let sql = `
      SELECT 
        courses.course_id,
        courses.course_name,
        courses.course_description,
        courses.price,
        courses.imageurl,
        cat1.cat_name AS category_1_name,
        cat2.cat_name AS category_2_name,
        cat3.cat_name AS category_3_name
      FROM courses
      LEFT JOIN categories AS cat1 ON courses.cat_id_1 = cat1.cat_id
      LEFT JOIN categories AS cat2 ON courses.cat_id_2 = cat2.cat_id
      LEFT JOIN categories AS cat3 ON courses.cat_id_3 = cat3.cat_id
    `;

    const params = [];
    const conditions = [];

    if (search_value && search_choice) {
        if (search_choice === 'name') {
            conditions.push(`courses.course_name LIKE ?`);
            params.push(`%${search_value}%`);
        } else if (search_choice === 'price') {
            conditions.push(`courses.price < ?`);
            params.push(search_value);
        } else if (search_choice === 'category') {
            conditions.push(`(
                cat1.cat_name LIKE ?
                OR cat2.cat_name LIKE ?
                OR cat3.cat_name LIKE ?
            )`);
            params.push(`%${search_value}%`, `%${search_value}%`, `%${search_value}%`);
        }
    }

    // Only add WHERE if there are any conditions
    if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
    }

    db.query(sql, params, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('❌ Failed to search courses');
        }
        res.json(results);
    });
});


// Example backend route
app.get('/courses/:id', (req, res) => {
    const courseId = req.params.id;
  
    // 👇 Your database query here (example)
    db.query('SELECT * FROM courses WHERE course_id = ?', [courseId], (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Error fetching course' });
      }
      if (results.length === 0) {
        return res.status(404).json({ message: 'Course not found' });
      }
      res.json(results[0]); // Return only one course
    });
  });
  


// Handle invalid routes
app.use((req, res) => {
    res.status(404).send('Invalid Path');
});

app.listen(port, () => {
    console.log(`🚀 Backend Server running on port ${port}`);
});
