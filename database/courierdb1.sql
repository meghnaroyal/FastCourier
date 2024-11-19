-- Part 1: Database and Tables Setup
DROP DATABASE IF EXISTS `courierdb1`;
CREATE DATABASE IF NOT EXISTS `courierdb1`;
USE `courierdb1`;

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET GLOBAL time_zone = '+00:00';
SET NAMES utf8mb4;

-- Users table
CREATE TABLE `users` (
  `u_id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(50) NOT NULL,
  `name` varchar(50) NOT NULL,
  `pnumber` varchar(20) NOT NULL,
  `password` varchar(255) NOT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `status` enum('active', 'inactive', 'blocked') DEFAULT 'active',
  `last_login` timestamp NULL DEFAULT NULL,
  `login_attempts` int DEFAULT '0',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`u_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Admin table
CREATE TABLE `admin` (
  `a_id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(50) NOT NULL,
  `name` varchar(50) NOT NULL,
  `pnumber` varchar(20) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('super_admin', 'admin', 'moderator') DEFAULT 'admin',
  `permissions` JSON DEFAULT NULL,
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`a_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Courier table
CREATE TABLE `courier` (
  `c_id` int NOT NULL AUTO_INCREMENT,
  `u_id` int DEFAULT NULL,
  `semail` varchar(50) NOT NULL,
  `remail` varchar(50) NOT NULL,
  `sname` varchar(50) NOT NULL,
  `rname` varchar(50) NOT NULL,
  `sphone` varchar(20) NOT NULL,
  `rphone` varchar(20) NOT NULL,
  `saddress` varchar(255) NOT NULL,
  `raddress` varchar(255) NOT NULL,
  `weight` decimal(10,2) NOT NULL,
  `billno` varchar(20) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `payment_status` enum('pending', 'paid', 'failed') DEFAULT 'pending',
  `payment_method` varchar(50) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `date` date NOT NULL,
  `status` enum('Pending', 'Picked Up', 'In Transit', 'Out for Delivery', 'Delivered', 'Failed', 'Returned') DEFAULT 'Pending',
  `expected_delivery` date DEFAULT NULL,
  `actual_delivery` datetime DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`c_id`),
  UNIQUE KEY `billno` (`billno`),
  KEY `u_id` (`u_id`),
  CONSTRAINT `courier_ibfk_1` FOREIGN KEY (`u_id`) REFERENCES `users` (`u_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tracking history table
CREATE TABLE `courier_tracking` (
  `id` int NOT NULL AUTO_INCREMENT,
  `c_id` int NOT NULL,
  `status` varchar(50) NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `description` text,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `c_id` (`c_id`),
  CONSTRAINT `tracking_courier_fk` FOREIGN KEY (`c_id`) REFERENCES `courier` (`c_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Contacts table
CREATE TABLE `contacts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(50) NOT NULL,
  `subject` varchar(100) NOT NULL,
  `msg` text NOT NULL,
  `status` enum('new', 'in_progress', 'resolved', 'closed') DEFAULT 'new',
  `assigned_to` int DEFAULT NULL,
  `resolved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `assigned_to` (`assigned_to`),
  CONSTRAINT `contacts_admin_fk` FOREIGN KEY (`assigned_to`) REFERENCES `admin` (`a_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Pricing table
CREATE TABLE `pricing` (
  `id` int NOT NULL AUTO_INCREMENT,
  `weight_from` decimal(10,2) NOT NULL,
  `weight_to` decimal(10,2) NOT NULL,
  `price_per_kg` decimal(10,2) NOT NULL,
  `zone` varchar(50) DEFAULT 'default',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Activity logs table
CREATE TABLE `activity_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `admin_id` int DEFAULT NULL,
  `action` varchar(255) NOT NULL,
  `entity_type` varchar(50) DEFAULT NULL,
  `entity_id` int DEFAULT NULL,
  `description` text,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `admin_id` (`admin_id`),
  CONSTRAINT `log_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`u_id`) ON DELETE SET NULL,
  CONSTRAINT `log_admin_fk` FOREIGN KEY (`admin_id`) REFERENCES `admin` (`a_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Notifications table
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `admin_id` int DEFAULT NULL,
  `type` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `is_read` boolean DEFAULT false,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `admin_id` (`admin_id`),
  CONSTRAINT `notification_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`u_id`) ON DELETE CASCADE,
  CONSTRAINT `notification_admin_fk` FOREIGN KEY (`admin_id`) REFERENCES `admin` (`a_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Part 2: Views with Nested Queries, JOINs, and Aggregates

-- Nested Query Views
CREATE VIEW active_senders AS
SELECT u.*, 
       (SELECT COUNT(*) FROM courier c WHERE c.u_id = u.u_id) as total_couriers
FROM users u
WHERE u.u_id IN (
    SELECT u_id 
    FROM courier 
    GROUP BY u_id 
    HAVING COUNT(*) > 5
);

CREATE VIEW premium_couriers AS
SELECT *
FROM courier
WHERE price > (
    SELECT AVG(price)
    FROM courier
);

-- JOIN Query Views
CREATE VIEW courier_details AS
SELECT 
    c.*,
    u.name as sender_name,
    u.email as sender_email,
    ct.status as current_status,
    ct.location as current_location,
    ct.created_at as status_update_time
FROM courier c
LEFT JOIN users u ON c.u_id = u.u_id
LEFT JOIN courier_tracking ct ON c.c_id = ct.c_id
WHERE ct.id = (
    SELECT MAX(id)
    FROM courier_tracking
    WHERE c_id = c.c_id
);

CREATE VIEW admin_activity AS
SELECT 
    a.*,
    COUNT(DISTINCT al.id) as total_actions,
    COUNT(DISTINCT c.id) as resolved_contacts
FROM admin a
LEFT JOIN activity_logs al ON a.a_id = al.admin_id
LEFT JOIN contacts c ON a.a_id = c.assigned_to AND c.status = 'resolved'
GROUP BY a.a_id;

-- Aggregate Query Views
CREATE VIEW monthly_revenue AS
SELECT 
    DATE_FORMAT(date, '%Y-%m') as month,
    COUNT(*) as total_deliveries,
    SUM(price) as total_revenue,
    AVG(price) as avg_price,
    COUNT(CASE WHEN status = 'Delivered' THEN 1 END) as successful_deliveries,
    COUNT(CASE WHEN payment_status = 'paid' THEN 1 END) as paid_deliveries
FROM courier
GROUP BY DATE_FORMAT(date, '%Y-%m')
ORDER BY month DESC;

CREATE VIEW user_activity AS
SELECT 
    u.u_id,
    u.name,
    u.email,
    COUNT(c.c_id) as total_shipments,
    SUM(c.price) as total_spent,
    MAX(c.date) as last_shipment_date,
    COUNT(CASE WHEN c.status = 'Delivered' THEN 1 END) as successful_deliveries,
    ROUND(COUNT(CASE WHEN c.status = 'Delivered' THEN 1 END) * 100.0 / COUNT(*), 2) as success_rate
FROM users u
LEFT JOIN courier c ON u.u_id = c.u_id
GROUP BY u.u_id, u.name, u.email;

CREATE VIEW delivery_performance AS
SELECT 
    DATE_FORMAT(date, '%Y-%m') as month,
    status,
    COUNT(*) as total_count,
    AVG(TIMESTAMPDIFF(HOUR, created_at, actual_delivery)) as avg_delivery_hours,
    MIN(TIMESTAMPDIFF(HOUR, created_at, actual_delivery)) as min_delivery_hours,
    MAX(TIMESTAMPDIFF(HOUR, created_at, actual_delivery)) as max_delivery_hours
FROM courier
WHERE actual_delivery IS NOT NULL
GROUP BY DATE_FORMAT(date, '%Y-%m'), status
ORDER BY month DESC, total_count DESC;

-- Part 3: Stored Procedures

DELIMITER //

-- Calculate courier price
CREATE PROCEDURE CalculateCourierPrice(
  IN p_weight DECIMAL(10,2),
  IN p_zone VARCHAR(50),
  OUT p_price DECIMAL(10,2)
)
BEGIN
  SELECT price_per_kg * p_weight INTO p_price
  FROM pricing
  WHERE p_weight BETWEEN weight_from AND weight_to
  AND zone = p_zone
  LIMIT 1;
END //

-- Get courier statistics
CREATE PROCEDURE GetCourierStats(
  IN p_start_date DATE,
  IN p_end_date DATE
)
BEGIN
  SELECT 
    COUNT(*) as total_couriers,
    SUM(CASE WHEN status = 'Delivered' THEN 1 ELSE 0 END) as delivered,
    SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending,
    SUM(CASE WHEN status = 'In Transit' THEN 1 ELSE 0 END) as in_transit,
    SUM(price) as total_revenue,
    AVG(CASE 
      WHEN actual_delivery IS NOT NULL 
      THEN TIMESTAMPDIFF(HOUR, created_at, actual_delivery)
      ELSE NULL 
    END) as avg_delivery_time
  FROM courier
  WHERE date BETWEEN p_start_date AND p_end_date;
END //

-- Register user
CREATE PROCEDURE RegisterUser(
  IN p_email VARCHAR(50),
  IN p_password VARCHAR(255),
  IN p_name VARCHAR(50),
  IN p_pnumber VARCHAR(20),
  IN p_address VARCHAR(255),
  IN p_profile_image VARCHAR(255)
)
BEGIN
  INSERT INTO users (
    email, password, name, pnumber, address, profile_image, status
  ) VALUES (
    p_email, p_password, p_name, p_pnumber, p_address, p_profile_image, 'active'
  );
  
  SELECT LAST_INSERT_ID() as userId;
END //

-- Get user by email
CREATE PROCEDURE GetUserByEmail(
  IN p_email VARCHAR(50)
)
BEGIN
  SELECT *
  FROM users
  WHERE email = p_email;
END //

-- Get admin by email
CREATE PROCEDURE GetAdminByEmail(
  IN p_email VARCHAR(50)
)
BEGIN
  SELECT *
  FROM admin
  WHERE email = p_email;
END //

-- Update user login
CREATE PROCEDURE UpdateUserLogin(
  IN p_user_id INT
)
BEGIN
  UPDATE users 
  SET last_login = CURRENT_TIMESTAMP,
      login_attempts = 0
  WHERE u_id = p_user_id;
END //

-- Create activity log
CREATE PROCEDURE LogActivity(
  IN p_user_id INT,
  IN p_admin_id INT,
  IN p_action VARCHAR(255),
  IN p_entity_type VARCHAR(50),
  IN p_entity_id INT,
  IN p_description TEXT,
  IN p_ip_address VARCHAR(45)
)
BEGIN
  INSERT INTO activity_logs (
    user_id, admin_id, action, entity_type, 
    entity_id, description, ip_address
  ) VALUES (
    p_user_id, p_admin_id, p_action, p_entity_type, 
    p_entity_id, p_description, p_ip_address
  );
END //

-- Create notification
CREATE PROCEDURE CreateNotification(
  IN p_user_id INT,
  IN p_admin_id INT,
  IN p_type VARCHAR(50),
  IN p_title VARCHAR(255),
  IN p_message TEXT
)
BEGIN
  INSERT INTO notifications (
    user_id, admin_id, type, title, message
  ) VALUES (
    p_user_id, p_admin_id, p_type, p_title, p_message
  );
END //

-- Update tracking
CREATE PROCEDURE InsertTrackingUpdate(
  IN p_c_id INT,
  IN p_status VARCHAR(50),
  IN p_location VARCHAR(255),
  IN p_description TEXT
)
BEGIN
  INSERT INTO courier_tracking (c_id, status, location, description)
  VALUES (p_c_id, p_status, p_location, p_description);
  
  UPDATE courier SET status = p_status WHERE c_id = p_c_id;
END //

DELIMITER ;

-- Part 4: Triggers

DELIMITER //

CREATE TRIGGER after_user_login
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
  IF NEW.last_login != OLD.last_login THEN
    INSERT INTO activity_logs (user_id, action, description)
    VALUES (NEW.u_id, 'login', 'User logged in');
  END IF;
END //

CREATE TRIGGER after_courier_status_change
AFTER UPDATE ON courier
FOR EACH ROW
BEGIN
  IF NEW.status != OLD.status THEN
    INSERT INTO courier_tracking (c_id, status, description)
    VALUES (NEW.c_id, NEW.status, CONCAT('Status changed from ', OLD.status, ' to ', NEW.status));
  END IF;
END //

CREATE TRIGGER after_notification_create
AFTER INSERT ON notifications
FOR EACH ROW
BEGIN
    IF NEW.user_id IS NOT NULL THEN
        INSERT INTO activity_logs (user_id, action, description)
        VALUES (NEW.user_id, 'notification_received', CONCAT('New notification: ', NEW.title));
    END IF;
END //

CREATE TRIGGER after_contact_resolve
AFTER UPDATE ON contacts
FOR EACH ROW
BEGIN
    IF NEW.status = 'resolved' AND OLD.status != 'resolved' THEN
        INSERT INTO activity_logs (admin_id, action, description)
        VALUES (NEW.assigned_to, 'contact_resolved', CONCAT('Resolved contact ticket #', NEW.id));
    END IF;
END //

DELIMITER ;

-- Part 5: Default Data Insertion

-- Insert default admin
INSERT INTO `admin` (`email`, `name`, `pnumber`, `password`, `role`, `permissions`) 
VALUES('admin@courier.com', 'Super Admin', '1234567890', '$2b$10$D/CZz4ybvl5w1XDEm/r6FOsaG8gsZwmYPF3atXJJmm5qclJjgYmYi', 'super_admin', '{"all": true, "users": {"view": true, "create": true, "update": true, "delete": true}, "couriers": {"view": true, "create": true, "update": true, "delete": true}}'); 

-- Insert default pricing
INSERT INTO `pricing` (`weight_from`, `weight_to`, `price_per_kg`, `zone`) VALUES
(0, 1, 100.00, 'default'),
(1.01, 5, 90.00, 'default'),
(5.01, 10, 80.00, 'default'),
(10.01, 20, 70.00, 'default'),
(0, 1, 120.00, 'express'),
(1.01, 5, 110.00, 'express'),
(5.01, 10, 100.00, 'express'),
(10.01, 20, 90.00, 'express');

-- Part 6: Additional Views for Analysis

-- Create view for zone-wise pricing analysis
CREATE VIEW zone_pricing_analysis AS
SELECT 
    p.zone,
    COUNT(c.c_id) as total_deliveries,
    AVG(c.price) as avg_price,
    MIN(c.price) as min_price,
    MAX(c.price) as max_price,
    SUM(c.price) as total_revenue
FROM pricing p
LEFT JOIN courier c ON c.weight BETWEEN p.weight_from AND p.weight_to
GROUP BY p.zone;

-- Create view for contact resolution metrics
CREATE VIEW contact_resolution_metrics AS
SELECT 
    a.name as admin_name,
    COUNT(c.id) as total_assigned,
    COUNT(CASE WHEN c.status = 'resolved' THEN 1 END) as resolved_count,
    AVG(TIMESTAMPDIFF(HOUR, c.created_at, c.resolved_at)) as avg_resolution_time,
    COUNT(CASE WHEN c.status = 'new' THEN 1 END) as pending_count
FROM admin a
LEFT JOIN contacts c ON a.a_id = c.assigned_to
GROUP BY a.a_id, a.name;

-- Create view for user shipping patterns
CREATE VIEW user_shipping_patterns AS
SELECT 
    u.u_id,
    u.name,
    COUNT(c.c_id) as total_shipments,
    AVG(c.weight) as avg_weight,
    SUM(c.price) as total_spent,
    COUNT(DISTINCT DATE_FORMAT(c.date, '%Y-%m')) as active_months,
    MAX(c.date) as last_shipment,
    COUNT(DISTINCT c.raddress) as unique_destinations
FROM users u
LEFT JOIN courier c ON u.u_id = c.u_id
GROUP BY u.u_id, u.name
HAVING total_shipments > 0;

-- Create view for delivery time analysis
CREATE VIEW delivery_time_analysis AS
SELECT 
    DATE_FORMAT(date, '%Y-%m') as month,
    COUNT(*) as total_deliveries,
    AVG(TIMESTAMPDIFF(HOUR, created_at, actual_delivery)) as avg_delivery_time,
    MIN(TIMESTAMPDIFF(HOUR, created_at, actual_delivery)) as fastest_delivery,
    MAX(TIMESTAMPDIFF(HOUR, created_at, actual_delivery)) as slowest_delivery,
    STD(TIMESTAMPDIFF(HOUR, created_at, actual_delivery)) as delivery_time_std
FROM courier
WHERE actual_delivery IS NOT NULL
GROUP BY DATE_FORMAT(date, '%Y-%m')
ORDER BY month DESC;

-- Part 7: Indexes for Performance

-- Create indexes for frequently queried columns
CREATE INDEX idx_courier_status_date ON courier(status, date);
CREATE INDEX idx_tracking_created ON courier_tracking(created_at);
CREATE INDEX idx_activity_logs_date ON activity_logs(created_at);
CREATE INDEX idx_contacts_status ON contacts(status);
CREATE INDEX idx_courier_weight ON courier(weight);
CREATE INDEX idx_courier_payment ON courier(payment_status);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_courier_created ON courier(created_at);
CREATE INDEX idx_courier_updated ON courier(updated_at);

-- Part 8: Additional Utility Procedures

DELIMITER //

-- Get courier delivery statistics by date range
CREATE PROCEDURE GetDeliveryStats(
    IN start_date DATE,
    IN end_date DATE
)
BEGIN
    SELECT 
        COUNT(*) as total_deliveries,
        COUNT(CASE WHEN status = 'Delivered' THEN 1 END) as successful_deliveries,
        COUNT(CASE WHEN status = 'Failed' THEN 1 END) as failed_deliveries,
        AVG(TIMESTAMPDIFF(HOUR, created_at, actual_delivery)) as avg_delivery_time,
        SUM(price) as total_revenue
    FROM courier
    WHERE date BETWEEN start_date AND end_date;
END //

-- Get user shipping history with details
CREATE PROCEDURE GetUserShippingHistory(
    IN p_user_id INT
)
BEGIN
    SELECT 
        c.*,
        ct.status as current_status,
        ct.location as current_location,
        ct.created_at as status_update_time
    FROM courier c
    LEFT JOIN courier_tracking ct ON c.c_id = ct.c_id
    WHERE c.u_id = p_user_id
    AND ct.id = (
        SELECT MAX(id)
        FROM courier_tracking
        WHERE c_id = c.c_id
    )
    ORDER BY c.date DESC;
END //

DELIMITER ;

-- Add error logging table
CREATE TABLE `error_logs` (
    `id` int NOT NULL AUTO_INCREMENT,
    `error_code` varchar(50) NOT NULL,
    `error_message` text NOT NULL,
    `stack_trace` text,
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_error_code` (`error_code`),
    INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;