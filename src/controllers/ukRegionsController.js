const db = require("../db/dbConfig");

exports.getRegionsGeoJSON = async (req, res) => {
    const query = `
        SELECT
        fid,
        rgn_cd AS "code",
        rgn_nm AS "name",
        avg_price_paid as "average_price_paid",
        ST_AsGeoJSON(geom)::json AS geometry
        FROM regions;
    `
    
    db.query(query)
        .then(result => {
            if (result.rows.length > 0) {
                res.json(result.rows);
            } else {
                res.status(404).send('Region boundaries not found');
            }
        })
        .catch(err => {
            console.error('Failed to fetch region boundaries data', err.stack);
            res.status(500).send('Server error');
        });
};
