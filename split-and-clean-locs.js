var d3 = require('d3');
var fs = require('fs');
var secScrape = require('./common-sec');
var _ = require('lodash');

data = secScrape.loadCSV();

var addedData = []
for (var i = 0; i < data.length; i++) {
  cleanMexico(data[i]);
  moveParenthesis(data[i]);
  var newRows = splitIntoNewRows(data[i]);
  addedData = addedData.concat(newRows);
}

secScrape.saveFile(addedData);

function cleanMexico(row) {
  row.city_modified_for_geo = row.original_city.replace("Mexico, D.F.", "Mexico City");
}

function splitIntoNewRows(row) {
  var isMultiple = row.city_modified_for_geo.match(",");
  if(isMultiple && row.elapsed_days > 1) {
    var rows = generateRows(row);
    return rows;
  } else if(isMultiple && row.elapsed_days == 1) {
    row.city_modified_for_geo = row.city_modified_for_geo.split(',')[0];
    return row;
  } else {
    return row;
  }
}

function generateRows(row) {
    var stops = row.city_modified_for_geo.split(",");
    var rows = [row];
    var timeDiv = d3.scaleLinear()
      .domain([0,stops.length])
      .range([0,row.elapsed_days]);
    var startDate = new Date(row.start_time_form);
    console.log('------------')
    console.log(row.original_city);
    console.log(row.start_time_form);
    console.log(row.end_time_form);
    console.log(row.elapsed_days);
    for (var i = 0; i < stops.length; i++) {
      var newRow = _.cloneDeep(row);
      newRow.split_added = 1;
      newRow.city_modified_for_geo = stops[i].trim();
      newRow.start_time = returnIncrementDate(startDate, timeDiv(i));
      newRow.end_time = returnIncrementDate(startDate, timeDiv(i+1));
      newRow.start_time_form = newRow.start_time.toString();
      newRow.end_time_form = newRow.end_time.toString();
      newRow.elapsed_days = d3.timeDay.count(newRow.start_time, newRow.end_time);
      rows.push(newRow);
      console.log(timeDiv(i));
      console.log(timeDiv(i+1))
      console.log(returnIncrementDate(startDate, timeDiv(i)));
      console.log(returnIncrementDate(startDate, timeDiv(i+1)));
    }
    row.original_line = 1;
    return rows;

}

function returnIncrementDate(dt, days) {
  var newDate = new Date(dt.getTime());
  newDate.setDate(newDate.getDate() + Math.floor(days));
  return newDate;
}

function moveParenthesis(row) {
  var reg = /\(([^)]+)\)/;
  var country = reg.exec(row.city_modified_for_geo);
  row.country_modified_for_geo = country ? country[0] : row.original_country;
  row.city_modified_for_geo = row.city_modified_for_geo.replace(/\(([^)]+)\)/,"").trim();
  row.country_modified_for_geo = row.country_modified_for_geo.replace("(","");
  row.country_modified_for_geo = row.country_modified_for_geo.replace(")","");
}
