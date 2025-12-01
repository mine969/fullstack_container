CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE menu_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(255),
    is_available BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT TRUE,
    category VARCHAR(50)
);
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tracking_id VARCHAR(36) UNIQUE,
    -- Added tracking_id for guest tracking
    status VARCHAR(50) NOT NULL,
    delivery_address VARCHAR(255) NOT NULL,
    notes TEXT,
    total_amount DECIMAL(10, 2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    customer_id INT,
    guest_name VARCHAR(255),
    guest_email VARCHAR(255),
    guest_phone VARCHAR(50),
    driver_id INT,
    FOREIGN KEY (customer_id) REFERENCES users(id),
    FOREIGN KEY (driver_id) REFERENCES users(id)
);
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    menu_item_id INT,
    quantity INT NOT NULL,
    item_price DECIMAL(10, 2) NOT NULL,
    order_id INT,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id),
    FOREIGN KEY (order_id) REFERENCES orders(id)
);
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    -- pending, completed, failed
    transaction_id VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id)
);
CREATE TABLE driver_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    status VARCHAR(50) NOT NULL,
    order_id INT,
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    driver_id INT,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (driver_id) REFERENCES users(id)
);
CREATE TABLE driver_locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    lat FLOAT NOT NULL,
    lng FLOAT NOT NULL,
    driver_id INT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (driver_id) REFERENCES users(id)
);
-- Indexes for performance
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_tracking_id ON orders(tracking_id);
CREATE INDEX idx_driver_assignments_status ON driver_assignments(status);
CREATE INDEX idx_users_email ON users(email);
-- Seed Data: Users
-- Password for all is 'admin123' -> $2b$12$jNGZk2Wf1kGRrbMfTQKD7.j5pS0VpQLDrNvsasA3nADQQeTuMq.ZG
INSERT INTO users (name, email, password_hash, role)
VALUES (
        'Admin Manager',
        'admin123@gmail.com',
        '$2b$12$jNGZk2Wf1kGRrbMfTQKD7.j5pS0VpQLDrNvsasA3nADQQeTuMq.ZG',
        'admin'
    ),
    (
        'Kitchen Staff',
        'kitchen123@gmail.com',
        '$2b$12$jNGZk2Wf1kGRrbMfTQKD7.j5pS0VpQLDrNvsasA3nADQQeTuMq.ZG',
        'kitchen'
    ),
    (
        'Delivery Driver',
        'driver123@gmail.com',
        '$2b$12$jNGZk2Wf1kGRrbMfTQKD7.j5pS0VpQLDrNvsasA3nADQQeTuMq.ZG',
        'driver'
    );
-- Seed Data: Menu Items
INSERT INTO menu_items (
        name,
        description,
        price,
        image_url,
        is_available,
        category
    )
VALUES (
        'Classic Burger',
        'Juicy beef patty with lettuce, tomato, and cheese',
        12.99,
        'burger.jpg',
        TRUE,
        'Main'
    ),
    (
        'Cheese Pizza',
        'Traditional tomato sauce with mozzarella',
        14.99,
        'pizza.jpg',
        TRUE,
        'Main'
    ),
    (
        'Grilled Salmon',
        'Fresh salmon with asparagus',
        18.99,
        'salmon.jpg',
        TRUE,
        'Main'
    ),
    (
        'Steak Frites',
        'Ribeye steak with french fries',
        24.99,
        'steak.jpg',
        TRUE,
        'Main'
    ),
    (
        'Chicken Alfredo',
        'Creamy pasta with grilled chicken',
        16.99,
        'pasta.jpg',
        TRUE,
        'Main'
    ),
    (
        'Caesar Salad',
        'Romaine lettuce with croutons and parmesan',
        8.99,
        'salad.jpg',
        TRUE,
        'Side'
    ),
    (
        'French Fries',
        'Crispy golden fries',
        4.99,
        'fries.jpg',
        TRUE,
        'Side'
    ),
    (
        'Onion Rings',
        'Battered and fried onion rings',
        5.99,
        'onion_rings.jpg',
        TRUE,
        'Side'
    ),
    (
        'Cola',
        'Refreshing cola drink',
        2.99,
        'cola.jpg',
        TRUE,
        'Drink'
    ),
    (
        'Lemonade',
        'Freshly squeezed lemonade',
        3.99,
        'lemonade.jpg',
        TRUE,
        'Drink'
    );
-- Seed Data: Sample Orders
INSERT INTO orders (
        tracking_id,
        status,
        delivery_address,
        total_amount,
        guest_name,
        guest_email
    )
VALUES (
        'TRACK-001',
        'pending',
        '123 Main St',
        25.98,
        'John Guest',
        'guest1@example.com'
    ),
    (
        'TRACK-002',
        'paid',
        '456 Oak Ave',
        14.99,
        'Jane Guest',
        'guest2@example.com'
    ),
    (
        'TRACK-003',
        'preparing',
        '789 Pine Ln',
        18.99,
        'Bob Guest',
        'guest3@example.com'
    ),
    (
        'TRACK-004',
        'ready',
        '101 Maple Dr',
        12.99,
        'Alice Guest',
        'guest4@example.com'
    );
-- Seed Data: Order Items
INSERT INTO order_items (menu_item_id, quantity, item_price, order_id)
VALUES (1, 2, 12.99, 1),
    -- 2 Classic Burgers for Order 1
    (2, 1, 14.99, 2),
    -- 1 Cheese Pizza for Order 2
    (3, 1, 18.99, 3),
    -- 1 Salmon for Order 3
    (1, 1, 12.99, 4);
-- 1 Burger for Order 4