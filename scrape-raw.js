var cheerio = require('cheerio');
var d3 = require('d3');
var fs = require('fs');
var stringify = require('csv').stringify;

var secScrape = require('./common-sec.js');

var baseURL = 'https://history.state.gov';
var text = `
<ul>
   <li><a href="/departmenthistory/travels/secretary/seward-william-henry">William Henry Seward</a> (1861–1869)</li>
   <li><a href="/departmenthistory/travels/secretary/hay-john-milton">John Milton Hay</a> (1898–1905)</li>
   <li><a href="/departmenthistory/travels/secretary/root-elihu">Elihu Root</a> (1905–1909)</li>
   <li><a href="/departmenthistory/travels/secretary/knox-philander-chase">Philander Chase Knox</a> (1909–1913)</li>
   <li><a href="/departmenthistory/travels/secretary/lansing-robert">Robert Lansing</a> (1915–1920)</li>
   <li><a href="/departmenthistory/travels/secretary/colby-bainbridge">Bainbridge Colby</a> (1920–1921)</li>
   <li><a href="/departmenthistory/travels/secretary/hughes-charles-evans">Charles Evans Hughes</a> (1921–1925)</li>
   <li><a href="/departmenthistory/travels/secretary/kellogg-frank-billings">Frank Billings Kellogg</a> (1925–1929)</li>
   <li><a href="/departmenthistory/travels/secretary/stimson-henry-lewis">Henry Lewis Stimson</a> (1929–1933)</li>
   <li><a href="/departmenthistory/travels/secretary/hull-cordell">Cordell Hull</a> (1933–1944)</li>
   <li><a href="/departmenthistory/travels/secretary/stettinius-edward-reilly">Edward Reilly Stettinius Jr.</a> (1944–1945)</li>
   <li><a href="/departmenthistory/travels/secretary/byrnes-james-francis">James Francis Byrnes</a> (1945–1947)</li>
   <li><a href="/departmenthistory/travels/secretary/marshall-george-catlett">George Catlett Marshall</a> (1947–1949)</li>
   <li><a href="/departmenthistory/travels/secretary/acheson-dean-gooderham">Dean Gooderham Acheson</a> (1949–1953)</li>
   <li><a href="/departmenthistory/travels/secretary/dulles-john-foster">John Foster Dulles</a> (1953–1959)</li>
   <li><a href="/departmenthistory/travels/secretary/herter-christian-archibald">Christian Archibald Herter</a> (1959–1961)</li>
   <li><a href="/departmenthistory/travels/secretary/rusk-david-dean">David Dean Rusk</a> (1961–1969)</li>
   <li><a href="/departmenthistory/travels/secretary/rogers-william-pierce">William Pierce Rogers</a> (1969–1973)</li>
   <li><a href="/departmenthistory/travels/secretary/kissinger-henry-a">Henry A. (Heinz Alfred) Kissinger</a> (1973–1977)</li>
   <li><a href="/departmenthistory/travels/secretary/vance-cyrus-roberts">Cyrus Roberts Vance</a> (1977–1980)</li>
   <li><a href="/departmenthistory/travels/secretary/muskie-edmund-sixtus">Edmund Sixtus Muskie</a> (1980–1981)</li>
   <li><a href="/departmenthistory/travels/secretary/haig-alexander-meigs">Alexander Meigs Haig Jr.</a> (1981–1982)</li>
   <li><a href="/departmenthistory/travels/secretary/shultz-george-pratt">George Pratt Shultz</a> (1982–1989)</li>
   <li><a href="/departmenthistory/travels/secretary/baker-james-addison">James Addison Baker III</a> (1989–1992)</li>
   <li><a href="/departmenthistory/travels/secretary/christopher-warren-minor">Warren Minor Christopher</a> (1993–1997)</li>
   <li><a href="/departmenthistory/travels/secretary/albright-madeleine-korbel">Madeleine Korbel Albright</a> (1997–2001)</li>
   <li><a href="/departmenthistory/travels/secretary/powell-colin-luther">Colin Luther Powell</a> (2001–2005)</li>
   <li><a href="/departmenthistory/travels/secretary/rice-condoleezza">Condoleezza Rice</a> (2005–2009)</li>
   <li><a href="/departmenthistory/travels/secretary/clinton-hillary-rodham">Hillary Rodham Clinton</a> (2009–2013)</li>
   <li><a href="/departmenthistory/travels/secretary/kerry-john-forbes">John Forbes Kerry</a> (2013–)</li>
</ul>
`;


var $ = cheerio.load(text);
var secLinks = $('li a').map(function() { return this.attribs.href });
var secNames = $('li a').map(function() { return $(this).text() });
var secYears = $('li').map(function() { return $(this).text().match(/\(([^)]+)\)/)[1]; });
var q = d3.queue();

var secMetaData = [];
for (var i = 0; i < secLinks.length; ++i) {
  q.defer(d3.request, baseURL + secLinks[i]);
  secMetaData.push([
    'sec-'+i,
    baseURL + secLinks[i],
    secNames[i],
    secYears[i]
  ]);
}
stringify(secMetaData, {columns:['sec_id', 'url', 'name', 'years'], header:true}, function(err, result) {
  fs.writeFileSync("./data/secs.csv", result,'utf8');
});

q.awaitAll(function(err, results) {
  if(!err) {
    var processedData = results.map(processHTML);
    var flat = [];
    processedData.map(function(arr) { flat = flat.concat(arr); })
    secScrape.saveFile(flat);

  } else {
    console.log(err);
  }
});



var processHTML = function(html,i) {
  var secHTML = cheerio.load(html.responseText);
  var locs = secHTML('#content-inner tbody tr')
  var structuredData = [];
  locs.each(function(d) {
    structuredData.push({
      original_country: $(this).find('td').eq(0).text().trim().replace(/\r?\n|\r/g, "").replace(/\s\s+/g, ' '),
      original_city: $(this).find('td').eq(1).text().trim().replace(/\r?\n|\r/g, "").replace(/\s\s+/g, ' '),
      description: $(this).find('td').eq(2).text().trim().replace(/\r?\n|\r/g, "").replace(/\s\s+/g, ' '),
      original_date: $(this).find('td').eq(3).text().trim().replace(/\r?\n|\r/g, "").replace(/\s\s+/g, ' '),
      sec_id: 'sec-'+i,
      sec_name: secHTML('h1').text().trim().replace(/\r?\n|\r/g, "").replace(/\s\s+/g, ' ')
    });
  })
  return structuredData;
};
