US Secretary Of State Travel Data
==================================

The US Secretary of State's website publishes an [overview](https://history.state.gov/departmenthistory/travels/secretary) of the official international travel of the Secretary of State. This data goes back continuously to 1905. Unfortunately the data is only available as a series of webpages and individual rows may contain multiple cities.

This repository contains a single CSV file of this data. It also includes the Node.js scripts used to process the data. Hopefully this data is useful visualization proejcts, statistical analyses, and other uses for geographic, time-based, historical data.

The Dataset
-----------
/data/destinations.csv
- `original_country`: text string identifying country scraped from Secretary Of State website
- `original_city`: text string identifying city scraped from Secretary Of State website.
- `original_date`: text string identifying date interval scraped from Secretary Of State website.
- `description`: text string describing the Secretary's travel arrangement.
- `country_modified_for_geo`: text string based on original but modified for geocoding.
- `city_modified_for_geo`: text string based on original but modified for geocoding.
- `date`: unused should remove
- `sec_id`: text string identifying the Secretary of State
- `sec_name`: text string of Secretary's name
- `id`: chronological integer of destinations
- `glat`: latitude of location from Google
- `glon`: longitude of location from Google
- `gcity`: text string of what Google identifies as the city of the destination
- `gcountry`: text string of what Google identifies as the country of the destination
- `isGeocoded`: binary note that the destination was geocoded
- `split_added`: binary note that the entry was interpolated from a single Secretary of State entry. 
- `original_line`: binary note that the entry generated multiple destinations, which have `split_added` as `true`
- `start_time`: start time of the destination in milliseconds since epoch.
- `end_time`: end time of the destination in milliseconds since epoch.
- `start_time_form`: start time of the destination in UTC format.
- `end_time_form`: end time of the destination in UTC format.
- `elapsed_days`: number of days at the destination

/data/secretaries.csv
- `sec_id`: id of secretary. Same as in `/data/destinations.csv`
- `url`: url of the page where destination data was scraped
- `name`: full name of Secretary
- `years`: years the Secretary served


Generating Data
---------------
The dataset can be regenerated using four Node.js scripts
1. `scrape-raw.js`: Pull in initial data and generate `secretaries.csv`
2. `fix-dates.js`: Transform the date/interval text string to structured form
3. 
