ALTER TABLE order_items ADD COLUMN item_name VARCHAR(120);

UPDATE order_items
SET item_name = (SELECT menu_items.name FROM menu_items WHERE menu_items.id = order_items.menu_item_id);

ALTER TABLE order_items ALTER COLUMN item_name SET NOT NULL;