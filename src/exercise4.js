/*
  Write a program that uses a single asynchronous filesystem operation to read a file 
  and print the number of newlines it contains to the console (stdout), 
  similar to running cat file | wc -l.  The full path to the file to read will be provided 
  as the first command-line argument.
 */

var fs = require('fs');
var filenamePath = process.argv[2];
var contents = fs.readFile(filenamePath, 'utf-8', function(err, data) {

	if(err) throw err;
    var newlines = data.split("\n").length;
    console.log(newlines - 1);

});
