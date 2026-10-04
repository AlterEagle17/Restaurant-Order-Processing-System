ALTER TABLE restaurant_users ADD COLUMN is_table_account BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE restaurant_users ADD COLUMN table_number INTEGER;
ALTER TABLE restaurant_users ADD CONSTRAINT ck_restaurant_users_table_assignment
    CHECK ((is_table_account = TRUE AND table_number BETWEEN 1 AND 12)
        OR (is_table_account = FALSE AND table_number IS NULL));
CREATE UNIQUE INDEX ux_restaurant_users_table_number ON restaurant_users (table_number);

ALTER TABLE restaurant_orders ADD COLUMN customer_name VARCHAR(120);
UPDATE restaurant_orders
SET customer_name = (SELECT display_name FROM restaurant_users WHERE restaurant_users.id = restaurant_orders.customer_id);
ALTER TABLE restaurant_orders ALTER COLUMN customer_name SET NOT NULL;

INSERT INTO restaurant_users (id, username, password_hash, display_name, role, active, is_table_account, table_number)
SELECT '20000000-0000-0000-0000-000000000001', 'table01', '$2a$12$FxcEea4S8cT4aPO5HNboW.UaNXauwM35j5F6MkYHfz7dDrUASXYVK', 'Table 01', 'CUSTOMER', TRUE, TRUE, 1
WHERE NOT EXISTS (SELECT 1 FROM restaurant_users WHERE username = 'table01');
INSERT INTO restaurant_users (id, username, password_hash, display_name, role, active, is_table_account, table_number)
SELECT '20000000-0000-0000-0000-000000000002', 'table02', '$2a$12$FxcEea4S8cT4aPO5HNboW.UaNXauwM35j5F6MkYHfz7dDrUASXYVK', 'Table 02', 'CUSTOMER', TRUE, TRUE, 2
WHERE NOT EXISTS (SELECT 1 FROM restaurant_users WHERE username = 'table02');
INSERT INTO restaurant_users (id, username, password_hash, display_name, role, active, is_table_account, table_number)
SELECT '20000000-0000-0000-0000-000000000003', 'table03', '$2a$12$FxcEea4S8cT4aPO5HNboW.UaNXauwM35j5F6MkYHfz7dDrUASXYVK', 'Table 03', 'CUSTOMER', TRUE, TRUE, 3
WHERE NOT EXISTS (SELECT 1 FROM restaurant_users WHERE username = 'table03');
INSERT INTO restaurant_users (id, username, password_hash, display_name, role, active, is_table_account, table_number)
SELECT '20000000-0000-0000-0000-000000000004', 'table04', '$2a$12$FxcEea4S8cT4aPO5HNboW.UaNXauwM35j5F6MkYHfz7dDrUASXYVK', 'Table 04', 'CUSTOMER', TRUE, TRUE, 4
WHERE NOT EXISTS (SELECT 1 FROM restaurant_users WHERE username = 'table04');
INSERT INTO restaurant_users (id, username, password_hash, display_name, role, active, is_table_account, table_number)
SELECT '20000000-0000-0000-0000-000000000005', 'table05', '$2a$12$FxcEea4S8cT4aPO5HNboW.UaNXauwM35j5F6MkYHfz7dDrUASXYVK', 'Table 05', 'CUSTOMER', TRUE, TRUE, 5
WHERE NOT EXISTS (SELECT 1 FROM restaurant_users WHERE username = 'table05');
INSERT INTO restaurant_users (id, username, password_hash, display_name, role, active, is_table_account, table_number)
SELECT '20000000-0000-0000-0000-000000000006', 'table06', '$2a$12$FxcEea4S8cT4aPO5HNboW.UaNXauwM35j5F6MkYHfz7dDrUASXYVK', 'Table 06', 'CUSTOMER', TRUE, TRUE, 6
WHERE NOT EXISTS (SELECT 1 FROM restaurant_users WHERE username = 'table06');
INSERT INTO restaurant_users (id, username, password_hash, display_name, role, active, is_table_account, table_number)
SELECT '20000000-0000-0000-0000-000000000007', 'table07', '$2a$12$FxcEea4S8cT4aPO5HNboW.UaNXauwM35j5F6MkYHfz7dDrUASXYVK', 'Table 07', 'CUSTOMER', TRUE, TRUE, 7
WHERE NOT EXISTS (SELECT 1 FROM restaurant_users WHERE username = 'table07');
INSERT INTO restaurant_users (id, username, password_hash, display_name, role, active, is_table_account, table_number)
SELECT '20000000-0000-0000-0000-000000000008', 'table08', '$2a$12$FxcEea4S8cT4aPO5HNboW.UaNXauwM35j5F6MkYHfz7dDrUASXYVK', 'Table 08', 'CUSTOMER', TRUE, TRUE, 8
WHERE NOT EXISTS (SELECT 1 FROM restaurant_users WHERE username = 'table08');
INSERT INTO restaurant_users (id, username, password_hash, display_name, role, active, is_table_account, table_number)
SELECT '20000000-0000-0000-0000-000000000009', 'table09', '$2a$12$FxcEea4S8cT4aPO5HNboW.UaNXauwM35j5F6MkYHfz7dDrUASXYVK', 'Table 09', 'CUSTOMER', TRUE, TRUE, 9
WHERE NOT EXISTS (SELECT 1 FROM restaurant_users WHERE username = 'table09');
INSERT INTO restaurant_users (id, username, password_hash, display_name, role, active, is_table_account, table_number)
SELECT '20000000-0000-0000-0000-000000000010', 'table10', '$2a$12$FxcEea4S8cT4aPO5HNboW.UaNXauwM35j5F6MkYHfz7dDrUASXYVK', 'Table 10', 'CUSTOMER', TRUE, TRUE, 10
WHERE NOT EXISTS (SELECT 1 FROM restaurant_users WHERE username = 'table10');
INSERT INTO restaurant_users (id, username, password_hash, display_name, role, active, is_table_account, table_number)
SELECT '20000000-0000-0000-0000-000000000011', 'table11', '$2a$12$FxcEea4S8cT4aPO5HNboW.UaNXauwM35j5F6MkYHfz7dDrUASXYVK', 'Table 11', 'CUSTOMER', TRUE, TRUE, 11
WHERE NOT EXISTS (SELECT 1 FROM restaurant_users WHERE username = 'table11');
INSERT INTO restaurant_users (id, username, password_hash, display_name, role, active, is_table_account, table_number)
SELECT '20000000-0000-0000-0000-000000000012', 'table12', '$2a$12$FxcEea4S8cT4aPO5HNboW.UaNXauwM35j5F6MkYHfz7dDrUASXYVK', 'Table 12', 'CUSTOMER', TRUE, TRUE, 12
WHERE NOT EXISTS (SELECT 1 FROM restaurant_users WHERE username = 'table12');

UPDATE restaurant_users
SET display_name = 'Table ' || UPPER(SUBSTRING(username FROM 6 FOR 2)),
    role = 'CUSTOMER', active = TRUE, is_table_account = TRUE,
    table_number = CAST(SUBSTRING(username FROM 6 FOR 2) AS INTEGER)
WHERE username IN ('table01', 'table02', 'table03', 'table04', 'table05', 'table06',
    'table07', 'table08', 'table09', 'table10', 'table11', 'table12');

UPDATE restaurant_users
SET display_name = CASE username
    WHEN 'admin@restaurant.test' THEN 'Arun Kumar'
    WHEN 'manager@restaurant.test' THEN 'Meena Raj'
    WHEN 'cashier@restaurant.test' THEN 'Kavitha Devi'
    WHEN 'waiter@restaurant.test' THEN 'Suresh Babu'
    WHEN 'kitchen@restaurant.test' THEN 'Priya Nair'
    WHEN 'customer@restaurant.test' THEN 'Ravi Kumar'
END
WHERE username IN ('admin@restaurant.test', 'manager@restaurant.test', 'cashier@restaurant.test',
    'waiter@restaurant.test', 'kitchen@restaurant.test', 'customer@restaurant.test');

UPDATE menu_items
SET active = FALSE
WHERE LOWER(name) IN ('truffle rigatoni', 'roast chicken', 'seared salmon', 'wild mushroom toast', 'garden salad', 'citrus soda');

INSERT INTO menu_categories (id, name, description, active)
SELECT '30000000-0000-0000-0000-000000000001', 'Tiffin', 'South Indian breakfast and tiffin favorites', TRUE
WHERE NOT EXISTS (SELECT 1 FROM menu_categories WHERE name = 'Tiffin');
INSERT INTO menu_categories (id, name, description, active)
SELECT '30000000-0000-0000-0000-000000000002', 'Snacks', 'Freshly prepared snacks and rolls', TRUE
WHERE NOT EXISTS (SELECT 1 FROM menu_categories WHERE name = 'Snacks');
INSERT INTO menu_categories (id, name, description, active)
SELECT '30000000-0000-0000-0000-000000000003', 'Meals', 'South Indian meals and rice plates', TRUE
WHERE NOT EXISTS (SELECT 1 FROM menu_categories WHERE name = 'Meals');
INSERT INTO menu_categories (id, name, description, active)
SELECT '30000000-0000-0000-0000-000000000004', 'Biryani', 'Fragrant dum and quick-service biryani', TRUE
WHERE NOT EXISTS (SELECT 1 FROM menu_categories WHERE name = 'Biryani');
INSERT INTO menu_categories (id, name, description, active)
SELECT '30000000-0000-0000-0000-000000000005', 'Chicken', 'Spicy chicken favorites', TRUE
WHERE NOT EXISTS (SELECT 1 FROM menu_categories WHERE name = 'Chicken');
INSERT INTO menu_categories (id, name, description, active)
SELECT '30000000-0000-0000-0000-000000000006', 'Drinks', 'Coffee, tea and chilled drinks', TRUE
WHERE NOT EXISTS (SELECT 1 FROM menu_categories WHERE name = 'Drinks');
INSERT INTO menu_categories (id, name, description, active)
SELECT '30000000-0000-0000-0000-000000000007', 'Desserts', 'Traditional Indian sweets', TRUE
WHERE NOT EXISTS (SELECT 1 FROM menu_categories WHERE name = 'Desserts');

INSERT INTO menu_items (id, name, description, category_id, price, image_url, active)
SELECT '40000000-0000-0000-0000-000000000001', 'Idli', 'Soft steamed rice cakes with sambar and chutney', id, 40, 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=900&q=85', TRUE FROM menu_categories WHERE name = 'Tiffin' AND NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Idli');
INSERT INTO menu_items (id, name, description, category_id, price, image_url, active)
SELECT '40000000-0000-0000-0000-000000000002', 'Vada', 'Crisp medu vada served with chutneys', id, 45, 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=900&q=85', TRUE FROM menu_categories WHERE name = 'Tiffin' AND NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Vada');
INSERT INTO menu_items (id, name, description, category_id, price, image_url, active)
SELECT '40000000-0000-0000-0000-000000000003', 'Idli Vada Combo', 'Two idlis and one medu vada with sambar', id, 70, 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=900&q=85', TRUE FROM menu_categories WHERE name = 'Tiffin' AND NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Idli Vada Combo');
INSERT INTO menu_items (id, name, description, category_id, price, image_url, active)
SELECT '40000000-0000-0000-0000-000000000004', 'Masala Dosa', 'Golden dosa with potato masala, sambar and chutney', id, 90, 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=900&q=85', TRUE FROM menu_categories WHERE name = 'Tiffin' AND NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Masala Dosa');
INSERT INTO menu_items (id, name, description, category_id, price, image_url, active)
SELECT '40000000-0000-0000-0000-000000000005', 'Plain Dosa', 'Crisp rice and lentil dosa with chutney', id, 70, 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=900&q=85', TRUE FROM menu_categories WHERE name = 'Tiffin' AND NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Plain Dosa');
INSERT INTO menu_items (id, name, description, category_id, price, image_url, active)
SELECT '40000000-0000-0000-0000-000000000006', 'Ghee Roast Dosa', 'Thin, crisp dosa finished with ghee', id, 110, 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=900&q=85', TRUE FROM menu_categories WHERE name = 'Tiffin' AND NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Ghee Roast Dosa');
INSERT INTO menu_items (id, name, description, category_id, price, image_url, active)
SELECT '40000000-0000-0000-0000-000000000007', 'Onion Dosa', 'Crisp dosa topped with seasoned onions', id, 100, 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=900&q=85', TRUE FROM menu_categories WHERE name = 'Tiffin' AND NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Onion Dosa');
INSERT INTO menu_items (id, name, description, category_id, price, image_url, active)
SELECT '40000000-0000-0000-0000-000000000008', 'Pongal', 'Comforting rice and lentil pongal with pepper and ghee', id, 60, 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=900&q=85', TRUE FROM menu_categories WHERE name = 'Tiffin' AND NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Pongal');
INSERT INTO menu_items (id, name, description, category_id, price, image_url, active)
SELECT '40000000-0000-0000-0000-000000000009', 'Poori Masala', 'Puffed pooris with homestyle potato masala', id, 80, 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=900&q=85', TRUE FROM menu_categories WHERE name = 'Tiffin' AND NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Poori Masala');
INSERT INTO menu_items (id, name, description, category_id, price, image_url, active)
SELECT '40000000-0000-0000-0000-000000000010', 'Samosa', 'Crisp pastry filled with spiced potatoes', id, 30, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=85', TRUE FROM menu_categories WHERE name = 'Snacks' AND NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Samosa');
INSERT INTO menu_items (id, name, description, category_id, price, image_url, active)
SELECT '40000000-0000-0000-0000-000000000011', 'Bajji', 'Seasonal vegetables dipped in spiced gram batter', id, 40, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=85', TRUE FROM menu_categories WHERE name = 'Snacks' AND NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Bajji');
INSERT INTO menu_items (id, name, description, category_id, price, image_url, active)
SELECT '40000000-0000-0000-0000-000000000012', 'Bonda', 'Crisp potato bonda with house chutney', id, 40, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=85', TRUE FROM menu_categories WHERE name = 'Snacks' AND NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Bonda');
INSERT INTO menu_items (id, name, description, category_id, price, image_url, active)
SELECT '40000000-0000-0000-0000-000000000013', 'Paneer Roll', 'Spiced paneer wrapped with onions and chutney', id, 90, 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=900&q=85', TRUE FROM menu_categories WHERE name = 'Snacks' AND NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Paneer Roll');
INSERT INTO menu_items (id, name, description, category_id, price, image_url, active)
SELECT '40000000-0000-0000-0000-000000000014', 'Chicken Roll', 'Pepper chicken, onions and chutney in a soft wrap', id, 110, 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=900&q=85', TRUE FROM menu_categories WHERE name = 'Snacks' AND NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Chicken Roll');
INSERT INTO menu_items (id, name, description, category_id, price, image_url, active)
SELECT '40000000-0000-0000-0000-000000000015', 'South Indian Meals', 'Rice, sambar, rasam, poriyal, curd and pickle', id, 140, 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=85', TRUE FROM menu_categories WHERE name = 'Meals' AND NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'South Indian Meals');
INSERT INTO menu_items (id, name, description, category_id, price, image_url, active)
SELECT '40000000-0000-0000-0000-000000000016', 'Mini Meals', 'A smaller rice plate with sambar and sides', id, 100, 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=85', TRUE FROM menu_categories WHERE name = 'Meals' AND NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Mini Meals');
INSERT INTO menu_items (id, name, description, category_id, price, image_url, active)
SELECT '40000000-0000-0000-0000-000000000017', 'Chicken Biryani', 'Aromatic basmati rice with masala chicken', id, 180, 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=85', TRUE FROM menu_categories WHERE name = 'Biryani' AND NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Chicken Biryani');
INSERT INTO menu_items (id, name, description, category_id, price, image_url, active)
SELECT '40000000-0000-0000-0000-000000000018', 'Egg Biryani', 'Fragrant rice layered with masala and egg', id, 140, 'https://images.unsplash.com/photo-1563379091339-03246963d96c?auto=format&fit=crop&w=900&q=85', TRUE FROM menu_categories WHERE name = 'Biryani' AND NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Egg Biryani');
INSERT INTO menu_items (id, name, description, category_id, price, image_url, active)
SELECT '40000000-0000-0000-0000-000000000019', 'Veg Biryani', 'Vegetable dum biryani with raita', id, 120, 'https://images.unsplash.com/photo-1563379091339-03246963d96c?auto=format&fit=crop&w=900&q=85', TRUE FROM menu_categories WHERE name = 'Biryani' AND NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Veg Biryani');
INSERT INTO menu_items (id, name, description, category_id, price, image_url, active)
SELECT '40000000-0000-0000-0000-000000000020', 'Chicken 65', 'Crisp, spicy chicken bites with curry leaves', id, 150, 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=900&q=85', TRUE FROM menu_categories WHERE name = 'Chicken' AND NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Chicken 65');
INSERT INTO menu_items (id, name, description, category_id, price, image_url, active)
SELECT '40000000-0000-0000-0000-000000000021', 'Pepper Chicken', 'South Indian black pepper chicken fry', id, 180, 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=900&q=85', TRUE FROM menu_categories WHERE name = 'Chicken' AND NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Pepper Chicken');
INSERT INTO menu_items (id, name, description, category_id, price, image_url, active)
SELECT '40000000-0000-0000-0000-000000000022', 'Chicken Fried Rice', 'Wok-tossed rice with chicken, egg and spring onion', id, 150, 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=85', TRUE FROM menu_categories WHERE name = 'Meals' AND NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Chicken Fried Rice');
INSERT INTO menu_items (id, name, description, category_id, price, image_url, active)
SELECT '40000000-0000-0000-0000-000000000023', 'Egg Fried Rice', 'Wok-tossed rice with egg and spring onion', id, 130, 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=85', TRUE FROM menu_categories WHERE name = 'Meals' AND NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Egg Fried Rice');
INSERT INTO menu_items (id, name, description, category_id, price, image_url, active)
SELECT '40000000-0000-0000-0000-000000000024', 'Filter Coffee', 'Fresh decoction with hot milk', id, 35, 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=85', TRUE FROM menu_categories WHERE name = 'Drinks' AND NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Filter Coffee');
INSERT INTO menu_items (id, name, description, category_id, price, image_url, active)
SELECT '40000000-0000-0000-0000-000000000025', 'Tea', 'Freshly brewed Indian tea', id, 20, 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?auto=format&fit=crop&w=900&q=85', TRUE FROM menu_categories WHERE name = 'Drinks' AND NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Tea');
INSERT INTO menu_items (id, name, description, category_id, price, image_url, active)
SELECT '40000000-0000-0000-0000-000000000026', 'Fresh Lime Soda', 'Fresh lime, soda and a pinch of salt', id, 50, 'https://images.unsplash.com/photo-1513558161293-cdaf765edfd7?auto=format&fit=crop&w=900&q=85', TRUE FROM menu_categories WHERE name = 'Drinks' AND NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Fresh Lime Soda');
INSERT INTO menu_items (id, name, description, category_id, price, image_url, active)
SELECT '40000000-0000-0000-0000-000000000027', 'Rose Milk', 'Chilled milk blended with rose syrup', id, 60, 'https://images.unsplash.com/photo-1558857563-b371033873b8?auto=format&fit=crop&w=900&q=85', TRUE FROM menu_categories WHERE name = 'Drinks' AND NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Rose Milk');
INSERT INTO menu_items (id, name, description, category_id, price, image_url, active)
SELECT '40000000-0000-0000-0000-000000000028', 'Badam Milk', 'Chilled milk with almonds and cardamom', id, 70, 'https://images.unsplash.com/photo-1558857563-b371033873b8?auto=format&fit=crop&w=900&q=85', TRUE FROM menu_categories WHERE name = 'Drinks' AND NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Badam Milk');
INSERT INTO menu_items (id, name, description, category_id, price, image_url, active)
SELECT '40000000-0000-0000-0000-000000000029', 'Gulab Jamun', 'Warm milk-solid dumplings in cardamom syrup', id, 50, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=85', TRUE FROM menu_categories WHERE name = 'Desserts' AND NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Gulab Jamun');
INSERT INTO menu_items (id, name, description, category_id, price, image_url, active)
SELECT '40000000-0000-0000-0000-000000000030', 'Kesari', 'Semolina kesari with saffron and cashew', id, 50, 'https://images.unsplash.com/photo-1666190092159-3a565a8e847f?auto=format&fit=crop&w=900&q=85', TRUE FROM menu_categories WHERE name = 'Desserts' AND NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Kesari');
INSERT INTO menu_items (id, name, description, category_id, price, image_url, active)
SELECT '40000000-0000-0000-0000-000000000031', 'Ice Cream', 'Two scoops of seasonal ice cream', id, 60, 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=900&q=85', TRUE FROM menu_categories WHERE name = 'Desserts' AND NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Ice Cream');