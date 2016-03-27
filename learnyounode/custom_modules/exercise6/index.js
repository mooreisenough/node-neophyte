/*
	Putting this index.js file in a folder named after the module that I want to import.
	Also putting the folder under node_modules to take advantage of how node resolves dependencies
 */

var fs = require('fs');
var path = require('path');

module.exports = function(directoryPath, fileExtension, callBack) {

    fs.readdir(directoryPath, function(err, fileList) {

        if (err) {

            callBack(err);

        } else {

        	var filteredList = newFilteredArrayOfFileNames(fileList, fileExtension);
            callBack(null, filteredList);
        }
    });

    function newFilteredArrayOfFileNames(someArray, predicate) {

        var xTension = "." + predicate;
        var resultArray = someArray.filter(function(element) {
            return xTension === path.extname(element);
        });

        return resultArray;
    }
};