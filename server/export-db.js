const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Database connection
const db = new sqlite3.Database(path.join(__dirname, 'db/crowdfunding.db'), (err) => {
    if (err) {
        console.error('Error opening database:', err);
        return;
    }
    console.log('Connected to SQLite database');
    exportDatabase();
});

function exportDatabase() {
    // Get all tables
    db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
        if (err) {
            console.error('Error getting tables:', err);
            return;
        }

        let sqlContent = '';

        // For each table, get its schema and data
        tables.forEach((table, index) => {
            // Get table schema
            db.get(`SELECT sql FROM sqlite_master WHERE type='table' AND name=?`, [table.name], (err, schema) => {
                if (err) {
                    console.error(`Error getting schema for table ${table.name}:`, err);
                    return;
                }

                sqlContent += `\n-- Table: ${table.name}\n`;
                sqlContent += `${schema.sql};\n\n`;

                // Get table data
                db.all(`SELECT * FROM ${table.name}`, [], (err, rows) => {
                    if (err) {
                        console.error(`Error getting data for table ${table.name}:`, err);
                        return;
                    }

                    if (rows.length > 0) {
                        sqlContent += `-- Data for table ${table.name}\n`;
                        rows.forEach(row => {
                            const columns = Object.keys(row);
                            const values = columns.map(col => {
                                const value = row[col];
                                return typeof value === 'string' ? `'${value.replace(/'/g, "''")}'` : value;
                            });
                            sqlContent += `INSERT INTO ${table.name} (${columns.join(', ')}) VALUES (${values.join(', ')});\n`;
                        });
                        sqlContent += '\n';
                    }

                    // If this is the last table, write the file
                    if (index === tables.length - 1) {
                        const exportPath = path.join(__dirname, 'db/crowdfunding_export.sql');
                        fs.writeFile(exportPath, sqlContent, (err) => {
                            if (err) {
                                console.error('Error writing SQL file:', err);
                                return;
                            }
                            console.log(`Database exported successfully to: ${exportPath}`);
                            db.close();
                        });
                    }
                });
            });
        });
    });
} 