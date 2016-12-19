var NodeGeocoder = require('node-geocoder');
var secScrape = require('./common-sec');
var d3 = require('d3');

data = secScrape.loadCSV();

loc_cache = generateCache(data);

var lim = 200;

var options = {
  provider: 'google',
  apiKey: ''
};

var geocoder = NodeGeocoder(options);

var geoc = function(loc, index, cb) {
  var searchString = secScrape.generateSearchForGoogle(loc);
  if(loc_cache[searchString]) {
    console.log('found cached! ' + searchString)
    cb(null, [loc_cache[searchString], index])
  } else {
    geocoder.geocode(searchString, function(err, res) {
      console.log('searching: ' + searchString)
      if(!err && res.length > 0) {
        var result = {
          glat: res[0].latitude,
          glon: res[0].longitude,
          gcity: res[0].city,
          gcountry: res[0].country,
          isGeocoded: true
        }
        cb(null, [result, index]);
      } else {
        var result = {
          glat: "",
          glon: "",
          gcity: "",
          gcountry: "",
          isGeocoded: false
        }
        console.log('ERROR!' + searchString);
        console.log(err);
        cb(null, [result, index]);
      }
    });
  }
};

var q = d3.queue(4);


for (var i = 0; i < data.length; ++i) {
  if(data[i].isGeocoded != true && data[i].original_line != 1) {
    q.defer(geoc, data[i], i);
    lim--;
  }
  if(lim == 0) { break; }
}

q.awaitAll(function(err, results) {
  if(!err) {
    results.map(function(r,i) {
      var match = data[r[1]];
      match.glat = r[0].glat;
      match.glon = r[0].glon;
      match.gcity = r[0].gcity;
      match.gcountry = r[0].gcountry;
      match.isGeocoded = r[0].isGeocoded;
    })
    secScrape.saveFile(data);

  } else {
    console.log(err);
  }
});

function generateCache(data) {
  var cache = {};
  for (var i = 0; i < data.length; i++) {
    if(data[i].glat) {
      cache[secScrape.generateSearchForGoogle(data[i])] = {
        glat: data[i].glat,
        glon: data[i].glon,
        gcity: data[i].gcity,
        gcountry:data[i].gcountry,
        isGeocoded: true
      }
    }
  }
  return cache;
}
