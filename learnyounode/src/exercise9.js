/** HINTS  

 Don't expect these three servers to play nicely! They are not going to  
 give you complete responses in the order you hope, so you can't naively  
 just print the output as you get it because they will be out of order.  
 You will need to queue the results and keep track of how many of the URLs  
 have returned their entire contents. Only once you have them all, you can  
 print the data to the console.  

 Counting callbacks is one of the fundamental ways of managing async in  
 Node. Rather than doing it yourself, you may find it more convenient to  
 rely on a third-party library such as [async](http://npm.im/async) or  
 [after](http://npm.im/after). But for this exercise, try and do it without  
 any external helper library.  
*/

var http = require('http'),
    urlArray = [process.argv[2], process.argv[3], process.argv[4]],
    count = 0;
finalResponse = {};

var logData = function(urlResponse) {
    count++;
    var maxedOut = urlArray.length;

    if (count == maxedOut) {

        for (var x = 0; x <= maxedOut -1; x++)
            console.log(urlResponse[urlArray[x]]);
    }

}

function logTheResponseForEachUrl(url) {

    var simpleRequest = http.get(url, function(response) {

        var responseText = '';
        response.setEncoding('UTF-8');

        response.on('data', function(data) {
            responseText = responseText + data;
        });
        response.on('error', function(e) {
            responseText = responseText + e;
        });

        response.on('end', function() {

            finalResponse[url] = responseText;
            logData(finalResponse);

        });

    });

    simpleRequest.on('error', function(e) {

        logData('Error with Request: ' + e.message);
    });
}

urlArray.forEach(logTheResponseForEachUrl);
