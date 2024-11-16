const db = require("../db/dbConfig");

exports.getLondonLocalAuthorityBoundaries = async (req, res) => {
    const query = `
        SELECT
        fid,
        lad_cd AS "code",
        lad_nm AS "name",
        ST_AsGeoJSON(geom)::json AS geometry
        FROM london_local_authorities;
    `

    db.query(query)
        .then(result => {
            if (result.rows.length > 0) {
                console.log(result.rows);
                res.json(result.rows);
            } else {
                res.status(404).send('Local authority district boundaries not found');
            }
        })
        .catch(err => {
            console.error('Failed to fetch local authority district boundaries data', err.stack);
            res.status(500).send('Server error');
        });
};
