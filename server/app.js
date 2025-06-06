const express = require('express');
const path = require('path');
const mysql = require('mysql');
const multer = require('multer');
const cors = require('cors');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');

const app = express();
const port = 3000;

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use(cookieParser());
app.use(cors());
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ extended: true, limit: '50mb' })); 

const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: '',
    database: 'zithandeTradeHubDatabase',
    multipleStatements: true
});

const db = mysql.createConnection({
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: ''
});

db.connect(err => {
    if (err) throw err;
    console.log('✅ Connected to MySQL');

    db.query("CREATE DATABASE IF NOT EXISTS zithandeTradeHubDatabase", (err) => {
        if (err) throw err;
        console.log("📦 Database 'zithandeTradeHubDatabase' created!");

        const tableSql = `
            CREATE TABLE IF NOT EXISTS zithandeUsers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                fullName VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role ENUM('buyer', 'seller') DEFAULT 'buyer',
                avatar LONGBLOB,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS zithandeCategories (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                description TEXT,
                icon VARCHAR(255)
            );
            CREATE TABLE IF NOT EXISTS zithandeProducts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255),
                description TEXT,
                price DECIMAL(10,2),
                image LONGBLOB,
                stock INT,
                sellerId INT,
                categoryId INT,
                FOREIGN KEY (sellerId) REFERENCES zithandeUsers(id),
                FOREIGN KEY (categoryId) REFERENCES zithandeCategories(id)
            );
            CREATE TABLE IF NOT EXISTS zithandeCartItems (
                id INT AUTO_INCREMENT PRIMARY KEY,
                userId INT NOT NULL,
                productId INT NOT NULL,
                quantity INT NOT NULL DEFAULT 1,
                FOREIGN KEY (userId) REFERENCES zithandeUsers(id),
                FOREIGN KEY (productId) REFERENCES zithandeProducts(id)
            );
            CREATE TABLE IF NOT EXISTS zithandeOrders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                userId INT,
                total DECIMAL(10,2),
                status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES zithandeUsers(id)
            );
            CREATE TABLE IF NOT EXISTS zithandeOrderItems (
                id INT AUTO_INCREMENT PRIMARY KEY,
                orderId INT,
                productId INT,
                quantity INT,
                price DECIMAL(10,2),
                FOREIGN KEY (orderId) REFERENCES zithandeOrders(id),
                FOREIGN KEY (productId) REFERENCES zithandeProducts(id)
            );
            CREATE TABLE IF NOT EXISTS zithandeReviews (
                id INT AUTO_INCREMENT PRIMARY KEY,
                productId INT NOT NULL,
                userId INT NOT NULL,
                rating INT NOT NULL,
                review TEXT,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                
                FOREIGN KEY (productId) REFERENCES zithandeProducts(id),
                FOREIGN KEY (userId) REFERENCES zithandeUsers(id)
            );
            CREATE TABLE IF NOT EXISTS zithandeWishlist (
                id INT AUTO_INCREMENT PRIMARY KEY,
                userId INT NOT NULL,
                productId INT NOT NULL,
                addedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES zithandeUsers(id),
                FOREIGN KEY (productId) REFERENCES zithandeProducts(id),
                UNIQUE KEY unique_wishlist (userId, productId)
            );
        `;

        pool.query(tableSql, (err) => {
            if (err) throw err;
            console.log("Tables created!");
        });

        app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, '../public/home.html'));
        });

        app.post('/login', (req, res) => {
            const { email, password } = req.body;
            const query = 'SELECT * FROM zithandeUsers WHERE email = ?';
        
            pool.query(query, [email], async (err, results) => {
                if (err) {
                    console.error('Server error during login:', err);
                    return res.redirect('/auth.html?error=server');
                }
        
                if (results.length === 0) {
                    return res.redirect('/auth.html?error=user');
                }
        
                const user = results[0];
                const isMatch = await bcrypt.compare(password, user.password);

                console.log(user);
        
                if (isMatch) {
                    res.cookie('loggedIn', 'true', { maxAge: 3600000 });
                    res.cookie('accountType', user.role, { maxAge: 3600000 });
                    res.cookie('userEmail', user.email, { maxAge: 3600000 });
                
                    if (user.role === 'seller') {
                        return res.redirect('/seller.html');
                    } else {
                        return res.redirect('/profile.html');
                    }
                } else {
                    res.redirect('/auth.html?error=password');
                }
            });
        });
        
        app.post('/register', async (req, res) => {
            const { fullName, email, password, accountType, confirmedPassword } = req.body;
        
            if (password !== confirmedPassword) {
                return res.redirect('/auth.html?error=mismatch&tab=register');
            }
        
            try {
                const checkEmailQuery = 'SELECT * FROM zithandeUsers WHERE email = ?';
                pool.query(checkEmailQuery, [email], async (err, results) => {
                    if (err) {
                        console.error('Error checking email:', err);
                        return res.redirect('/auth.html?error=server&tab=register');
                    }
        
                    if (results.length > 0) {
                        return res.redirect('/auth.html?error=emailexist&tab=register');
                    }
        
                    const hashedPassword = await bcrypt.hash(password, 10);
                    const insertQuery = `
                        INSERT INTO zithandeUsers (fullName, email, password, role)
                        VALUES (?, ?, ?, ?)
                    `;
                    pool.query(insertQuery, [fullName, email, hashedPassword, accountType], (insertErr) => {
                        if (insertErr) {
                            console.error('Error inserting user:', insertErr);
                            if (insertErr.code === 'ER_DUP_ENTRY') {
                                return res.redirect('/auth.html?error=emailexist&tab=register');
                            }
                            return res.redirect('/auth.html?error=insert&tab=register');
                        }
        
                        res.cookie('loggedIn', 'true', { maxAge: 3600000 });
                        res.cookie('accountType', accountType, { maxAge: 3600000 });
                        res.cookie('userEmail', email, { maxAge: 3600000 });

                        if (accountType === 'seller') {
                            return res.redirect('/seller.html');
                        } else {
                            return res.redirect('/profile.html');
                        }
                    });
                });
            } catch (e) {
                console.error('Unexpected error during registration:', e);
                return res.redirect('/auth.html?error=server&tab=register');
            }
        });        

        app.post('/upload-product', upload.single('productImage'), (req, res) => {
            const { name, price, description, categoryId, stock, sellerId } = req.body;
        
            if (!req.file) {
                console.error('❌ No image file uploaded');
                return res.status(400).send('Image is required');
            }
        
            const imageBlob = req.file.buffer;
        
            const query = `
                INSERT INTO zithandeProducts 
                (name, description, price, image, stock, sellerId, categoryId) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
        
            const values = [
                name,
                description,
                parseFloat(price),
                imageBlob,
                parseInt(stock),
                parseInt(sellerId),
                parseInt(categoryId)
            ];
        
            pool.query(query, values, (err, results) => {
                if (err) {
                    console.error('❌ DB Insert Error:', err);
                    return res.status(500).send('Database error: ' + err.sqlMessage);
                }
        
                console.log('✅ Product inserted:', results);
                res.redirect('/seller.html');
            });
        });
        
        app.get('/api/getUserId/:email', (req, res) => {
            const userEmail = decodeURIComponent(req.params.email);
            
            const sql = `SELECT id FROM zithandeUsers WHERE email = ?`;
            pool.query(sql, [userEmail], (err, results) => {
                if (err) {
                    console.error('Error fetching user ID:', err);
                    return res.status(500).json({ error: 'Database error' });
                }
                if (results.length > 0) {
                    res.json(results[0]);
                } else {
                    res.status(404).json({ error: 'User not found' });
                }
            });
        });

        app.get('/api/sellerStats/:email', (req, res) => {
            const email = decodeURIComponent(req.params.email);
        
            const sql = `
                SELECT u.fullName, COUNT(p.id) AS productCount
                FROM zithandeUsers u
                LEFT JOIN zithandeProducts p ON u.id = p.sellerId
                WHERE u.email = ?
                GROUP BY u.id
            `;
        
            pool.query(sql, [email], (err, results) => {
                if (err) {
                    console.error('Error fetching seller stats:', err);
                    return res.status(500).json({ error: 'Database error' });
                }
        
                if (results.length === 0) {
                    return res.status(404).json({ error: 'User not found' });
                }
        
                res.json(results[0]);
            });
        });
        
        app.get('/api/productsByCategoryId/:categoryId', (req, res) => {
            const categoryId = req.params.categoryId;
        
            const sql = `
                SELECT id, name, price, image, stock 
                FROM zithandeProducts
                WHERE categoryId = ?
            `;
        
            pool.query(sql, [categoryId], (err, results) => {
                if (err) {
                    console.error('Error fetching products by category:', err);
                    return res.status(500).json({ error: 'Database error' });
                }
        
                res.json(results);
            });
        });
        

        app.get('/api/checkProductName/:name', (req, res) => {
            const productName = req.params.name;
        
            const sql = `SELECT COUNT(*) AS count FROM zithandeProducts WHERE name = ?`;
            pool.query(sql, [productName], (err, results) => {
                if (err) {
                    console.error('Error checking product name:', err);
                    return res.status(500).json({ error: 'Database error' });
                }
                res.json({ exists: results[0].count > 0 });
            });
        });        

        app.get('/api/featured-products', (req, res) => {
            const query = "SELECT id, name, price, image, categoryId FROM zithandeProducts ORDER BY RAND() LIMIT 4";

            pool.query(query, (err, results) => {
                if (err) {
                    console.error('MySQL error:', err);
                    return res.status(500).json({ error: 'Database error' });
                }
          
                const products = results.map(product => ({
                    id: product.id, 
                    name: product.name,
                    price: product.price,
                    image: `data:image/jpeg;base64,${product.image.toString('base64')}`,
                    category: product.categoryId
                }));
            
                res.json(products);
            });
        });

        app.post('/api/wishlist/toggle', (req, res) => {
            console.log('📝 Wishlist toggle request received:', req.body);
            
            let { userEmail, productId } = req.body;
            
            userEmail = decodeURIComponent(userEmail);
            
            if (!userEmail || !productId) {
                console.error('❌ Missing userEmail or productId');
                return res.status(400).json({ error: 'Missing userEmail or productId' });
            }
        
            pool.query('SELECT id FROM zithandeUsers WHERE email = ?', [userEmail], (err, results) => {
                if (err) {
                    console.error('❌ Error finding user:', err);
                    return res.status(500).json({ error: 'Database error finding user' });
                }
                
                if (results.length === 0) {
                    console.error('❌ User not found:', userEmail);
                    return res.status(400).json({ error: 'User not found' });
                }
        
                const userId = results[0].id;
                console.log('👤 Found user ID:', userId);
        
                pool.query('SELECT * FROM zithandeWishlist WHERE userId = ? AND productId = ?', [userId, productId], (err, results) => {
                    if (err) {
                        console.error('❌ Error checking wishlist:', err);
                        return res.status(500).json({ error: 'Database error checking wishlist' });
                    }
        
                    if (results.length > 0) {
                        pool.query('DELETE FROM zithandeWishlist WHERE userId = ? AND productId = ?', [userId, productId], (err) => {
                            if (err) {
                                console.error('❌ Error removing from wishlist:', err);
                                return res.status(500).json({ error: 'Database error removing from wishlist' });
                            }
                            console.log('✅ Removed from wishlist');
                            res.json({ message: 'Removed from wishlist', inWishlist: false });
                        });
                    } else {
                        pool.query('INSERT INTO zithandeWishlist (userId, productId) VALUES (?, ?)', [userId, productId], (err) => {
                            if (err) {
                                console.error('❌ Error adding to wishlist:', err);
                                return res.status(500).json({ error: 'Database error adding to wishlist' });
                            }
                            console.log('✅ Added to wishlist');
                            res.json({ message: 'Added to wishlist', inWishlist: true });
                        });
                    }
                });
            });
        });
        
        app.get('/api/wishlist/count/:email', (req, res) => {
            const userEmail = decodeURIComponent(req.params.email);
            console.log('📊 Wishlist count request for:', userEmail);
        
            pool.query('SELECT id FROM zithandeUsers WHERE email = ?', [userEmail], (err, results) => {
                if (err) {
                    console.error('❌ Error finding user for count:', err);
                    return res.json({ count: 0 });
                }
                
                if (results.length === 0) {
                    console.log('❌ User not found for count:', userEmail);
                    return res.json({ count: 0 });
                }
        
                const userId = results[0].id;
        
                pool.query('SELECT COUNT(*) AS count FROM zithandeWishlist WHERE userId = ?', [userId], (err, results) => {
                    if (err) {
                        console.error('❌ Error counting wishlist:', err);
                        return res.json({ count: 0 });
                    }
        
                    const count = results[0].count;
                    console.log('📊 Wishlist count:', count);
                    res.json({ count: count });
                });
            });
        });

        app.post('/api/cart/toggle', (req, res) => {
            console.log('🛒 Cart toggle request received:', req.body);
            
            let { userEmail, productId } = req.body;
            userEmail = decodeURIComponent(userEmail);
            
            if (!userEmail || !productId) {
                console.error('❌ Missing userEmail or productId');
                return res.status(400).json({ error: 'Missing userEmail or productId' });
            }
        
            pool.query('SELECT id FROM zithandeUsers WHERE email = ?', [userEmail], (err, results) => {
                if (err) {
                    console.error('❌ Error finding user:', err);
                    return res.status(500).json({ error: 'Database error finding user' });
                }
                
                if (results.length === 0) {
                    console.error('❌ User not found:', userEmail);
                    return res.status(400).json({ error: 'User not found' });
                }
        
                const userId = results[0].id;
                console.log('👤 Found user ID:', userId);
        
                pool.query('SELECT * FROM zithandeCartItems WHERE userId = ? AND productId = ?', [userId, productId], (err, results) => {
                    if (err) {
                        console.error('❌ Error checking cart:', err);
                        return res.status(500).json({ error: 'Database error checking cart' });
                    }
        
                    if (results.length > 0) {
                        pool.query('DELETE FROM zithandeCartItems WHERE userId = ? AND productId = ?', [userId, productId], (err) => {
                            if (err) {
                                console.error('❌ Error removing from cart:', err);
                                return res.status(500).json({ error: 'Database error removing from cart' });
                            }
                            console.log('✅ Removed from cart');
                            res.json({ message: 'Removed from cart', inCart: false });
                        });
                    } else {
                        pool.query('INSERT INTO zithandeCartItems (userId, productId, quantity) VALUES (?, ?, 1)', [userId, productId], (err) => {
                            if (err) {
                                console.error('❌ Error adding to cart:', err);
                                return res.status(500).json({ error: 'Database error adding to cart' });
                            }
                            console.log('✅ Added to cart');
                            res.json({ message: 'Added to cart', inCart: true });
                        });
                    }
                });
            });
        });

        app.get('/api/cart/count/:email', (req, res) => {
            const userEmail = decodeURIComponent(req.params.email);
            console.log('📊 Cart count request for:', userEmail);
        
            pool.query('SELECT id FROM zithandeUsers WHERE email = ?', [userEmail], (err, results) => {
                if (err) {
                    console.error('❌ Error finding user for cart count:', err);
                    return res.json({ count: 0 });
                }
                
                if (results.length === 0) {
                    console.log('❌ User not found for cart count:', userEmail);
                    return res.json({ count: 0 });
                }
        
                const userId = results[0].id;
        
                pool.query('SELECT SUM(quantity) AS count FROM zithandeCartItems WHERE userId = ?', [userId], (err, results) => {
                    if (err) {
                        console.error('❌ Error counting cart:', err);
                        return res.json({ count: 0 });
                    }
        
                    const count = results[0].count || 0;
                    console.log('📊 Cart count:', count);
                    res.json({ count: count });
                });
            });
        });

        app.get('/api/test', (req, res) => {
            console.log('🧪 Test endpoint hit');
            res.json({ message: 'Server is working!', timestamp: new Date() });
        });
        
        app.get('/api/debug/products', (req, res) => {
            console.log('🔍 Debug: Fetching all products');
            
            const query = "SELECT id, name, price, categoryId FROM zithandeProducts LIMIT 10";
            
            pool.query(query, (err, results) => {
                if (err) {
                    console.error('❌ Database error:', err);
                    return res.status(500).json({ error: 'Database error', details: err.message });
                }
                
                console.log('📦 Found products:', results.length);
                res.json({
                    success: true,
                    count: results.length,
                    products: results
                });
            });
        });

        app.get('/api/debug/user/:email', (req, res) => {
            const email = decodeURIComponent(req.params.email);
            console.log('👤 Debug: Looking up user:', email);
            
            pool.query('SELECT id, email, role FROM zithandeUsers WHERE email = ?', [email], (err, results) => {
                if (err) {
                    console.error('❌ User lookup error:', err);
                    return res.status(500).json({ error: 'Database error', details: err.message });
                }
                
                console.log('👤 User lookup result:', results);
                res.json({
                    success: true,
                    found: results.length > 0,
                    user: results[0] || null
                });
            });
        });

        app.get('/api/user-profile/:email', (req, res) => {
            const userEmail = decodeURIComponent(req.params.email);
            console.log('👤 Profile request for:', userEmail);
        
            pool.query('SELECT fullName, createdAt FROM zithandeUsers WHERE email = ?', [userEmail], (err, results) => {
                if (err) {
                    console.error('❌ Error fetching user profile:', err);
                    return res.status(500).json({ error: 'Database error fetching user profile' });
                }
        
                if (results.length === 0) {
                    console.log('❌ User not found for profile:', userEmail);
                    return res.status(404).json({ error: 'User not found' });
                }
        
                const user = results[0];
                const fullNameParts = user.fullName.split(" ");
                const name = fullNameParts[0];
                const surname = fullNameParts.slice(1).join(" ") || '';
        
                const memberSince = new Date(user.createdAt).getFullYear(); // Only show year
        
                res.json({
                    name,
                    surname,
                    memberSince
                });
            });
        });

        app.get('/api/wishlist/items/:email', (req, res) => {
            const userEmail = decodeURIComponent(req.params.email);
            console.log('📦 Wishlist items requested for:', userEmail);
        
            pool.query('SELECT id FROM zithandeUsers WHERE email = ?', [userEmail], (err, results) => {
                if (err || results.length === 0) {
                    console.error('❌ Error finding user for wishlist items:', err);
                    return res.json({ items: [] });
                }
        
                const userId = results[0].id;
        
                const sql = `
                    SELECT p.id, p.name, p.price, p.image, p.stock
                    FROM zithandeWishlist w
                    JOIN zithandeProducts p ON w.productId = p.id
                    WHERE w.userId = ?
                `;
        
                pool.query(sql, [userId], (err, results) => {
                    if (err) {
                        console.error('❌ Error fetching wishlist items:', err);
                        return res.json({ items: [] });
                    }
        
                    const items = results.map(item => ({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        stock: item.stock,
                        image: `data:image/jpeg;base64,${item.image.toString('base64')}`
                    }));
        
                    res.json({ items });
                });
            });
        });
        
        app.get('/api/cart/items/:email', (req, res) => {
            const userEmail = decodeURIComponent(req.params.email);
        
            pool.query('SELECT id FROM zithandeUsers WHERE email = ?', [userEmail], (err, results) => {
                if (err || results.length === 0) {
                    console.error('❌ User not found for cart items:', err);
                    return res.json({ items: [] });
                }
        
                const userId = results[0].id;
        
                const sql = `
                    SELECT p.id, p.name, p.price, p.image, p.stock, c.quantity
                    FROM zithandeCartItems c
                    JOIN zithandeProducts p ON c.productId = p.id
                    WHERE c.userId = ?
                `;
        
                pool.query(sql, [userId], (err, results) => {
                    if (err) {
                        console.error('❌ Error fetching cart items:', err);
                        return res.json({ items: [] });
                    }
        
                    const items = results.map(item => ({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        stock: item.stock,
                        quantity: item.quantity,
                        image: `data:image/jpeg;base64,${item.image.toString('base64')}`
                    }));                    
        
                    console.log(items);
                    res.json({ items });
                });
            });
        });              
        
        app.get('/api/categories/counts', (req, res) => {
            const sql = `
                SELECT categoryId, COUNT(*) as count 
                FROM zithandeProducts 
                GROUP BY categoryId
            `;
        
            pool.query(sql, (err, results) => {
                if (err) {
                    console.error("Error fetching category counts:", err);
                    return res.status(500).json({ error: 'Database error' });
                }
        
                res.json(results);
            });
        });
        
        app.get('/api/all-products', (req, res) => {
            const sql = 'SELECT * FROM zithandeProducts';
        
            pool.query(sql, (err, results) => {
                if (err) {
                    console.error("Error fetching all products:", err);
                    return res.status(500).json({ error: 'Database error' });
                }
        
                const products = results.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    stock: item.stock,
                    category: item.categoryId,
                    image: `data:image/jpeg;base64,${item.image.toString('base64')}`
                }));
        
                res.json(products);
            });
        });
        
        app.get('/api/seller-products/:email', (req, res) => {
            const sellerEmail = decodeURIComponent(req.params.email);
            console.log('Decoded seller email:', sellerEmail);
        
            const sql = `
                SELECT p.*, u.id AS sellerId
                FROM zithandeProducts p
                JOIN zithandeUsers u ON p.sellerId = u.id
                WHERE u.email = ?`;
        
            pool.query(sql, [sellerEmail], (err, results) => {
                if (err) {
                    console.error('Error fetching seller products:', err);
                    return res.status(500).json({ error: 'Database error' });
                }
                if (!results || results.length === 0) {
                    return res.json([]);
                }
        
                const products = results.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    stock: item.stock,
                    category: item.categoryId,
                    image: `data:image/jpeg;base64,${item.image?.toString('base64') || ''}`,
                    sales: item.sales || 0,
                    rating: item.rating || 0
                }));
        
                res.json(products);
            });
        });

        app.delete('/api/delete-product/:id', (req, res) => {
            const productId = req.params.id;
        
            const sql = 'DELETE FROM zithandeProducts WHERE id = ?';
        
            pool.query(sql, [productId], (err, results) => {
                if (err) {
                    console.error('Error deleting product:', err);
                    return res.status(500).json({ error: 'Database error' });
                }
        
                if (results.affectedRows === 0) {
                    return res.status(404).json({ message: 'Product not found' });
                }
        
                res.json({ message: 'Product deleted successfully' });
            });
        });      
        
        app.delete('/api/cart/remove', (req, res) => {
            const userEmail = decodeURIComponent(req.query.userEmail);
            const productId = parseInt(req.query.productId);
        
            if (!userEmail || !productId) {
                return res.status(400).json({ message: "Missing userEmail or productId" });
            }
        
            pool.query('SELECT id FROM zithandeUsers WHERE email = ?', [userEmail], (err, results) => {
                if (err || results.length === 0) {
                    return res.status(404).json({ message: 'User not found' });
                }
        
                const userId = results[0].id;
        
                pool.query(
                    'DELETE FROM zithandeCartItems WHERE userId = ? AND productId = ?',
                    [userId, productId],
                    (err, results) => {
                        if (err) {
                            console.error('❌ Error removing item:', err);
                            return res.status(500).json({ message: 'Error removing item' });
                        }
                        res.json({ message: 'Item removed successfully' });
                    }
                );
            });
        });
        
        app.post('/api/cart/update-quantity', (req, res) => {
            const { userEmail, productId, quantity } = req.body;
        
            pool.query('SELECT id FROM zithandeUsers WHERE email = ?', [userEmail], (err, results) => {
                if (err || results.length === 0) {
                    console.error('❌ User not found:', err);
                    return res.status(404).json({ message: 'User not found' });
                }
        
                const userId = results[0].id;
        
                pool.query(
                    'UPDATE zithandeCartItems SET quantity = ? WHERE userId = ? AND productId = ?',
                    [quantity, userId, productId],
                    (err, result) => {
                        if (err) {
                            console.error('❌ Error updating quantity:', err);
                            return res.status(500).json({ message: 'Failed to update quantity' });
                        }
        
                        res.json({ message: 'Quantity updated successfully' });
                    }
                );
            });
        });    
        
        app.post('/api/orders/create', (req, res) => {
            console.log("Incoming request body:", req.body);

            const { userEmail, cart, billingInfo, total } = req.body;
        
            pool.query('SELECT id FROM zithandeUsers WHERE email = ?', [userEmail], (err, userResult) => {
                if (err || userResult.length === 0) {
                    return res.status(400).json({ error: 'User not found' });
                }
        
                const userId = userResult[0].id;
        
                pool.query('INSERT INTO zithandeOrders (userId, total) VALUES (?, ?)', 
                    [userId, total], (err, orderResult) => {
                    if (err) {
                        console.error('Error inserting order:', err);
                        return res.status(500).json({ error: 'Failed to insert order' });
                    }
        
                    const orderId = orderResult.insertId;
        
                    const items = cart.map(item => [orderId, item.id, item.quantity || 1, item.price]);
        
                    pool.query('INSERT INTO zithandeOrderItems (orderId, productId, quantity, price) VALUES ?', 
                        [items], (err) => {
                        if (err) {
                            console.error('Error inserting order items:', err);
                            return res.status(500).json({ error: 'Failed to insert order items' });
                        }
        
                        pool.query('DELETE FROM zithandeCartItems WHERE userId = ?', [userId], () => {
                            return res.json({ message: 'Order placed successfully' });
                        });
                    });
                });
            });
        });

        app.get('/api/orders/:email', (req, res) => {
            const userEmail = decodeURIComponent(req.params.email);
        
            pool.query('SELECT id FROM zithandeUsers WHERE email = ?', [userEmail], (err, userResults) => {
                if (err || userResults.length === 0) {
                    console.error('User not found:', err);
                    return res.json([]);
                }
        
                const userId = userResults[0].id;
        
                const sql = `
                    SELECT id, total, status, createdAt
                    FROM zithandeOrders
                    WHERE userId = ?
                    ORDER BY createdAt DESC
                `;
        
                pool.query(sql, [userId], (err, ordersResults) => {
                    if (err) {
                        console.error('Error fetching orders:', err);
                        return res.status(500).json({ error: 'Error fetching orders' });
                    }
        
                    res.json(ordersResults);
                });
            });
        });
        
        app.get('/api/orders/details/:orderId', (req, res) => {
            const orderId = req.params.orderId;
        
            const sql = `
                SELECT p.name, p.price, p.image, oi.quantity
                FROM zithandeOrderItems oi
                JOIN zithandeProducts p ON oi.productId = p.id
                WHERE oi.orderId = ?
            `;
        
            pool.query(sql, [orderId], (err, results) => {
                if (err) {
                    console.error('❌ Error fetching order details:', err);
                    return res.status(500).json({ error: 'Error fetching order details' });
                }
        
                const items = results.map(item => ({
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    image: `data:image/jpeg;base64,${item.image.toString('base64')}`
                }));
        
                res.json({ items });
            });
        });        

        app.get('/api/products/:id', (req, res) => {
            const productId = req.params.id;
        
            const query = `
                SELECT *
                FROM zithandeProducts 
                WHERE id = ?
            `;
        
            pool.query(query, [productId], (err, result) => {
                if (err) {
                    console.error("Error fetching product:", err);
                    return res.status(500).json({ message: "Failed to load product" });
                }
        
                if (result.length === 0) {
                    return res.status(404).json({ message: "Product not found" });
                }
        
                const product = result[0];
                
                let imageBase64 = null;

                if (product.image) {
                    try {
                        imageBase64 = Buffer.from(product.image).toString('base64');
                    } catch (e) {
                        console.error("Image conversion failed:", e);
                    }
                }
        
                res.json({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    description: product.description,
                    image: imageBase64
                });
            });
        });        

        app.post('/api/reviews/add', (req, res) => {
            const { productId, userEmail, rating, review } = req.body;
        
            pool.query('SELECT id, role FROM zithandeUsers WHERE email = ?', [userEmail], (err, results) => {
                if (err || results.length === 0) {
                    return res.status(400).json({ message: 'User not found.' });
                }
        
                const user = results[0];
        
                if (user.role === 'seller') {
                    return res.status(403).json({ message: 'Sellers cannot leave reviews.' });
                }
        
                const userId = user.id;
        
                const insertQuery = 'INSERT INTO zithandeReviews (productId, userId, rating, review) VALUES (?, ?, ?, ?)';
                pool.query(insertQuery, [productId, userId, rating, review], (err) => {
                    if (err) {
                        console.error('Error inserting review:', err);
                        return res.status(500).json({ message: 'Failed to add review.' });
                    }
                    res.json({ message: 'Review added successfully.' });
                });
            });
        }); 
        
        app.get('/api/reviews/:productId', (req, res) => {
            const productId = req.params.productId;
        
            const sql = `
                SELECT r.id, r.productId, r.userId, r.rating, r.review, r.createdAt, u.fullName 
                FROM zithandeReviews r
                JOIN zithandeUsers u ON r.userId = u.id
                WHERE r.productId = ?
                ORDER BY r.createdAt DESC
            `;
        
            pool.query(sql, [productId], (err, results) => {
                if (err) {
                    console.error('Error fetching reviews:', err);
                    return res.status(500).json({ message: 'Failed to fetch reviews.' });
                }
                res.json({ reviews: results });
            });
        });        
                
        app.get('/api/profile/:email', (req, res) => {
            const email = decodeURIComponent(req.params.email);
        
            const query = 'SELECT fullName, email FROM zithandeUsers WHERE email = ?';
            pool.query(query, [email], (err, results) => {
                if (err) {
                    console.error('Error fetching profile:', err);
                    return res.status(500).json({ message: 'Failed to load profile.' });
                }
                if (results.length === 0) {
                    return res.status(404).json({ message: 'User not found.' });
                }
        
                const fullName = results[0].fullName;
                const [firstName, ...rest] = fullName.split(" ");
                const lastName = rest.join(" ");
                
                res.json({
                    firstName,
                    lastName,
                    email: results[0].email
                });
            });
        });

        app.get('/api/admin/stats', (req, res) => {
            let stats = { revenue: 0, orders: 0, products: 0 };
        
            const revenueQuery = `SELECT IFNULL(SUM(total), 0) AS revenue FROM zithandeOrders`;
            const ordersQuery = `SELECT COUNT(*) AS orders FROM zithandeOrders`;
            const productsQuery = `SELECT COUNT(*) AS products FROM zithandeProducts`;
        
            pool.query(revenueQuery, (err, revenueResult) => {
                if (err) {
                    console.error('Error fetching revenue:', err);
                    return res.status(500).json({ message: 'Failed to load revenue' });
                }
                stats.revenue = revenueResult[0].revenue;
        
                pool.query(ordersQuery, (err, ordersResult) => {
                    if (err) {
                        console.error('Error fetching orders:', err);
                        return res.status(500).json({ message: 'Failed to load orders' });
                    }
                    stats.orders = ordersResult[0].orders;
        
                    pool.query(productsQuery, (err, productsResult) => {
                        if (err) {
                            console.error('Error fetching products:', err);
                            return res.status(500).json({ message: 'Failed to load products' });
                        }
                        stats.products = productsResult[0].products;
        
                        res.json(stats);
                    });
                });
            });
        });        
        
        app.get('/api/admin/orders', (req, res) => {
            const query = `
                SELECT o.id, u.fullName AS customerName, o.createdAt, o.status, o.total 
                FROM zithandeOrders o
                JOIN zithandeUsers u ON o.userId = u.id
            `;
            pool.query(query, (err, results) => {
                if (err) {
                    console.error('Error fetching orders:', err);
                    return res.status(500).json({ message: 'Failed to fetch orders.' });
                }
                res.json({ orders: results });
            });
        });

        app.delete('/api/admin/orders/:orderId', (req, res) => {
            const orderId = req.params.orderId;
        
            const deleteOrderItemsQuery = 'DELETE FROM zithandeOrderItems WHERE orderId = ?';
            const deleteOrderQuery = 'DELETE FROM zithandeOrders WHERE id = ?';
        
            pool.query(deleteOrderItemsQuery, [orderId], (err) => {
                if (err) {
                    console.error('Error deleting order items:', err);
                    return res.status(500).json({ success: false });
                }
        
                pool.query(deleteOrderQuery, [orderId], (err) => {
                    if (err) {
                        console.error('Error deleting order:', err);
                        return res.status(500).json({ success: false });
                    }
        
                    res.json({ success: true });
                });
            });
        });

        app.get('/api/admin/products', (req, res) => {
            pool.query('SELECT id, name, description, price, stock FROM zithandeProducts', (err, results) => {
                if (err) {
                    console.error('Error fetching products:', err);
                    return res.status(500).json({ message: 'Failed to fetch products' });
                }
                res.json({ products: results });
            });
        });
        
        app.delete('/api/admin/products/:id', (req, res) => {
            const productId = req.params.id;
            pool.query('DELETE FROM zithandeProducts WHERE id = ?', [productId], (err) => {
                if (err) {
                    console.error('Error deleting product:', err);
                    return res.status(500).json({ message: 'Failed to delete product' });
                }
                res.json({ message: 'Product deleted successfully' });
            });
        });

        app.get('/api/admin/accounts', (req, res) => {
            const query = 'SELECT id, fullName, email, role, createdAt FROM zithandeUsers';
        
            pool.query(query, (err, results) => {
                if (err) {
                    console.error('Error fetching accounts:', err);
                    return res.status(500).json({ message: 'Failed to fetch accounts' });
                }
        
                const buyers = results.filter(user => user.role === 'buyer');
                const sellers = results.filter(user => user.role === 'seller');
        
                res.json({ buyers, sellers });
            });
        });
        
        app.delete('/api/admin/accounts/:id', (req, res) => {
            const userId = req.params.id;
            const query = 'DELETE FROM zithandeUsers WHERE id = ?';
        
            pool.query(query, [userId], (err, result) => {
                if (err) {
                    console.error('Error deleting user:', err);
                    return res.status(500).json({ message: 'Failed to delete user' });
                }
        
                res.json({ message: 'User deleted successfully' });
            });
        });
        
        app.get('/api/admin/reviews', (req, res) => {
            const query = `
                SELECT r.id, r.rating, r.review, r.createdAt, p.name AS productName
                FROM zithandeReviews r
                JOIN zithandeProducts p ON r.productId = p.id
                ORDER BY r.createdAt DESC
            `;

            pool.query(query, (err, results) => {
                if (err) {
                    console.error('Error fetching reviews:', err);
                    return res.status(500).json({ message: 'Failed to fetch reviews.' });
                }
                res.json(results);
            });
        });

        app.delete('/api/admin/reviews/:id', (req, res) => {
            const reviewId = req.params.id;

            pool.query('DELETE FROM zithandeReviews WHERE id = ?', [reviewId], (err, results) => {
                if (err) {
                    console.error('Error deleting review:', err);
                    return res.status(500).json({ message: 'Failed to delete review.' });
                }
                res.json({ message: 'Review deleted successfully.' });
            });
        });

        app.use(express.static(path.join(__dirname, "../public")));

        app.listen(port, () => {
            console.log(`Server running on http://localhost:${port}`);
        });
    });
});