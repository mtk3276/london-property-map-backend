const db = require("../db/dbConfig");

exports.getWardsGeoJSON = async (req, res) => {
    const query = `
        SELECT
        fid,
        wd_cd AS "code",
        wd_nm AS "name",
        avg_price_paid as "average_price_paid",
        ST_AsGeoJSON(geom)::json AS geometry
        FROM london_wards;
    `

    db.query(query)
        .then(result => {
            if (result.rows.length > 0) {
                console.log(result.rows);
                res.json(result.rows);
            } else {
                res.status(404).send('Ward boundaries not found');
            }
        })
        .catch(err => {
            console.error('Failed to fetch ward boundaries data', err.stack);
            res.status(500).send('Server error');
        });
};
