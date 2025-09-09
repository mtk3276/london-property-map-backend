const db = require("../db/dbConfig");

exports.getWardsGeoJSON = async (req, res) => {
    try {
        // Query 1: Get Bin Ranges (Min and Max for each bin) for Below and Above £1 Million
        const binQuery = `
        -- Bins for wards with averages below £1 million
        WITH below_1m_bins AS (
            WITH price_range AS (
                SELECT 
                    MIN(avg_price_paid) AS min_price, 
                    MAX(avg_price_paid) AS max_price
                FROM london_wards
                WHERE avg_price_paid < 1000000
            )
            SELECT
                price_bin,
                pr.min_price + (pr.max_price - pr.min_price) * (price_bin - 1) / 4 AS bin_min,
                pr.min_price + (pr.max_price - pr.min_price) * price_bin / 4 AS bin_max
            FROM generate_series(1, 4) AS price_bin -- Bins 1 to 4 for below 1 million
            CROSS JOIN price_range pr
        ),
        -- Bins for wards with averages above £1 million
        above_1m_bins AS (
            WITH price_range AS (
                SELECT 
                    MIN(avg_price_paid) AS min_price, 
                    MAX(avg_price_paid) AS max_price
                FROM london_wards
                WHERE avg_price_paid >= 1000000
            )
            SELECT
                price_bin + 5 AS price_bin, -- Bins 6 to 10 for above 1 million
                pr.min_price + (pr.max_price - pr.min_price) * (price_bin - 1) / 4 AS bin_min,
                pr.min_price + (pr.max_price - pr.min_price) * price_bin / 4 AS bin_max
            FROM generate_series(1, 4) AS price_bin -- Bins 5 to 8 for above 1 million
            CROSS JOIN price_range pr
        )
        -- Combine both sets of bins
        SELECT price_bin, bin_min, bin_max
        FROM below_1m_bins
        UNION ALL
        SELECT price_bin, bin_min, bin_max
        FROM above_1m_bins
        ORDER BY price_bin;
        `;
        
        const binResult = await db.query(binQuery);

        // Query 2: Get Wards with Average Price, Bin Number, and Geometry
        const wardsQuery = `
        -- Get Wards with Price and Bin Calculations
        WITH below_1m_bins AS (
            WITH price_range AS (
                SELECT 
                    MIN(avg_price_paid) AS min_price, 
                    MAX(avg_price_paid) AS max_price
                FROM london_wards
                WHERE avg_price_paid < 1000000
            )
            SELECT
                lw.id,
                lw.wd_nm AS "name",
                AVG(lw.avg_price_paid) AS average_price_paid,
                lw.transaction_count,
                ST_AsGeoJSON(lw.geom)::json AS geometry,
                CEIL(
                    ((AVG(lw.avg_price_paid) - pr.min_price) / (pr.max_price - pr.min_price)) * 4
                ) + 1 AS price_bin -- Bins 1 to 4 for below £1 million
            FROM london_wards lw
            CROSS JOIN price_range pr
            WHERE lw.avg_price_paid < 1000000
            GROUP BY lw.id, lw.wd_nm, lw.transaction_count, lw.geom, pr.min_price, pr.max_price
        ),
        above_1m_bins AS (
            WITH price_range AS (
                SELECT 
                    MIN(avg_price_paid) AS min_price, 
                    MAX(avg_price_paid) AS max_price
                FROM london_wards
                WHERE avg_price_paid >= 1000000
            )
            SELECT
                lw.id,
                lw.wd_nm AS "name",
                AVG(lw.avg_price_paid) AS average_price_paid,
                lw.transaction_count,
                ST_AsGeoJSON(lw.geom)::json AS geometry,
                CEIL(
                    ((AVG(lw.avg_price_paid) - pr.min_price) / (pr.max_price - pr.min_price)) * 4
                ) + 5 AS price_bin -- Bins 6 to 10 for above £1 million
            FROM london_wards lw
            CROSS JOIN price_range pr
            WHERE lw.avg_price_paid >= 1000000
            GROUP BY lw.id, lw.wd_nm, lw.geom, lw.transaction_count, pr.min_price, pr.max_price
        )
        -- Combine both sets of bins
        SELECT 
            lw.id,
            lw."name",
            lw.average_price_paid,
            lw.price_bin,
            lw.transaction_count,
            lw.geometry
        FROM below_1m_bins lw
        UNION ALL
        SELECT 
            lw.id,
            lw."name",
            lw.average_price_paid,
            lw.price_bin,
            lw.transaction_count,
            lw.geometry
        FROM above_1m_bins lw
        ORDER BY price_bin;
        `;

        const wardsResult = await db.query(wardsQuery);

        // Respond with both results
        res.json({
            bins: binResult.rows,
            wards: wardsResult.rows
        });

    } catch (err) {
        console.error('Failed to fetch ward boundaries data', err.stack);
        res.status(500).send('Server error');
    }
};
