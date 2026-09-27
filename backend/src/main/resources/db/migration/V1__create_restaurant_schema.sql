CREATE TABLE restaurant_users (
    id UUID PRIMARY KEY,
    username VARCHAR(80) NOT NULL UNIQUE,
    password_hash VARCHAR(100) NOT NULL,
    display_name VARCHAR(120) NOT NULL,
    role VARCHAR(24) NOT NULL CHECK (role IN ('ADMIN', 'MANAGER', 'CASHIER', 'WAITER', 'KITCHEN_STAFF', 'CUSTOMER')),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE menu_categories (
    id UUID PRIMARY KEY,
    name VARCHAR(80) NOT NULL UNIQUE,
    description VARCHAR(500),
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE menu_items (
    id UUID PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    description VARCHAR(1000),
    category_id UUID NOT NULL REFERENCES menu_categories (id),
    price NUMERIC(12, 2) NOT NULL CHECK (price > 0),
    image_url VARCHAR(1000),
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX ix_menu_items_category_active ON menu_items (category_id, active);

CREATE TABLE restaurant_orders (
    id UUID PRIMARY KEY,
    order_number VARCHAR(40) NOT NULL UNIQUE,
    customer_id UUID NOT NULL REFERENCES restaurant_users (id),
    table_number INTEGER NOT NULL CHECK (table_number BETWEEN 1 AND 200),
    status VARCHAR(20) NOT NULL CHECK (status IN ('RECEIVED', 'PREPARING', 'READY', 'SERVED', 'COMPLETED', 'CANCELLED')),
    payment_status VARCHAR(20) NOT NULL CHECK (payment_status IN ('PENDING', 'PAID', 'FAILED', 'REFUNDED')),
    total NUMERIC(12, 2) NOT NULL CHECK (total >= 0),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX ix_restaurant_orders_status_created ON restaurant_orders (status, created_at);
CREATE INDEX ix_restaurant_orders_customer_created ON restaurant_orders (customer_id, created_at);
CREATE INDEX ix_restaurant_orders_paid_created ON restaurant_orders (payment_status, created_at);

CREATE TABLE order_items (
    id UUID PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES restaurant_orders (id) ON DELETE CASCADE,
    menu_item_id UUID NOT NULL REFERENCES menu_items (id),
    quantity INTEGER NOT NULL CHECK (quantity BETWEEN 1 AND 20),
    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price > 0),
    line_total NUMERIC(12, 2) NOT NULL CHECK (line_total > 0)
);

CREATE INDEX ix_order_items_order ON order_items (order_id);

CREATE TABLE payments (
    id UUID PRIMARY KEY,
    order_id UUID NOT NULL UNIQUE REFERENCES restaurant_orders (id),
    cashier_id UUID NOT NULL REFERENCES restaurant_users (id),
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    status VARCHAR(20) NOT NULL CHECK (status IN ('PENDING', 'PAID', 'FAILED', 'REFUNDED')),
    method VARCHAR(20) NOT NULL CHECK (method IN ('CASH', 'CARD')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX ix_payments_created ON payments (created_at);