var d3 = require('d3');
var fs = require('fs');
var secScrape = require('./common-sec');

data = secScrape.loadCSV();


for (var i = 0; i < data.length; i++) {
  data[i].elapsed_days = d3.timeDay.count(new Date(data[i].start_time_form), new Date(data[i].end_time_form));
  data[i].id = i;
}


secScrape.saveFile(data);
