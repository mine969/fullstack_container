-- ===========================
-- DROP TABLES (clean reset)
-- ===========================
DROP TABLE IF EXISTS driver_locations CASCADE;
DROP TABLE IF EXISTS driver_assignments CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS users CASCADE;
-- ===========================
-- USERS
-- ===========================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- ===========================
-- MENU ITEMS
-- ===========================
CREATE TABLE menu_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(255),
    is_available BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    category VARCHAR(50)
);
-- ===========================
-- ORDERS
-- ===========================
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    tracking_id VARCHAR(36) UNIQUE,
    status VARCHAR(50) NOT NULL,
    delivery_address VARCHAR(255) NOT NULL,
    notes TEXT,
    total_amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    customer_id INT REFERENCES users(id),
    guest_name VARCHAR(255),
    guest_email VARCHAR(255),
    guest_phone VARCHAR(50),
    driver_id INT REFERENCES users(id)
);
-- ===========================
-- ORDER ITEMS
-- ===========================
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    menu_item_id INT REFERENCES menu_items(id),
    quantity INT NOT NULL,
    item_price DECIMAL(10, 2) NOT NULL,
    order_id INT REFERENCES orders(id)
);
-- ===========================
-- PAYMENTS
-- ===========================
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(id),
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    transaction_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- ===========================
-- DRIVER ASSIGNMENTS
-- ===========================
CREATE TABLE driver_assignments (
    id SERIAL PRIMARY KEY,
    status VARCHAR(50) NOT NULL,
    order_id INT REFERENCES orders(id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    driver_id INT REFERENCES users(id)
);
-- ===========================
-- DRIVER LOCATIONS
-- ===========================
CREATE TABLE driver_locations (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id),
    lat FLOAT NOT NULL,
    lng FLOAT NOT NULL,
    driver_id INT REFERENCES users(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- ===========================
-- INDEXES
-- ===========================
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_tracking_id ON orders(tracking_id);
CREATE INDEX idx_driver_assignments_status ON driver_assignments(status);
CREATE INDEX idx_users_email ON users(email);
-- ===========================
-- INSERT USERS
-- ===========================
INSERT INTO users (id, name, email, password_hash, role, created_at)
VALUES (
        1,
        'John Wick',
        'johnwick123@gmail.com',
        '$2b$12$jNGZk2Wf1kGRrbMfTQKD7.j5pS0VpQLDrNvsasA3nADQQeTuMq.ZG',
        'admin',
        '2025-11-26 13:08:26'
    ),
    (
        13,
        'admin',
        'admin123@gmail.com',
        '$2b$12$V426YzuUo8Xo4VQzgkecCeA3yhWt.a2zgwKdCtrivaH7yQ2xprqSy',
        'admin',
        '2025-12-01 23:51:07'
    ),
    (
        14,
        'Gordon Ramsay',
        'gordonramsay123@gmail.com',
        '$2b$12$a7eBxkKv6y2A1FfbZm6TxOyhVsI0O06rfljNOXAV6w9aEpPoc8NM6',
        'kitchen',
        '2025-12-01 23:52:47'
    ),
    (
        15,
        'Michael Schumacher',
        'michael123@gmail.com',
        '$2b$12$kjB3GYC1rqgH1eo9OAymz.geDwVBsOdpjNWeEn69jYpVvScMvIVsq',
        'driver',
        '2025-12-01 23:53:50'
    );
-- ===========================
-- INSERT MENU ITEMS
-- ===========================
INSERT INTO menu_items (
        id,
        name,
        description,
        price,
        image_url,
        is_available,
        category,
        is_deleted
    )
VALUES (
        1,
        'Classic Burger',
        'Juicy beef patty with lettuce, tomato, and cheese',
        12.99,
        'burger.jpg',
        TRUE,
        'Main',
        TRUE
    ),
    (
        2,
        'Cheese Pizza',
        'Traditional tomato sauce with mozzarella',
        14.99,
        'pizza.jpg',
        TRUE,
        'Main',
        TRUE
    ),
    (
        3,
        'Grilled Salmon',
        'Fresh salmon with asparagus',
        18.99,
        'salmon.jpg',
        TRUE,
        'Main',
        TRUE
    ),
    (
        4,
        'Steak Frites',
        'Ribeye steak with french fries',
        24.99,
        'steak.jpg',
        TRUE,
        'Main',
        TRUE
    ),
    (
        5,
        'Chicken Alfredo',
        'Creamy pasta with grilled chicken',
        19.99,
        '/static/images/2310d455-fb69-4b21-bfac-602bc200eee5.jpg',
        TRUE,
        'Dish',
        FALSE
    ),
    (
        6,
        'Caesar Salad',
        'Romaine lettuce with croutons and parmesan',
        9.99,
        '/static/images/e05989f7-6bee-4b26-94a0-93a1c4153860.jpg',
        TRUE,
        'Side',
        FALSE
    ),
    (
        8,
        'Onion Rings',
        'Battered and fried onion rings',
        5.99,
        '/static/images/6ea47aea-fbd2-4ff0-ac86-3b38622e4b39.jpg',
        TRUE,
        'Side',
        TRUE
    ),
    (
        9,
        'Cola',
        'Refreshing cola drink',
        2.99,
        '/static/images/932b18fe-c444-42d1-8b1f-346df515d5b9.png',
        TRUE,
        'Drink',
        FALSE
    ),
    (
        10,
        'Lemonade',
        'Freshly squeezed lemonade',
        3.99,
        '/static/images/376f92f8-0843-43d3-9674-208959da00f7.jpg',
        TRUE,
        'Drink',
        FALSE
    ),
    (
        17,
        'Order Test Burger',
        NULL,
        10.0,
        NULL,
        TRUE,
        'Main',
        TRUE
    ),
    (
        18,
        'Order Test Burger',
        NULL,
        10.0,
        NULL,
        TRUE,
        'Main',
        TRUE
    ),
    (
        19,
        'Order Test Burger',
        NULL,
        10.0,
        NULL,
        TRUE,
        'Main',
        TRUE
    ),
    (
        20,
        'Order Test Burger',
        NULL,
        10.0,
        NULL,
        TRUE,
        'Main',
        TRUE
    ),
    (
        26,
        'Pepesi',
        'Drink ',
        2.99,
        '/static/images/99722cfc-051f-4386-a64a-e0c2cad769a4.jpg',
        TRUE,
        'Drink',
        FALSE
    ),
    (
        30,
        'Classic Beef Burger',
        'This hamburger patty recipe uses ground beef and an easy bread crumb mixture...',
        19.99,
        '/static/images/28c3c116-4e45-41fe-93fe-a1f6dcbdd480.jpg',
        TRUE,
        'Burger',
        FALSE
    ),
    (
        31,
        'Double Beef Burger',
        'Two 100% beef patties... daily double description',
        29.99,
        '/static/images/f330e185-df5d-4776-8f67-d9c5d042de45.jpg',
        TRUE,
        'Burger',
        FALSE
    ),
    (
        32,
        'Crispy Chicken Burger',
        'Marinated chicken thighs fried crispy...',
        19.99,
        '/static/images/2f061631-649c-4e27-a430-880a1bba190f.jpg',
        TRUE,
        'Burger',
        FALSE
    ),
    (
        33,
        'Grilled chicken burger',
        'Grilled chicken burger description',
        19.99,
        '/static/images/0cf1ef17-36c2-4d41-ad7f-a622cfbfc00f.jpg',
        TRUE,
        'Burger',
        FALSE
    ),
    (
        34,
        'Cheese Lover Burger',
        'Crispy chicken fillet with cheddar cheese...',
        29.99,
        '/static/images/b0ab2615-fb4c-46f4-a197-e3405e66d0b8.jpg',
        TRUE,
        'Burger',
        FALSE
    ),
    (
        35,
        'BBQ Bacon Burger',
        'Burger with barbecue sauce and bacon',
        29.99,
        '/static/images/0de80647-3e3e-4d49-bec9-3cdc0f1abf7f.jpg',
        TRUE,
        'Burger',
        FALSE
    ),
    (
        36,
        'Chicken Tetrazzini',
        'Chicken tetrazzini pasta with creamy cheese',
        19.99,
        '/static/images/8bcb64c6-17d5-43d2-a0d0-5c6039a3e0fd.jpg',
        TRUE,
        'Dish',
        FALSE
    ),
    (
        37,
        'Chicken Florentine Pasta',
        'Instant Pot chicken florentine...',
        19.99,
        '/static/images/0ddd9ee8-3706-40eb-97c7-dfe55dd2a7ab.jpg',
        TRUE,
        'Dish',
        FALSE
    ),
    (
        38,
        'Tuscan Chicken Pasta',
        'Rigatoni pasta with cream, spinach, cheese...',
        19.99,
        '/static/images/c041b5b0-a83d-482a-a65e-3b22cff09112.jpg',
        TRUE,
        'Dish',
        FALSE
    ),
    (
        39,
        '7 UP',
        'lemon-lime drink',
        2.99,
        '/static/images/230795e2-15a0-45b9-b3d5-af37e0874955.jpg',
        TRUE,
        'Drink',
        FALSE
    ),
    (
        40,
        'French Fries',
        'Crispy fries side dish',
        9.99,
        '/static/images/4f02ab92-09fa-4543-ae7a-dd9a3b5e1995.jpg',
        TRUE,
        'Side',
        FALSE
    ),
    (
        41,
        'Curly Fries',
        'Seasoned spiral fries',
        9.99,
        '/static/images/7fe70b22-5a8a-4df3-9c59-e30ba5585707.jpg',
        TRUE,
        'Side',
        FALSE
    ),
    (
        42,
        'Mushroom Melt Burger',
        'Mushroom swiss burger',
        19.99,
        '/static/images/693c26e0-65cc-4d0a-bbdc-b51b9336e0a9.jpg',
        TRUE,
        'Burger',
        FALSE
    );
-- ===========================
-- INSERT ORDERS
-- ===========================
INSERT INTO orders (
        id,
        tracking_id,
        status,
        delivery_address,
        notes,
        total_amount,
        created_at,
        customer_id,
        guest_name,
        guest_email,
        guest_phone,
        driver_id
    )
VALUES (
        1,
        'TRACK-001',
        'delivered',
        '123 Main St',
        NULL,
        25.98,
        '2025-11-26 13:08:26',
        NULL,
        'John Guest',
        'guest1@example.com',
        NULL,
        NULL
    ),
    (
        2,
        'TRACK-002',
        'paid',
        '456 Oak Ave',
        NULL,
        14.99,
        '2025-11-26 13:08:26',
        NULL,
        'Jane Guest',
        'guest2@example.com',
        NULL,
        NULL
    ),
    (
        3,
        'TRACK-003',
        'preparing',
        '789 Pine Ln',
        NULL,
        18.99,
        '2025-11-26 13:08:26',
        NULL,
        'Bob Guest',
        'guest3@example.com',
        NULL,
        NULL
    ),
    (
        4,
        'TRACK-004',
        'assigned',
        '101 Maple Dr',
        NULL,
        12.99,
        '2025-11-26 13:08:26',
        NULL,
        'Alice Guest',
        'guest4@example.com',
        NULL,
        NULL
    ),
    (
        5,
        'TRACK-005',
        'delivered',
        'Kitchen Test Address',
        NULL,
        10.0,
        '2025-11-26 06:33:35',
        NULL,
        'Guest',
        NULL,
        '1234567890',
        NULL
    ),
    (
        6,
        'TRACK-006',
        'delivered',
        'Kitchen Test Address',
        NULL,
        10.0,
        '2025-11-26 06:35:12',
        NULL,
        'Guest',
        NULL,
        '1234567890',
        15
    ),
    (
        7,
        'TRACK-007',
        'delivered',
        'home',
        NULL,
        3.99,
        '2025-11-26 06:40:09',
        NULL,
        'koko',
        'guest@example.com',
        '50',
        15
    ),
    (
        8,
        'TRACK-008',
        'delivered',
        'Kitchen Test Address',
        NULL,
        10.0,
        '2025-11-26 06:41:59',
        NULL,
        'Guest',
        NULL,
        '1234567890',
        15
    ),
    (
        9,
        'TRACK-009',
        'assigned',
        'Kitchen Test Address',
        NULL,
        10.0,
        '2025-11-26 06:42:51',
        NULL,
        'Guest',
        NULL,
        '1234567890',
        NULL
    ),
    (
        10,
        'TRACK-010',
        'delivered',
        '52,680,7 Ek Thaksin 5 Alley,Lak Hak',
        NULL,
        12.99,
        '2025-11-26 07:11:34',
        NULL,
        'Zwe Pyae Aung',
        'guest@example.com',
        '0946416803',
        15
    ),
    (
        11,
        'TRACK-011',
        'delivered',
        'zwe123123',
        NULL,
        27.98,
        '2025-11-26 07:49:01',
        NULL,
        'zwepyae',
        'guest@example.com',
        '0909',
        NULL
    ),
    (
        12,
        'TRACK-012',
        'delivered',
        'zwepyaeaung',
        NULL,
        54.97,
        '2025-11-26 09:09:26',
        NULL,
        'zwe pyae ',
        'guest@example.com',
        '08999',
        NULL
    ),
    (
        13,
        'TRACK-013',
        'assigned',
        '234123',
        NULL,
        52.99,
        '2025-11-26 09:30:42',
        NULL,
        'zwe pyae ',
        'guest@example.com',
        '134123',
        NULL
    ),
    (
        14,
        'TRACK-014',
        'delivered',
        '52,680,7 Ek Thaksin 5 Alley,Lak Hak',
        NULL,
        14.99,
        '2025-11-26 16:43:41',
        NULL,
        'Zwe Pyae Aung',
        'guest@example.com',
        '12312321',
        15
    ),
    (
        15,
        'TRACK-015',
        'delivered',
        '52,680,7 Ek Thaksin 5 Alley,Lak Hak',
        NULL,
        14.99,
        '2025-11-26 16:55:09',
        NULL,
        'Zwe Pyae Aung',
        'guest@example.com',
        '123213',
        NULL
    ),
    (
        16,
        'TRACK-016',
        'assigned',
        '52,680,7 Ek Thaksin 5 Alley,Lak Hak',
        NULL,
        12.99,
        '2025-11-26 20:02:01',
        NULL,
        'Zwe Pyae Aung',
        'guest@example.com',
        '123123',
        NULL
    ),
    (
        17,
        'TRACK-017',
        'delivered',
        'RSU B5',
        NULL,
        99.96,
        '2025-11-27 06:46:58',
        NULL,
        'sayer kaung',
        'guest@example.com',
        '123123123123',
        15
    ),
    (
        18,
        'TRACK-018',
        'delivered',
        '52,680,7 Ek Thaksin 5 Alley,Lak Hak',
        NULL,
        39.98,
        '2025-12-01 17:16:51',
        NULL,
        'Zwe Pyae Aung',
        'guest@example.com',
        '0944412312',
        15
    );
-- ===========================
-- INSERT ORDER ITEMS
-- ===========================
INSERT INTO order_items (id, menu_item_id, quantity, item_price, order_id)
VALUES (1, 1, 2, 12.99, 1),
    (2, 2, 1, 14.99, 2),
    (3, 3, 1, 18.99, 3),
    (4, 1, 1, 12.99, 4),
    (5, 17, 1, 10.0, 5),
    (6, 18, 1, 10.0, 6),
    (7, 10, 1, 3.99, 7),
    (8, 19, 1, 10.0, 8),
    (9, 20, 1, 10.0, 9),
    (10, 1, 1, 12.99, 10),
    (11, 1, 1, 12.99, 11),
    (12, 2, 1, 14.99, 11),
    (13, 2, 1, 14.99, 12),
    (14, 2, 1, 14.99, 12),
    (15, 4, 1, 24.99, 12),
    (16, 26, 1, 50.0, 13),
    (17, 9, 1, 2.99, 13),
    (18, 2, 1, 14.99, 14),
    (19, 2, 1, 14.99, 15),
    (20, 1, 1, 12.99, 16),
    (21, 19, 4, 10.0, 17),
    (22, 2, 4, 14.99, 17),
    (23, 30, 1, 19.99, 18),
    (24, 5, 1, 19.99, 18);
-- ===========================
-- FIX SERIAL SEQUENCES
-- ===========================
SELECT setval(
        pg_get_serial_sequence('users', 'id'),
        (
            SELECT MAX(id)
            FROM users
        )
    );
SELECT setval(
        pg_get_serial_sequence('menu_items', 'id'),
        (
            SELECT MAX(id)
            FROM menu_items
        )
    );
SELECT setval(
        pg_get_serial_sequence('orders', 'id'),
        (
            SELECT MAX(id)
            FROM orders
        )
    );
SELECT setval(
        pg_get_serial_sequence('order_items', 'id'),
        (
            SELECT MAX(id)
            FROM order_items
        )
    );
SELECT setval(
        pg_get_serial_sequence('payments', 'id'),
        (
            SELECT MAX(id)
            FROM payments
        )
    );
SELECT setval(
        pg_get_serial_sequence('driver_assignments', 'id'),
        (
            SELECT MAX(id)
            FROM driver_assignments
        )
    );
SELECT setval(
        pg_get_serial_sequence('driver_locations', 'id'),
        (
            SELECT MAX(id)
            FROM driver_locations
        )
    );