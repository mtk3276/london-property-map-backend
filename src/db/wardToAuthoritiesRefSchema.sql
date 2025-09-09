CREATE TABLE IF NOT EXISTS london_ward_ref (
    WD24CD VARCHAR(10) NOT NULL, -- Ward Code
    WD24NM VARCHAR(255),         -- Ward Name
    WD24NMW VARCHAR(255),        -- (Optional) Welsh Ward Name, nullable
    LAD24CD VARCHAR(10) NOT NULL, -- Local Authority Code
    LAD24NM VARCHAR(255),         -- Local Authority Name
    LAD24NMW VARCHAR(255),        -- (Optional) Welsh Local Authority Name, nullable
    ObjectId INTEGER PRIMARY KEY  -- Unique Object ID
);
