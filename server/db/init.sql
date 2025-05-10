CREATE DATABASE IF NOT EXISTS crowdfunding_db;
USE crowdfunding_db;

CREATE TABLE IF NOT EXISTS campaigns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    goal_amount DECIMAL(10,2) NOT NULL,
    current_amount DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INT,
    category VARCHAR(100),
    image_url VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS donations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    campaign_id INT,
    user_id INT,
    amount DECIMAL(10,2) NOT NULL,
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

INSERT INTO users (username, email, password, role) VALUES
('admin', 'admin@example.com', 'admin123', 'admin'),
('testuser', 'test@example.com', 'password123', 'user');

INSERT INTO campaigns (title, description, goal_amount, category, status) VALUES
('Help Build a School', 'Building a school in rural area', 50000.00, 'Education', 'pending'),
('Medical Fund', 'Help with medical expenses', 10000.00, 'Medical', 'approved'),
('Community Garden', 'Create a community garden', 5000.00, 'Community', 'pending'); 