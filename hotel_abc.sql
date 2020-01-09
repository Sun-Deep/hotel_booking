-- phpMyAdmin SQL Dump
-- version 4.9.0.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 03, 2020 at 06:24 AM
-- Server version: 10.3.16-MariaDB
-- PHP Version: 7.1.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `hotel_abc`
--

-- --------------------------------------------------------

--
-- Table structure for table `hotel_booking`
--

CREATE TABLE `hotel_booking` (
  `id` int(11) NOT NULL,
  `book_id` int(11) NOT NULL,
  `room_id` int(11) NOT NULL,
  `checked_in` date NOT NULL,
  `checked_out` date NOT NULL,
  `booked_by` varchar(255) NOT NULL,
  `status` binary(1) NOT NULL,
  `booking_amount` float NOT NULL,
  `adult` int(11) NOT NULL,
  `child` int(11) DEFAULT NULL,
  `extra_bed` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `hotel_booking`
--

INSERT INTO `hotel_booking` (`id`, `book_id`, `room_id`, `checked_in`, `checked_out`, `booked_by`, `status`, `booking_amount`, `adult`, `child`, `extra_bed`) VALUES
(4, 1, 103, '2019-11-11', '2019-11-12', 'Tilak', 0x31, 300, 2, NULL, NULL),
(5, 2, 204, '2019-11-13', '2019-11-15', 'Sandeep', 0x31, 500, 2, 1, 1),
(6, 3, 301, '2019-11-18', '2019-11-20', 'Mr. Poudel', 0x31, 200, 1, NULL, 1),
(7, 4, 110, '2019-11-13', '2019-11-16', 'Mr. Susan', 0x31, 335, 1, NULL, NULL),
(8, 5, 203, '2019-11-27', '2019-11-29', 'Mr. Prem', 0x31, 100, 2, NULL, NULL),
(9, 6, 105, '2019-11-12', '2019-11-15', 'Sandeep', 0x31, 110, 1, NULL, NULL),
(10, 7, 401, '2019-11-14', '2019-11-16', 'Sandeep', 0x31, 200, 1, NULL, NULL),
(11, 8, 205, '2019-11-27', '2019-11-29', 'Tilak', 0x31, 1000, 2, NULL, NULL),
(12, 9, 202, '2019-11-14', '2019-11-16', 'sandeep', 0x31, 200, 1, NULL, NULL),
(13, 10, 202, '2019-11-12', '2019-11-13', 'tilak', 0x30, 100, 2, NULL, NULL),
(14, 11, 303, '2019-11-14', '2019-11-15', 'Sandeep', 0x31, 300, 2, 1, 1),
(15, 12, 303, '2019-11-14', '2019-11-15', 'Sandeep', 0x31, 300, 2, 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `hotel_categories`
--

CREATE TABLE `hotel_categories` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `photos` text NOT NULL,
  `descriptions` text NOT NULL,
  `max_guest` int(11) NOT NULL,
  `child` int(11) NOT NULL,
  `extra_bed` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `hotel_categories`
--

INSERT INTO `hotel_categories` (`id`, `name`, `photos`, `descriptions`, `max_guest`, `child`, `extra_bed`) VALUES
(1, 'DELUXE ROOM', 'accomodations/deluxe.jpg', 'Our Superior Rooms offer exquisite comfort, security, modern amenities and easy access to all the fun of the ABC. These cosy havens of peace are ideal for business and leisure travellers, singles, friends and couples.', 2, 1, 1),
(2, 'DELUXE ROOMS TWIN', 'accomodations/deluxe_room_twin.jpg', 'With a touch of extra space, our Deluxe Rooms blend modern sophistication, comfort and security with a touch of the exotic to envelop you in a plush embrace.', 3, 2, 1),
(3, 'SUITES', 'accomodations/suites.jpg', 'Give yourself more room to prowl with a princely suite at the ABC. These superbly appointed rooms and beds feature luxurious proportions, a multitude of amenities, total security and beautiful views. ', 2, 1, 1),
(4, 'VIP VILLAS', 'accomodations/villas.jpg', 'The two exclusive VIP Villas provide a rare level of luxurious retreat for big players. With almost 120 square metres of space you can treat your guests and loved ones to beautiful views of the resort, private access to the pools, an al fresco shower, and a generous measure of indulgence.', 4, 2, 1);

-- --------------------------------------------------------

--
-- Table structure for table `hotel_cat_features`
--

CREATE TABLE `hotel_cat_features` (
  `id` int(11) NOT NULL,
  `feature_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `hotel_cat_features`
--

INSERT INTO `hotel_cat_features` (`id`, `feature_name`) VALUES
(2, 'Room Amenities\r\n'),
(3, 'Bathroom'),
(4, 'Media & Technology'),
(5, 'Food & Drink'),
(6, 'Services & Extras'),
(7, 'Outdoor & View\r\n');

-- --------------------------------------------------------

--
-- Table structure for table `hotel_cat_rate`
--

CREATE TABLE `hotel_cat_rate` (
  `id` int(11) NOT NULL,
  `cat_id` int(11) NOT NULL,
  `rate` float NOT NULL,
  `extra_bed` float NOT NULL,
  `extra_guest` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `hotel_cat_rate`
--

INSERT INTO `hotel_cat_rate` (`id`, `cat_id`, `rate`, `extra_bed`, `extra_guest`) VALUES
(1, 1, 155, 70, 35),
(2, 2, 200, 70, 40),
(3, 3, 300, 70, 45),
(4, 4, 350, 70, 50);

-- --------------------------------------------------------

--
-- Table structure for table `hotel_cat_services`
--

CREATE TABLE `hotel_cat_services` (
  `id` int(11) NOT NULL,
  `features_id` int(11) NOT NULL,
  `service_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `hotel_cat_services`
--

INSERT INTO `hotel_cat_services` (`id`, `features_id`, `service_name`) VALUES
(1, 2, 'Air Conditioning'),
(2, 2, 'Clothes rack'),
(3, 2, 'Desk'),
(4, 2, 'Safety Deposit Box\r\n'),
(5, 2, 'Doctor on call'),
(6, 3, 'Bath'),
(7, 3, 'Bath or Shower'),
(8, 3, 'Free toiletries\r\n'),
(9, 3, 'Hairdryer'),
(10, 3, 'Shower'),
(11, 3, 'Toilet'),
(12, 3, 'Bathroom'),
(13, 4, 'Flat-screen TV'),
(14, 4, 'Satellite Channels'),
(15, 4, 'Telephone'),
(16, 5, 'Minibar'),
(17, 5, 'Outdoor furniture'),
(18, 6, 'Towels'),
(19, 6, 'Wake-up service\r\n'),
(20, 7, 'Mountain view'),
(21, 7, 'Sun Set');

-- --------------------------------------------------------

--
-- Table structure for table `hotel_inquiry`
--

CREATE TABLE `hotel_inquiry` (
  `id` int(11) NOT NULL,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `contact` varchar(20) NOT NULL,
  `address` varchar(255) NOT NULL,
  `checked_in` date NOT NULL,
  `checked_out` date NOT NULL,
  `rooms` int(11) NOT NULL,
  `adult` int(11) NOT NULL,
  `child` int(11) DEFAULT 0,
  `extra_bed` int(11) DEFAULT 0,
  `amount` float DEFAULT NULL,
  `called` tinyint(4) NOT NULL DEFAULT 0,
  `date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `hotel_inquiry`
--

INSERT INTO `hotel_inquiry` (`id`, `first_name`, `last_name`, `contact`, `address`, `checked_in`, `checked_out`, `rooms`, `adult`, `child`, `extra_bed`, `amount`, `called`, `date`) VALUES
(1, 'Sandeep', 'Pokhrel', '9876543210', 'Murgiya', '2019-11-24', '2019-11-26', 2, 3, 0, 0, 100, 1, '2019-12-17 10:17:57'),
(2, 'Ram', 'Chaudhary', '9876898765', 'Butwal', '0000-00-00', '0000-00-00', 1, 1, 0, 0, 40, 1, '2019-12-17 08:53:37'),
(3, 'Shyam', 'Sharma', '9868338999', 'Golpark', '0000-00-00', '0000-00-00', 2, 2, 0, 0, 200, 0, '2019-12-17 08:53:46'),
(4, 'Hari', 'Narayan', '9876765434', 'Milanchowk', '2019-11-24', '2019-11-25', 2, 2, 0, 0, 100, 1, '2019-12-17 08:53:50');

-- --------------------------------------------------------

--
-- Table structure for table `hotel_room`
--

CREATE TABLE `hotel_room` (
  `id` int(11) NOT NULL,
  `cat_id` int(11) NOT NULL,
  `room_id` int(11) NOT NULL,
  `status` tinyint(4) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `hotel_room`
--

INSERT INTO `hotel_room` (`id`, `cat_id`, `room_id`, `status`) VALUES
(1, 1, 101, 1),
(14, 1, 102, 0),
(15, 1, 103, 0),
(17, 1, 104, 0),
(18, 1, 105, 1),
(19, 1, 106, 0),
(20, 1, 107, 0),
(21, 1, 108, 0),
(22, 1, 109, 1),
(23, 1, 110, 0),
(24, 2, 201, 0),
(25, 2, 202, 0),
(26, 2, 203, 1),
(27, 2, 204, 0),
(28, 2, 205, 0),
(29, 2, 206, 0),
(30, 2, 207, 1),
(31, 2, 208, 0),
(32, 2, 209, 0),
(33, 3, 301, 0),
(34, 3, 302, 1),
(35, 3, 303, 0),
(36, 3, 304, 0),
(37, 3, 305, 0),
(38, 3, 306, 0),
(39, 3, 307, 1),
(40, 4, 401, 0),
(41, 4, 402, 0),
(42, 4, 403, 0),
(43, 4, 404, 0),
(44, 4, 405, 0);

-- --------------------------------------------------------

--
-- Table structure for table `hotel_room_services`
--

CREATE TABLE `hotel_room_services` (
  `id` int(11) NOT NULL,
  `cat_id` int(11) NOT NULL,
  `service_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `hotel_room_services`
--

INSERT INTO `hotel_room_services` (`id`, `cat_id`, `service_id`) VALUES
(1, 1, 1),
(2, 1, 2),
(3, 1, 3),
(4, 1, 4),
(5, 1, 7),
(6, 1, 8),
(7, 1, 13),
(8, 1, 15),
(9, 1, 18),
(10, 1, 19),
(11, 1, 20),
(12, 2, 1),
(13, 2, 2),
(14, 2, 3),
(15, 2, 4),
(16, 2, 5),
(17, 2, 6),
(18, 2, 7),
(19, 2, 8),
(20, 2, 9),
(21, 2, 10),
(22, 2, 11),
(23, 2, 12),
(25, 2, 14),
(26, 2, 15),
(27, 2, 16),
(28, 2, 17),
(29, 2, 18),
(30, 2, 19),
(31, 2, 20),
(33, 3, 1),
(35, 3, 5),
(36, 3, 7),
(37, 3, 9),
(38, 3, 11),
(39, 3, 13),
(40, 3, 15),
(42, 3, 19),
(43, 3, 21),
(44, 4, 1),
(45, 4, 4),
(46, 4, 7),
(47, 4, 8),
(48, 4, 10),
(49, 4, 13),
(50, 4, 14),
(51, 4, 16),
(52, 4, 18),
(53, 4, 20),
(54, 4, 21),
(55, 4, 15),
(63, 4, 19);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `hotel_booking`
--
ALTER TABLE `hotel_booking`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `book_id` (`book_id`),
  ADD KEY `hotel_booking_fk0` (`room_id`);

--
-- Indexes for table `hotel_categories`
--
ALTER TABLE `hotel_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `hotel_cat_features`
--
ALTER TABLE `hotel_cat_features`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `hotel_cat_rate`
--
ALTER TABLE `hotel_cat_rate`
  ADD PRIMARY KEY (`id`),
  ADD KEY `hotel_cat_rate_fk0` (`cat_id`);

--
-- Indexes for table `hotel_cat_services`
--
ALTER TABLE `hotel_cat_services`
  ADD PRIMARY KEY (`id`),
  ADD KEY `hotel_cat_services_fk0` (`features_id`);

--
-- Indexes for table `hotel_inquiry`
--
ALTER TABLE `hotel_inquiry`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `hotel_room`
--
ALTER TABLE `hotel_room`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `room_id_2` (`room_id`),
  ADD KEY `hotel_room_fk0` (`cat_id`);

--
-- Indexes for table `hotel_room_services`
--
ALTER TABLE `hotel_room_services`
  ADD PRIMARY KEY (`id`),
  ADD KEY `hotel_room_services_fk0` (`cat_id`),
  ADD KEY `hotel_room_services_fk1` (`service_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `hotel_booking`
--
ALTER TABLE `hotel_booking`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `hotel_categories`
--
ALTER TABLE `hotel_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `hotel_cat_features`
--
ALTER TABLE `hotel_cat_features`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `hotel_cat_rate`
--
ALTER TABLE `hotel_cat_rate`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `hotel_cat_services`
--
ALTER TABLE `hotel_cat_services`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `hotel_inquiry`
--
ALTER TABLE `hotel_inquiry`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `hotel_room`
--
ALTER TABLE `hotel_room`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT for table `hotel_room_services`
--
ALTER TABLE `hotel_room_services`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=65;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `hotel_booking`
--
ALTER TABLE `hotel_booking`
  ADD CONSTRAINT `hotel_booking_fk0` FOREIGN KEY (`room_id`) REFERENCES `hotel_room` (`room_id`);

--
-- Constraints for table `hotel_cat_rate`
--
ALTER TABLE `hotel_cat_rate`
  ADD CONSTRAINT `hotel_cat_rate_fk0` FOREIGN KEY (`cat_id`) REFERENCES `hotel_categories` (`id`);

--
-- Constraints for table `hotel_cat_services`
--
ALTER TABLE `hotel_cat_services`
  ADD CONSTRAINT `hotel_cat_services_fk0` FOREIGN KEY (`features_id`) REFERENCES `hotel_cat_features` (`id`);

--
-- Constraints for table `hotel_room`
--
ALTER TABLE `hotel_room`
  ADD CONSTRAINT `hotel_room_fk0` FOREIGN KEY (`cat_id`) REFERENCES `hotel_categories` (`id`);

--
-- Constraints for table `hotel_room_services`
--
ALTER TABLE `hotel_room_services`
  ADD CONSTRAINT `hotel_room_services_fk0` FOREIGN KEY (`cat_id`) REFERENCES `hotel_categories` (`id`),
  ADD CONSTRAINT `hotel_room_services_fk1` FOREIGN KEY (`service_id`) REFERENCES `hotel_cat_services` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
