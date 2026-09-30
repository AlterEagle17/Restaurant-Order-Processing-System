INSERT INTO restaurant_users (id, username, password_hash, display_name, role, active)
SELECT '10000000-0000-0000-0000-000000000001', 'admin@restaurant.test', '$2a$12$a0eAOem1BmFwL3fg9hsP8.2iry0H8wFZ/WsTX1zL3iQWZoo8uyJbK', 'Alex Morgan', 'ADMIN', TRUE
WHERE NOT EXISTS (SELECT 1 FROM restaurant_users WHERE username = 'admin@restaurant.test');

INSERT INTO restaurant_users (id, username, password_hash, display_name, role, active)
SELECT '10000000-0000-0000-0000-000000000002', 'manager@restaurant.test', '$2a$12$116eqru3MbC2iADmQdMipeNOUntGmEAu8kV7hXc4rzyJYU/UCLx.u', 'Jamie Chen', 'MANAGER', TRUE
WHERE NOT EXISTS (SELECT 1 FROM restaurant_users WHERE username = 'manager@restaurant.test');

INSERT INTO restaurant_users (id, username, password_hash, display_name, role, active)
SELECT '10000000-0000-0000-0000-000000000003', 'cashier@restaurant.test', '$2a$12$c/XdF.SH2NE.ve7ZTtl1V.f9RK6SaP7ty7YZLlu5CIt4XoL5B4qUa', 'Taylor Brooks', 'CASHIER', TRUE
WHERE NOT EXISTS (SELECT 1 FROM restaurant_users WHERE username = 'cashier@restaurant.test');

INSERT INTO restaurant_users (id, username, password_hash, display_name, role, active)
SELECT '10000000-0000-0000-0000-000000000004', 'waiter@restaurant.test', '$2a$12$LmA7ZzzB6OSiYV3M0xK70u7P7C1rc35rbPmEPL/VIi.RLH0CaIoeO', 'Morgan Lee', 'WAITER', TRUE
WHERE NOT EXISTS (SELECT 1 FROM restaurant_users WHERE username = 'waiter@restaurant.test');

INSERT INTO restaurant_users (id, username, password_hash, display_name, role, active)
SELECT '10000000-0000-0000-0000-000000000005', 'kitchen@restaurant.test', '$2a$12$OotetV1UIuztB7eWrwEU5.srCg9aHEHicGLoQiSK..2LqCBIJP0ga', 'Riley Patel', 'KITCHEN_STAFF', TRUE
WHERE NOT EXISTS (SELECT 1 FROM restaurant_users WHERE username = 'kitchen@restaurant.test');

INSERT INTO restaurant_users (id, username, password_hash, display_name, role, active)
SELECT '10000000-0000-0000-0000-000000000006', 'customer@restaurant.test', '$2a$12$FxcEea4S8cT4aPO5HNboW.UaNXauwM35j5F6MkYHfz7dDrUASXYVK', 'Jordan Ellis', 'CUSTOMER', TRUE
WHERE NOT EXISTS (SELECT 1 FROM restaurant_users WHERE username = 'customer@restaurant.test');
