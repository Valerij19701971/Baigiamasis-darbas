
-- Table: campaigns
CREATE TABLE campaigns (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            goal_amount REAL NOT NULL,
            current_amount REAL DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );


-- Table: sqlite_sequence
CREATE TABLE sqlite_sequence(name,seq);


-- Table: donations
CREATE TABLE donations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            campaign_id INTEGER,
            amount REAL NOT NULL,
            donor_name TEXT,
            message TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (campaign_id) REFERENCES campaigns (id)
        );

