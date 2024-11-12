# Property Map Backend

## Project Description
This application is the backend for a property mapping applicaiton that visualises residential property sale in London in 2023. It uses PostgreSQL to store property data and provides an API to serve data to a frontend Leaflet map. 

## Features
- Parses and stores property data (price, postcode, city, etc.) from a CSV file.
- Utilizes PostgreSQL for data storage.
- Prepares data to be served to a frontend Leaflet map (under development).
 
## Requirements
- Node.js
- PostgreSQL 
- A .csv dataset of property data (available in data/ folder or downloadable)

## Getting Started
1. Set Up PostgreSQL Database
    1. Install PostgreSQL if it's not already installed
    2. Create a new database:
        `psql -U postgres -c "CREATE DATABASE property_map;`
    3. Create the properties table by running the schema:
        `psql -U postgres -d property_map -f src/db/scema.sql`

2. Configure Database Connection
Update src/db/dbConfig.js with your PostgreSQL user credentials.

3. Load CSV Data into Database
Run the CSV reader script to load data into PostgreSQL: 
`node src/utils/csvReader.js`

## Future Development
- Express endpoints to serve property data to the frontend
- Azure setup for deployment of the backend and database

## Acknowledgements
This project uses data frmo the [Price Paid Data (2023)](https://www.gov.uk/government/statistical-data-sets/price-paid-data-downloads#using-or-publishing-our-price-paid-data) published by HM Land Registry, UK Government, available under the [Open Government Licence](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/). 