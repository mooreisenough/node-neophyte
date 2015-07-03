/*
   Create a program that prints a list of files in a given directory, filtered by the extension of the files. 
   You will be provided a directory name as the first argument to your program (e.g. '/path/to/dir/') 
   and a file extension to filter by as the second argument.  For example, if you get 'txt' as the second argument 
   then you will need to filter the list to only files that end with .txt. 
   Note that the second argument will not come prefixed with a '.'.
   The list of files should be printed to the console, one file per line. You must use asynchronous I/O.
 */

var fs = require('fs');
var path = require('path');
var directoryPath = process.argv[2];
var fileExtension = process.argv[3];
  
fs.readdir(directoryPath, function(err, fileList) {

	if(err) throw err;
    var filteredArray = fileList.filter(extensionMatches);
    filteredArray.forEach(function(eachElement){

    	console.log(eachElement);
    })

});

function extensionMatches(file){

	var xTension = "." + fileExtension;
	var acutalExtension = path.extname(file);
	return xTension === acutalExtension;
}
