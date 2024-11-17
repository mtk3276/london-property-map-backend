const path = require("path");

// Define all table configurations in a single array
const tableConfigs = [
    {
        name: "regions",
        schemaPath: path.join(__dirname, "../db/regionBoundariesSchema.sql"),
        geojsonPath: path.join(__dirname, "../../data/uk_region_boundaries.geojson"),
        columnNames: "fid, rgn_cd, rgn_nm, bng_e, bng_n, longitude, latitude, shape_area, shape_length, global_id, geom",
        dataColumns: ["FID", "RGN23CD", "RGN23NM", "BNG_E", "BNG_N", "LONG", "LAT", "Shape__Area", "Shape__Length", "GlobalID"]
    },
    {
        name: "local_authorities",
        schemaPath: path.join(__dirname, "../db/localAuthorityBoundariesSchema.sql"),
        geojsonPath: path.join(__dirname, "../../data/uk_local_authority_boundaries_bgc.geojson"),
        columnNames: "fid, lad_cd, lad_nm, bng_e, bng_n, longitude, latitude, shape_area, shape_length, global_id, geom",
        dataColumns: ["FID", "LAD24CD", "LAD24NM", "BNG_E", "BNG_N", "LONG", "LAT", "Shape__Area", "Shape__Length", "GlobalID"]
    },
    {
        name: "wards",
        schemaPath: path.join(__dirname, "../db/wardBoundariesSchema.sql"),
        geojsonPath: path.join(__dirname, "../../data/uk_ward_boundaries_gsc.geojson"),
        columnNames: "fid, wd_cd, wd_nm, bng_e, bng_n, longitude, latitude, shape_area, shape_length, global_id, geom",
        dataColumns: ["FID", "WD24CD", "WD24NM", "BNG_E", "BNG_N", "LONG", "LAT", "Shape__Area", "Shape__Length", "GlobalID"]
    }
];

// Reference-only configuration for lookup tables or additional data
const lookupConfigs = {
    wardsToAuthorities: {
        schemaPath: path.join(__dirname, "../db/wardToAuthoritiesRefSchema.sql"),
        dataPath: path.join(__dirname, "../../data/Ward_to_Local_Authority_District_(May_2024)_Lookup_in_the_UK.csv")
    }
};

module.exports = { tableConfigs, lookupConfigs };
