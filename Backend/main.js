// main.js
const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const fs = require('fs');
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

// Setup multer for image uploads (Save to /images/courses/)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'images/courses'));
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // Save with original filename
    }
});

const upload= multer({ storage: storage });

const storageMenu = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'images/menues'));
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // Save with original filename
    }
});

const uploadMenu = multer({ storage: storageMenu });

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

// 🔥 Update a course
app.put('/courses/:id', upload.single('image'), (req, res) => {
    const courseId = req.params.id;
    const {
        course_name,
        course_description,
        cat_id_1,
        cat_id_2,
        cat_id_3,
        price
    } = req.body;

    const newImage = req.file ? req.file.filename : null;

    // Step 1: Find the current old image filename
    db.query('SELECT imageurl FROM courses WHERE course_id = ?', [courseId], (err, results) => {
        if (err) {
            console.error('Find old image error:', err);
            return res.status(500).send('❌ Failed to find old image');
        }

        if (results.length === 0) {
            return res.status(404).send('❌ Course not found');
        }

        const oldImage = results[0].imageurl;
        const oldImagePath = path.join(__dirname, 'images/courses', oldImage);

        // Step 2: Build dynamic UPDATE query
        let sql = `UPDATE courses SET 
            course_name = ?, 
            course_description = ?, 
            cat_id_1 = ?, 
            cat_id_2 = ?, 
            cat_id_3 = ?, 
            price = ?`;

        const params = [
            course_name,
            course_description,
            cat_id_1 || null,
            cat_id_2 || null,
            cat_id_3 || null,
            price
        ];

        if (newImage) {
            sql += `, imageurl = ?`;
            params.push(newImage);
        }

        sql += ` WHERE course_id = ?`;
        params.push(courseId);

        // Step 3: Update the course
        db.query(sql, params, (err, result) => {
            if (err) {
                console.error('Update error:', err);
                return res.status(500).send('❌ Failed to update course');
            }

            // Step 4: If a new image was uploaded, delete old image
            if (newImage && oldImage) {
                fs.access(oldImagePath, fs.constants.F_OK, (err) => {
                    if (!err) {
                        fs.unlink(oldImagePath, (err) => {
                            if (err) {
                                console.error('❌ Failed to delete old image:', err);
                            } else {
                                console.log('✅ Old image deleted successfully:', oldImage);
                            }
                        });
                    } else {
                        console.warn('⚠️ Old image not found, skip delete:', oldImage);
                    }
                });
            }

            res.send('✅ Course updated successfully');
        });
    });
});


// 🔥 Add a new course
app.post('/courses', upload.single('image'), (req, res) => {
    const {
        course_name,
        course_description,
        app_id,
        main_id,
        dessert_id,
        cat_id_1,
        cat_id_2,
        cat_id_3,
        price
    } = req.body;

    const imageurl = req.file ? req.file.filename : null;

    const sql = `INSERT INTO courses 
    (course_name, course_description, app_id, main_id, dessert_id, cat_id_1, cat_id_2, cat_id_3, price, imageurl) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const params = [
        course_name,
        course_description,
        app_id || null,
        main_id || null,
        dessert_id || null,
        cat_id_1 || null,
        cat_id_2 || null,
        cat_id_3 || null,
        price,
        imageurl
    ];

    db.query(sql, params, (err, result) => {
        if (err) {
            console.error('Insert error:', err);
            return res.status(500).send('❌ Failed to add new course');
        }
        res.send('✅ New course added successfully');
    });
});


// 🔥 Delete a course (and its image)
app.delete('/courses/:id', (req, res) => {
    const courseId = req.params.id;

    // Step 1: Find the course image first
    db.query('SELECT imageurl FROM courses WHERE course_id = ?', [courseId], (err, results) => {
        if (err) {
            console.error('Query error:', err);
            return res.status(500).send('❌ Failed to find course');
        }
        if (results.length === 0) {
            return res.status(404).send('❌ Course not found');
        }

        const imageFile = results[0].imageurl;
        const imagePath = path.join(__dirname, 'images/courses', imageFile);

        // Step 2: Delete the course record
        db.query('DELETE FROM courses WHERE course_id = ?', [courseId], (err, result) => {
            if (err) {
                console.error('Delete error:', err);
                return res.status(500).send('❌ Failed to delete course');
            }

            // Step 3: Check and delete the image file
            fs.access(imagePath, fs.constants.F_OK, (err) => {
                if (err) {
                    console.warn('⚠️ Image file not found, skipping delete:', imageFile);
                } else {
                    fs.unlink(imagePath, (err) => {
                        if (err) {
                            console.error('❌ Error deleting image file:', err);
                        } else {
                            console.log('✅ Image file deleted:', imageFile);
                        }
                    });
                }
            });

            res.send('✅ Course and image deleted successfully');
        });
    });
});


//
app.get('/menues/:id', (req, res) => {
    const courseId = req.params.id;

    // 👇 Your database query here (example)
    db.query('CALL GetCourseDetailsJSON(?);', [courseId], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching menue' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Menue not found' });
        }
        // console.log('✅ DB Results:', results); // 👈 ADD THIS
        const course = results[0][0]; // 👈 safely take first record
        res.json(course);
        // Return only one course
    });
});



// fetch all menu
app.get('/menu_detail/:menuId', (req, res) => {
    const { menuId } = req.params;
    const { type } = req.query; // Example: ?type=appertizer

    let procedureCall = '';

    if (type === 'appertizer') {
        procedureCall = `CALL get_appertizer_by_id(?)`;
    } else if (type === 'main') {
        procedureCall = `CALL get_main_by_id(?)`;
    } else if (type === 'dessert') {
        procedureCall = `CALL get_dessert_by_id(?)`;
    } else {
        return res.status(400).send('❌ Invalid type. Must be "appertizer", "main", or "dessert".');
    }

    db.query(procedureCall, [menuId], (err, results) => {
        if (err) {
            console.error('DB error:', err);
            return res.status(500).send('❌ Failed to fetch menu item.');
        }

        res.json(results[0]); // ✅ results[0] because CALL returns array inside array
    });
});


// handle insert new menu
app.post('/menu-detail/:type', uploadMenu.single('image'), async (req, res) => {
    const { type } = req.params;
    const { body, file } = req;

    try {
        let query = '';
        let values = [];

        if (type === 'mains') {
            query = "INSERT INTO mains (main_name, main_desc, imageurl) VALUES (?, ?, ?)";
            values = [body.main_name, body.main_desc, file ? file.filename : null];
        } else if (type === 'desserts') {
            query = "INSERT INTO desserts (dessert_name, dessert_desc, imageurl) VALUES (?, ?, ?)";
            values = [body.dessert_name, body.dessert_desc, file ? file.filename : null];
        } else if (type === 'appertizers') {
            query = "INSERT INTO appertizers (appertizer_name, appertizer_desc, imageurl) VALUES (?, ?, ?)";
            values = [body.appertizer_name, body.appertizer_desc, file ? file.filename : null];
        } else {
            return res.status(400).json({ message: 'Invalid menu type' });
        }

        db.query(query, values);
        res.status(201).json({ message: `${type} created successfully!` });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});


// handle update existing menu
app.put('/menu-detail/:type/:id', uploadMenu.single('image'), async (req, res) => {
    const { type, id } = req.params;
    const { body, file } = req;

    try {
        let query = '';
        let values = [];

        if (type === 'mains') {
            query = "UPDATE mains SET main_name = ?, main_desc = ?, imageurl = ? WHERE main_id = ?";
            values = [body.main_name, body.main_desc, file ? file.filename : body.old_image, id];
        } else if (type === 'desserts') {
            query = "UPDATE desserts SET dessert_name = ?, dessert_desc = ?, imageurl = ? WHERE dessert_id = ?";
            values = [body.dessert_name, body.dessert_desc, file ? file.filename : body.old_image, id];
        } else if (type === 'appertizers') {
            query = "UPDATE appertizers SET appertizer_name = ?, appertizer_desc = ?, imageurl = ? WHERE appertizer_id = ?";
            values = [body.appertizer_name, body.appertizer_desc, file ? file.filename : body.old_image, id];
        } else {
            return res.status(400).json({ message: 'Invalid menu type' });
        }

        db.query(query, values);
        res.json({ message: `${type} updated successfully!` });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});



app.delete('/menu-detail/:type/:id', async (req, res) => {
    const { type, id } = req.params;

    try {
        let query = '';

        if (type === 'mains') {
            query = "DELETE FROM mains WHERE main_id = ?";
        } else if (type === 'desserts') {
            query = "DELETE FROM desserts WHERE dessert_id = ?";
        } else if (type === 'appertizers') {
            query = "DELETE FROM appertizers WHERE appertizer_id = ?";
        } else {
            return res.status(400).json({ message: 'Invalid menu type' });
        }

        db.query(query, [id]);
        res.json({ message: `${type} deleted successfully!` });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});


// Handle invalid routes
app.use((req, res) => {
    res.status(404).send('Invalid Path');
});

app.listen(port, () => {
    console.log(`🚀 Backend Server running on port ${port}`);
});
