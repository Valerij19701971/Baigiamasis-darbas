const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 8000;

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
});

async function startServer() {
    try {
        
        const [result] = await db.query('SELECT 1');
        console.log('Database connection successful');

        
        app.use(cors({
            origin: 'http://localhost:3000',
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
        }));

        
        app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: true }));

        
        app.use((req, res, next) => {
            console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
            next();
        });

        
        app.get('/api/test', (req, res) => {
            console.log('Test endpoint hit');
            res.json({ message: 'Server is running' });
        });

        const authenticateAdmin = async (req, res, next) => {
            console.log('Authenticating admin request');
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
                console.log('No token provided');
                return res.status(401).json({ error: 'No token provided' });
            }

            try {
                const [rows] = await db.query('SELECT * FROM users WHERE username = ? AND role = ?', ['admin', 'admin']);
                if (rows.length === 0) {
                    console.log('Invalid token');
                    return res.status(401).json({ error: 'Invalid token' });
                }
                console.log('Admin authenticated successfully');
                next();
            } catch (err) {
                console.error('Authentication error:', err);
                res.status(500).json({ error: 'Server error during authentication' });
            }
        };

        
        const authenticateUser = async (req, res, next) => {
            console.log('Authenticating user request');
            
            const token = req.headers.authorization?.split(' ')[1]; 
            if (!token || !token.startsWith('user-token-')) { 
                console.log('Invalid or missing user token');
                return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
            }

            try {
                
                const userId = token.split('-')[2];
                if (!userId) {
                    return res.status(401).json({ error: 'Unauthorized: Invalid token format' });
                }
                
                
                const [users] = await db.query('SELECT id FROM users WHERE id = ?', [userId]);
                if (users.length === 0) {
                     return res.status(401).json({ error: 'Unauthorized: User not found' });
                }

                
                req.userId = parseInt(userId, 10); 
                console.log(`User authenticated successfully: ID ${req.userId}`);
                next();
            } catch (err) {
                console.error('User authentication error:', err);
                res.status(500).json({ error: 'Server error during user authentication' });
            }
        };

        app.post('/api/admin/login', async (req, res) => {
            console.log('Login attempt received:', req.body);
            const { username, password } = req.body;
            
            if (!username || !password) {
                console.log('Missing username or password');
                return res.status(400).json({ error: 'Username and password are required' });
            }

            try {
                console.log('Querying database for admin user');
                const [rows] = await db.query(
                    'SELECT * FROM users WHERE username = ? AND password = ? AND role = ?', 
                    [username, password, 'admin']
                );
                
                if (rows.length > 0) {
                    console.log('Login successful');
                    res.json({ token: 'admin-token' });
                } else {
                    console.log('Invalid credentials');
                    res.status(401).json({ error: 'Invalid credentials' });
                }
            } catch (err) {
                console.error('Login error:', err);
                res.status(500).json({ error: 'Server error during login' });
            }
        });

        app.get('/api/admin/campaigns', authenticateAdmin, async (req, res) => {
            try {
                const [rows] = await db.query('SELECT * FROM campaigns ORDER BY created_at DESC');
                res.json(rows);
            } catch (err) {
                console.error('Error fetching campaigns:', err);
                res.status(500).json({ error: 'Error fetching campaigns' });
            }
        });

        app.put('/api/admin/campaigns/:id/status', authenticateAdmin, async (req, res) => {
            const { id } = req.params;
            const { status } = req.body;
            try {
                await db.query('UPDATE campaigns SET status = ? WHERE id = ?', [status, id]);
                res.json({ success: true });
            } catch (err) {
                console.error('Error updating campaign status:', err);
                res.status(500).json({ error: 'Error updating campaign status' });
            }
        });

        app.delete('/api/admin/campaigns/:id', authenticateAdmin, async (req, res) => {
            const { id } = req.params;
            try {
                // First, get the campaign to check for an image_url
                const [campaigns] = await db.query('SELECT image_url FROM campaigns WHERE id = ?', [id]);
                if (campaigns.length === 0) {
                    return res.status(404).json({ error: 'Campaign not found' });
                }
                const campaign = campaigns[0];

                // Delete associated donations
                await db.query('DELETE FROM donations WHERE campaign_id = ?', [id]);
                
                // Delete the campaign
                const [result] = await db.query('DELETE FROM campaigns WHERE id = ?', [id]);

                if (result.affectedRows > 0) {
                    // If campaign had an image, delete it from the server
                    if (campaign.image_url) {
                        const imagePath = path.join(__dirname, campaign.image_url); // Assuming image_url is like '/uploads/filename.jpg'
                        fs.unlink(imagePath, (err) => {
                            if (err) {
                                // Log error but don't send 500, as campaign and donations are deleted
                                console.error('Error deleting campaign image:', err);
                            } else {
                                console.log('Campaign image deleted successfully:', imagePath);
                            }
                        });
                    }
                    res.json({ success: true, message: 'Campaign and associated donations deleted successfully' });
                } else {
                    // This case should ideally be caught by the check above, but as a fallback
                    res.status(404).json({ error: 'Campaign not found or already deleted' });
                }
            } catch (err) {
                console.error('Error deleting campaign:', err);
                res.status(500).json({ error: 'Error deleting campaign' });
            }
        });

        app.put('/api/admin/campaigns/:id', authenticateAdmin, async (req, res) => {
            const { id } = req.params;
            const { title, description, goal_amount, category } = req.body;

            // Basic validation
            if (!title || !description || !goal_amount || !category) {
                return res.status(400).json({ error: 'Missing required fields: title, description, goal_amount, category' });
            }
            if (isNaN(parseFloat(goal_amount)) || parseFloat(goal_amount) <= 0) {
                return res.status(400).json({ error: 'Goal amount must be a positive number' });
            }

            try {
                const [campaigns] = await db.query('SELECT id FROM campaigns WHERE id = ?', [id]);
                if (campaigns.length === 0) {
                    return res.status(404).json({ error: 'Campaign not found' });
                }

                await db.query(
                    'UPDATE campaigns SET title = ?, description = ?, goal_amount = ?, category = ? WHERE id = ?',
                    [title, description, parseFloat(goal_amount), category, id]
                );

                res.json({ success: true, message: 'Campaign updated successfully' });

            } catch (err) {
                console.error('Error updating campaign:', err);
                res.status(500).json({ error: 'Server error while updating campaign' });
            }
        });

        app.get('/api/campaigns', async (req, res) => {
            try {
                const [rows] = await db.query(
                    'SELECT * FROM campaigns WHERE status = ? ORDER BY created_at DESC',
                    ['approved']
                );
                res.json(rows);
            } catch (err) {
                console.error('Error fetching approved campaigns:', err);
                res.status(500).json({ error: 'Error fetching campaigns' });
            }
        });

         
        const UPLOAD_DIR = './server/uploads';
        
        if (!fs.existsSync(UPLOAD_DIR)){
            fs.mkdirSync(UPLOAD_DIR, { recursive: true });
        }

        const storage = multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, UPLOAD_DIR);
            },
            filename: function (req, file, cb) {
                
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
            }
        });

        
        const imageFileFilter = (req, file, cb) => {
            if (file.mimetype.startsWith('image/')) {
                cb(null, true);
            } else {
                cb(new Error('Not an image! Please upload only images.'), false);
            }
        };

        const upload = multer({ storage: storage, fileFilter: imageFileFilter });
        

        
        app.post('/api/campaigns', authenticateUser, upload.single('campaignImage'), async (req, res) => {
            
            const { title, description, goal_amount, category } = req.body;
            const userId = req.userId; 
            
            
            const imageFile = req.file;
            let imageUrl = null;
            if (imageFile) {
                
                imageUrl = `/uploads/${imageFile.filename}`;
                console.log('Image uploaded:', imageUrl);
            }

            
            if (!title || !description || !goal_amount || !category) {
                
                if (imageFile) fs.unlinkSync(imageFile.path);
                return res.status(400).json({ error: 'Missing required fields: title, description, goal amount, category' });
            }
            if (isNaN(parseFloat(goal_amount)) || parseFloat(goal_amount) <= 0) {
                
                if (imageFile) fs.unlinkSync(imageFile.path);
                return res.status(400).json({ error: 'Goal amount must be a positive number' });
            }

            try {
                const [result] = await db.query(
                    'INSERT INTO campaigns (title, description, goal_amount, category, image_url, user_id, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [title, description, parseFloat(goal_amount), category, imageUrl, userId, 'pending'] 
                );
                
                res.status(201).json({ message: 'Campaign created successfully and pending approval', campaignId: result.insertId });

            } catch (err) {
                console.error('Error creating campaign:', err);
                 
                if (imageFile) fs.unlinkSync(imageFile.path);
                res.status(500).json({ error: 'Server error while creating campaign' });
            }
        });

        
        app.post('/api/donations', async (req, res) => { 
            const { campaign_id, amount, donor_name, message } = req.body; 
            

            if (!campaign_id || !amount) {
                return res.status(400).json({ error: 'Missing required fields: campaign_id, amount' });
            }
            if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
                return res.status(400).json({ error: 'Amount must be a positive number' });
            }

            try {
                
                const [campaigns] = await db.query('SELECT current_amount, status FROM campaigns WHERE id = ?', [campaign_id]);
                if (campaigns.length === 0) {
                    return res.status(404).json({ error: 'Campaign not found' });
                }
                if (campaigns[0].status !== 'approved') {
                    return res.status(400).json({ error: 'Donations can only be made to approved campaigns' });
                }

                
                const [result] = await db.query(
                    'INSERT INTO donations (campaign_id, amount, donor_name, message) VALUES (?, ?, ?, ?)',
                    [campaign_id, parseFloat(amount), donor_name || 'Anonymous', message || null] 
                );

                
                await db.query(
                    'UPDATE campaigns SET current_amount = current_amount + ? WHERE id = ?',
                    [parseFloat(amount), campaign_id]
                );

                res.status(201).json({ message: 'Donation successful', donationId: result.insertId });

            } catch (err) {
                console.error('Error processing donation:', err);
                res.status(500).json({ error: 'Server error while processing donation' });
            }
        });

        
        app.post('/api/register', async (req, res) => {
            const { username, password, email } = req.body;

            if (!username || !password || !email) {
                return res.status(400).json({ error: 'Username, password, and email are required' });
            }
            if (password.length < 6) {
                 return res.status(400).json({ error: 'Password must be at least 6 characters long' });
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ error: 'Invalid email format' });
            }

            try {
                const [existingUsernames] = await db.query('SELECT id FROM users WHERE username = ?', [username]);
                if (existingUsernames.length > 0) {
                    return res.status(409).json({ error: 'Username already exists' });
                }
                
                const [existingEmails] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
                if (existingEmails.length > 0) {
                    return res.status(409).json({ error: 'Email already exists' });
                }
                
                const [result] = await db.query(
                    'INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)',
                    [username, password, email, 'user']
                );

                res.status(201).json({ message: 'User registered successfully', userId: result.insertId });

            } catch (err) {
                console.error('Error registering user:', err);
                res.status(500).json({ error: 'Server error during registration' });
            }
        });

        
        app.post('/api/login', async (req, res) => {
            const { username, password } = req.body;

            if (!username || !password) {
                return res.status(400).json({ error: 'Username and password are required' });
            }

            try {
                const [rows] = await db.query(
                    'SELECT id, username, role FROM users WHERE username = ? AND password = ? AND role = ?', 
                    [username, password, 'user']
                );
                
                if (rows.length > 0) {
                    const user = rows[0];
                    
                    const token = `user-token-${user.id}`; 
                    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
                } else {
                    res.status(401).json({ error: 'Invalid credentials' });
                }
            } catch (err) {
                console.error('User login error:', err);
                res.status(500).json({ error: 'Server error during user login' });
            }
        });

        
        app.use((err, req, res, next) => {
            console.error('Global error handler:', err);
            
            if (err instanceof multer.MulterError) {
                return res.status(400).json({ error: `Multer error: ${err.message}` });
            }
            
            if (err.message === 'Not an image! Please upload only images.') {
                return res.status(400).json({ error: err.message });
            }
            
            res.status(500).json({ error: 'Something went wrong on the server!' });
        });

        app.listen(port, () => {
            console.log(`Server running on http://localhost:${port}`);
        });

    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1); 
    }
}

startServer();

