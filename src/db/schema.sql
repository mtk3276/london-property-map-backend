CREATE TABLE IF NOT EXISTS properties (
    id SERIAL PRIMARY KEY,
    price_paid NUMERIC(15, 2) NOT NULL,
    postcode VARCHAR(10) NOT NULL,
    city VARCHAR(255) NOT NULL,
    latitude NUMERIC(9, 6),
    longitude NUMERIC(9, 6)
);
