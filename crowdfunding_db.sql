-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: May 06, 2025 at 09:51 AM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `crowdfunding_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `campaigns`
--

CREATE TABLE `campaigns` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `goal_amount` decimal(10,2) NOT NULL,
  `current_amount` decimal(10,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `user_id` int(11) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `campaigns`
--

INSERT INTO `campaigns` (`id`, `title`, `description`, `goal_amount`, `current_amount`, `created_at`, `user_id`, `category`, `image_url`, `status`) VALUES
(1, 'Help Build a School', 'Building a school in rural area', 50000.00, 0.00, '2025-05-02 18:23:45', NULL, 'Education', NULL, 'rejected'),
(2, 'Medical Fund', 'Help with medical expenses', 10000.00, 0.00, '2025-05-02 18:23:45', NULL, 'Medical', NULL, 'rejected'),
(3, 'Community Garden', 'Create a community garden', 5000.00, 0.00, '2025-05-02 18:23:45', NULL, 'Community', NULL, 'rejected'),
(4, 'Projektas', 'Geras projektas', 1000.00, 1000.00, '2025-05-04 09:59:04', 4, 'Technology', '/uploads/campaignImage-1746352744946-588522589.avif', 'approved'),
(5, 'Internetine Parduotuve', 'In a quiet town nestled between rolling hills and whispering forests, life moved at a gentle pace. Morning sunlight spilled over cobblestone streets, warming the sleepy rooftops and fluttering laundry lines. Children chased each other through fields of tall grass, their laughter echoing like music across the countryside.\r\n\r\nAt the town’s heart stood an old clock tower, its face weathered by time, but its hands still ticking faithfully. The townspeople gathered each Sunday in the square, sharing stories, goods, and smiles. A baker named Elias made the flakiest croissants, while old Mrs. Lenore sold herbs and teas from a wooden stall beneath a flowering cherry tree.\r\n\r\nDespite its simplicity, the town had secrets. A narrow path behind the chapel led to a forgotten garden, overgrown but still blooming in wild defiance. At night, the wind carried tales through the trees—tales of a hidden treasure buried long ago, protected by riddles and guarded by time.\r\n\r\nFew believed in such things, but one curious girl named Mira listened. Her eyes sparkled with dreams and determination. She carried a notebook, a flashlight, and hope in her pocket, ready for whatever the shadows might reveal. The town, it seemed, was not as sleepy as it appeared.', 10000.00, 0.00, '2025-05-05 05:39:45', 4, 'Menas', '/uploads/campaignImage-1746423585483-827839134.png', 'approved');

-- --------------------------------------------------------

--
-- Table structure for table `donations`
--

CREATE TABLE `donations` (
  `id` int(11) NOT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `donor_name` varchar(255) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `donations`
--

INSERT INTO `donations` (`id`, `campaign_id`, `user_id`, `amount`, `donor_name`, `message`, `created_at`) VALUES
(1, 4, NULL, 500.00, 'Valerij', NULL, '2025-05-04 10:18:55'),
(2, 4, NULL, 500.00, 'Valerij', NULL, '2025-05-04 10:19:09');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(20) DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `role`, `created_at`) VALUES
(1, 'testuser', 'test@example.com', 'password123', 'user', '2025-05-02 18:23:45'),
(2, 'admin', 'admin@example.com', 'admin123', 'admin', '2025-05-02 20:13:36'),
(4, 'Valerijus', 'valerij@gmail.com', 'Valerij123', 'user', '2025-05-02 20:30:23');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `campaigns`
--
ALTER TABLE `campaigns`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `donations`
--
ALTER TABLE `donations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `campaign_id` (`campaign_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `campaigns`
--
ALTER TABLE `campaigns`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `donations`
--
ALTER TABLE `donations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `donations`
--
ALTER TABLE `donations`
  ADD CONSTRAINT `donations_ibfk_1` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns` (`id`),
  ADD CONSTRAINT `donations_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
