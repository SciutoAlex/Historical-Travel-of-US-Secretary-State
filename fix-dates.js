var d3 = require('d3');
var fs = require('fs');
var secScrape = require('./common-sec');

data = secScrape.loadCSV();

var singleDayParse = d3.timeParse('%B %e, %Y');
var multiDayParse = d3.timeParse('%B-%e-%Y');


var splitIntoDates = function(string) {
  console.log('---------' + string)
  var singleDate = singleDayParse(string)
  if(!singleDate) {
    var months = string.match(/January|February|March|April|May|June|July|August|September|October|November|December/gi);
    var years = string.match(/\b\d{4}\b/gi);
    var days = string.match(/\b\d{1,2}\b/gi);
    if(!months || !years || !days || days.length !== 2) {
      console.log('error! = ' + string)
    } else {
      var startMonth = months[0];
      var endMonth = months.length > 1 ? months[1] : months[0];
      var startYear = years[0];
      var endYear = years.length > 1 ? years[1] : years[0];
      return [
        multiDayParse(startMonth + "-" + days[0] + "-" + startYear),
        multiDayParse(endMonth + "-" + days[1] + "-" + endYear)
      ];
    }
  } else {
    var nextDay = returnIncrementDate(singleDate, 1);
    return [singleDate,nextDay];
  }
}

var returnIncrementDate = function(dt, days) {
  var newDate = new Date(dt.getTime());
  newDate.setDate(newDate.getDate() + days);
  return newDate;
}

data = data.map(function(el) {
  var formattedDates = splitIntoDates(el.original_date);
  console.log(formattedDates)
  el.start_time = formattedDates[0];
  el.end_time = formattedDates[1];
  el.start_time_form = formattedDates[0].toString();
  el.end_time_form = formattedDates[1].toString();
  el.elapsed_days = d3.timeDay.count(formattedDates[0], formattedDates[1]);
  return el;
});

secScrape.saveFile(data);



// var tests = [
//   "March 3, 1955",
//   "April 23, 2015",
//   "November 6, 1974",
//   "December 31, 1977–January 1, 1978",
//   "January 5–7, 1978",
//   "May 29–June 2, 1988"
// ];
//
// for (var i = 0; i < tests.length; i++) {
//   console.log(splitIntoDates(tests[i]));
// }
