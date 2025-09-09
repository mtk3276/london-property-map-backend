const db = require("../db/dbConfig");

exports.getLondonProperties = async (req, res) => {
    db.query("SELECT * FROM properties WHERE city='GREATER LONDON'")
        .then(result => {
            if (result.rows.length > 0) {
                res.json(result.rows);
            } else {
                res.status(404).send('Property not found');
            }
        })
        .catch(err => {
            console.error('Error executing query', err.stack);
            res.status(500).send('Server error');
        });
};
