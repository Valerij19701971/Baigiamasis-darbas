const db = require('./config/db');

async function checkConnection() {
    try {
        const [rows] = await db.query('SELECT 1');
        console.log('Database connection successful!');
        process.exit(0);
    } catch (err) {
        console.error('Database connection failed:', err);
        process.exit(1);
    }
}

checkConnection(); 