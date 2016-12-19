var stringify = require('csv').stringify;
var fs = require('fs');
var d3 = require('d3');

var secs = {};

secs.fileName = "./data/destinations.csv";

secs.columnNames = [
  'original_country',
  'original_city',
  'original_date',
  'description',
  'country_modified_for_geo',
  'city_modified_for_geo',
  'date',
  'sec_id',
  'sec_name',
  'id',
  'glat',
  'glon',
  'gcity',
  'gcountry',
  'isGeocoded',
  'split_added',
  'original_line',
  'start_time',
  'end_time',
  'start_time_form',
  'end_time_form',
  'elapsed_days'
];


secs.oddNames = {
  "Ramallah, Palestinian Authority" : "Ramallah",
  "High Rock, Jamaica" : "Jamaica",
  "Pula, Yugoslavia": "Pula, Croatia",
  "Dubrovnik, Yugoslavia" : "Dubrovnik, Croatia",
  "Marsaxlokk Bay, Malta" : "Malta",
  "Aruba, Netherlands Antilles" : "Aruba",
  "East Berlin, German Democratic Republic" : "Berlin",
  "Radonezsh, U.S.S.R." : "Radonezsh",
  "Gaza, Palestinian Authority" : "Gaza",
  "Bethlehem, Palestinian Authority" : "Bethlehem",
  "Pristina, Serbia-Montenegro Kosovo" : "Pristina, Kosovo",
  "Cheju Island, Korea, Republic of" : "Cheju Island",
  "Salisbury, Southern Rhodesia Zimbabwe" : "Harare, Zimbabwe",
  "Panmunjon, Korea, Republic of" : "Panmunjon, Korea",
  "Angkor Wat, Cambodia" : "Cambodia"
}

secs.generateSearchForGoogle = function(row) {

  var city = row.city_modified_for_geo ? row.city_modified_for_geo : row.original_city;
  var country = row.country_modified_for_geo ? row.country_modified_for_geo : row.original_country;
  var key = city+ ", " + country;
  if (key in secs.oddNames) {
    key = secs.oddNames[key]
  }
  return key;
}


secs.loadCSV = function() {
  return d3.csvParse(fs.readFileSync(secs.fileName, 'utf8'))
};

secs.saveFile = function(obj, cb) {
  stringify(obj, {header:true, columns:secs.columnNames}, function(err, output){
    fs.writeFileSync(secs.fileName,output,'utf8');
    if(cb) {
      cb(err, null);
    }

  });
};

module.exports = secs;
