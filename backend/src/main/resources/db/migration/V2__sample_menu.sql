INSERT INTO menu_categories (name, description) VALUES
('Small plates', 'A first bite, made to share'),
('From the kitchen', 'Seasonal mains and house signatures'),
('Something sweet', 'Desserts made in house');
INSERT INTO menu_items (name, description, image_url, price, category_id) VALUES
('Burrata & peaches', 'Creamy burrata, ripe peaches, basil oil, toasted sourdough.', 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&w=900&q=85', 14.00, 1),
('Crispy artichokes', 'Golden artichoke hearts with lemon, parsley and whipped ricotta.', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=85', 11.00, 1),
('Rosemary roast chicken', 'Free-range chicken, pan jus, crispy potatoes and bitter greens.', 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=900&q=85', 26.00, 2),
('Wild mushroom pappardelle', 'Wide ribbons, forest mushrooms, parmesan and fresh thyme.', 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=900&q=85', 23.00, 2),
('Olive oil cake', 'Citrus olive oil cake, seasonal berries and vanilla cream.', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=85', 10.00, 3);