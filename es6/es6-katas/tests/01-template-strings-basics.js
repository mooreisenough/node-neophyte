// 1: template strings - basics
// To do: make all tests pass

var assert = require("assert");
var jsdom = require("jsdom").jsdom;

var document = jsdom();
document.domain = 'mooreisenough.org';

describe('template string, are wrapped in backticks', function() {

  it('prints x into a string using ${x}', function() {
    var x = 42;
    assert.equal(`x=${x}`, 'x=' + x);
  });

  it('add two numbers inside the ${...}', function() {
    var x = 42;
    var y = 23;
    assert.equal(`${ x + y }`, x+y);
  });

  it('get a function call result inside ${...}', function() {
    function getDomain(){ return document.domain }
    assert.equal(`${ getDomain() }`, 'mooreisenough.org');
  });

});
