#!/usr/bin/env python3
"""
Generate init.sql from food_delivery.yml production data
"""

import yaml

# Read the YAML file - it's a single document with a list
with open('food_delivery.yml', 'r') as f:
    # Load the entire YAML as one document (it's a list)
    all_items = yaml.safe_load(f)

# Separate data by type (based on fields present)
menu_items = []
orders = []
order_items = []
users = []

for item in all_items:
    if item is None:
        continue
    
    # Detect section based on fields
    if 'password_hash' in item:
        users.append(item)
    elif 'menu_item_id' in item and 'order_id' in item:
        order_items.append(item)
    elif 'tracking_id' in item or ('delivery_address' in item and 'total_amount' in item):
        orders.append(item)
    elif 'price' in item and 'name' in item:
        menu_items.append(item)

print(f"Found: {len(users)} users, {len(menu_items)} menu items, {len(orders)} orders, {len(order_items)} order items")

# Generate SQL
sql_output = open('init.sql', 'w')

# Write table definitions
sql_output.write("""CREATE TABLE users (
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
    is_deleted BOOLEAN DEFAULT FALSE,
    category VARCHAR(50)
);
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tracking_id VARCHAR(36) UNIQUE,
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

CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_tracking_id ON orders(tracking_id);
CREATE INDEX idx_driver_assignments_status ON driver_assignments(status);
CREATE INDEX idx_users_email ON users(email);

-- ============================================================================
-- PRODUCTION DATA FROM food_delivery.yml
-- ============================================================================

""")

# Helper function to escape SQL strings
def escape_sql(value):
    if value is None:
        return 'NULL'
    if isinstance(value, (int, float)):
        return str(value)
    if isinstance(value, bool):
        return 'TRUE' if value else 'FALSE'
    # Escape single quotes
    return "'" + str(value).replace("'", "\\'") + "'"

# Write users
sql_output.write("-- Users\n")
sql_output.write("INSERT INTO users (id, name, email, password_hash, role, created_at) VALUES\n")
user_values = []
for user in users:
    values = f"({user['id']}, {escape_sql(user['name'])}, {escape_sql(user['email'])}, {escape_sql(user['password_hash'])}, {escape_sql(user['role'])}, {escape_sql(user['created_at'])})"
    user_values.append(values)
sql_output.write(",\n".join(user_values) + ";\n\n")

# Write menu items
sql_output.write("-- Menu Items\n")
sql_output.write("INSERT INTO menu_items (id, name, description, price, image_url, is_available, category, is_deleted) VALUES\n")
menu_values = []
for item in menu_items:
    is_deleted = 'TRUE' if item.get('is_deleted', 0) == 1 else 'FALSE'
    is_available = 'TRUE' if item.get('is_available', 1) == 1 else 'FALSE'
    values = f"({item['id']}, {escape_sql(item['name'])}, {escape_sql(item.get('description'))}, {item['price']}, {escape_sql(item.get('image_url'))}, {is_available}, {escape_sql(item.get('category'))}, {is_deleted})"
    menu_values.append(values)
sql_output.write(",\n".join(menu_values) + ";\n\n")

# Write orders
sql_output.write("-- Orders\n")
sql_output.write("INSERT INTO orders (id, tracking_id, status, delivery_address, notes, total_amount, created_at, customer_id, guest_name, guest_email, guest_phone, driver_id) VALUES\n")
order_values = []
for order in orders:
    values = f"({order['id']}, {escape_sql(order.get('tracking_id'))}, {escape_sql(order['status'])}, {escape_sql(order['delivery_address'])}, {escape_sql(order.get('notes'))}, {order['total_amount']}, {escape_sql(order['created_at'])}, {escape_sql(order.get('customer_id'))}, {escape_sql(order.get('guest_name'))}, {escape_sql(order.get('guest_email'))}, {escape_sql(order.get('guest_phone'))}, {escape_sql(order.get('driver_id'))})"
    order_values.append(values)
sql_output.write(",\n".join(order_values) + ";\n\n")

# Write order items
sql_output.write("-- Order Items\n")
sql_output.write("INSERT INTO order_items (id, menu_item_id, quantity, item_price, order_id) VALUES\n")
order_item_values = []
for item in order_items:
    values = f"({item['id']}, {item['menu_item_id']}, {item['quantity']}, {item['item_price']}, {item['order_id']})"
    order_item_values.append(values)
sql_output.write(",\n".join(order_item_values) + ";\n")

sql_output.close()
print("✅ Generated init.sql successfully!")
