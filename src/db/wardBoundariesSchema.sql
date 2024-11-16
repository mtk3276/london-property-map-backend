CREATE TABLE IF NOT EXISTS wards (
    id SERIAL PRIMARY KEY,
    fid INTEGER,
    wd_cd VARCHAR(10),   -- For RGN23CD, region code
    wd_nm VARCHAR(50),   -- For RGN23NM, region name
    bng_e INTEGER,        -- British National Grid Easting
    bng_n INTEGER,        -- British National Grid Northing
    longitude FLOAT,
    latitude FLOAT,
    shape_area FLOAT,
    shape_length FLOAT,
    global_id UUID UNIQUE,
    geom GEOMETRY(MultiPolygon, 4326) -- Geometry column, WGS84 projection (SRID: 4326)
);
