#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
var q = require('q');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URLDEFAULT = "";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var assertUrlExists = function(inurl) {
    var deferred = q.defer();
    rest.head(inurl).on('complete', function(result, response) {
      if (result instanceof Error) {
        console.log("%s does not exist. Exiting.", inurl);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
      } else {
        deferred.resolve(result);
      }
    });
    return inurl;
}

var cheerioHtmlFile = function(htmldata) {
    return cheerio.load(htmldata);
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmldata, checksfile) {
    $ = cheerioHtmlFile(htmldata);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
        .option('-u, --url <url>', 'Url to index.html', clone(assertUrlExists), URLDEFAULT)
        .parse(process.argv);
    if(program.url != "") {
        rest.get(program.url).on('complete', function(result, response) {
          var checkJson = checkHtmlFile(result, program.checks);
          var outJson = JSON.stringify(checkJson, null, 4);
          console.log(outJson);
      });
    } else {
      var checkJson = checkHtmlFile(fs.readFileSync(program.file), program.checks);
      var outJson = JSON.stringify(checkJson, null, 4);
      console.log(outJson);
    }
} else {
    exports.checkHtmlFile = checkHtmlFile;
}