# Property Map Backend

## Project Description
This application is the backend for a property mapping application that visualises residential property sale in London in 2023. It uses PostgreSQL to store property data and provides an API to serve data to a frontend Leaflet map. 

## Features
- Parses and stores property data (price, postcode, city, etc.) from a CSV file.
- Utilizes PostgreSQL for data storage.
- Prepares data to be served to a frontend Leaflet map (under development).
 
## Requirements
- Node.js
- PostgreSQL 
- PostGIS
- A .csv dataset of property data (available in data/ folder or downloadable)
- GeoJSON files for UK region boundaries 2023, UK local authority boundaries 2024 and UK ward boundaries 2024 (downloadable from [UK's ONS Open Geography Portal](https://geoportal.statistics.gov.uk/))
- UK wards to local authorities lookup data 2024, as CSV (downloadable from [UK's ONS Open Geography Portal](https://geoportal.statistics.gov.uk/))

## Getting Started
1. Set Up PostgreSQL Database
    1. Install PostgreSQL if it's not already installed
    2. Create a new database:
        `psql -U postgres -c "CREATE DATABASE <database_name>;`
    3. Create the properties table by running the schema:
        `psql -U postgres -d <database_name> -f src/db/scema.sql`

2. Set up environment variables
    1. **Create a .env file** in the root directory of the project. You can either create this file manually or copy from the example template below.
    2. **Add your environment variables** (e.g., database credentials) to the .env file. Here’s an example template for the required variables:
        ```dotenv
        DB_HOST=localhost
        DB_USER=your_db_user
        DB_PASSWORD=your_db_password
        DB_NAME=your_db_name
        ```
    3. **Ensure the `.env` file is ignored by Git**:
       The `.env` file should already be added to the `.gitignore` file, but please double-check that it is listed there to prevent accidental commits.

3. Load CSV Data into Database
Run the price paid CSV reader script to load data for a specific year into PostgreSQL: 
`node src/utils/pricePaidCsvReader.js <file-name> <file-year>`

4. Set up a cron job to run batchGeocode.js every minute until all data rows have been populated with latitudes and longitudes. 
*Please note this process can take a long time as only 10,000 postcodes can be geocoded per minute due to the postcode.io rate limit*
- Ensure environment variables are correctly configured
- Replace path/to for node and project with full paths 
- Create a logs directory in your project
- Once correctly configured, enter the following in a cron tab (open a crontab in terminal using `crontab -e`)
- `* * * * * DB_HOST=<host_name> DB_USER=<user> DB_PASSWORD=<password> DB_NAME=<db_name> /path/to/node /path/to/london-property-map-backend/src/services/batchGeocode.js <tablename> >> /path/to/london-property-map-backend/logs/batchGeocode.log 2>&1`

5. Load GeoJSON data into database
- Add PostGIS extension to the database:
    `psql -U postgres -d <database_name> -c 'CREATE EXTENSION postgis; CREATE EXTENSION postgis_topology;'`
- Run the GeoJSON reader to load data into PostgreSQL:
    `node src/utils/geojsonReader.js`

## Future Development
- Express endpoints to serve property data to the frontend
- Azure setup for deployment of the backend and database

## Acknowledgements
- This project uses data from the [Price Paid Data (2023)](https://www.gov.uk/government/statistical-data-sets/price-paid-data-downloads#using-or-publishing-our-price-paid-data) published by HM Land Registry, UK Government, available under the [Open Government Licence](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/). 
- This project uses [Postcodes.io](https://postcodes.io) for postcode lookup and geocoding, available under the [MIT LICENSE](https://opensource.org/license/mit).
- This project uses GeoJSON data from the [UK's ONS Open Geography Portal](https://geoportal.statistics.gov.uk/), available under the [Open Government Licence](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/). 