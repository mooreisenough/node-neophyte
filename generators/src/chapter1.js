/**
 Basic Learning about Generators from the 80-20 guide by Valeri Karpov
 Generator Functions return Generator Objects
 Generator Objects return a single function next()
*/
"use strict";
const generatorFunction = function*() {
    console.log('Hello, World!');
};
console.log(generatorFunction);
console.log(generatorFunction().next());

const generatorFunction2 = function*() { yield 'Hello2, World!'; };
console.log(generatorFunction2().next());

const generatorFunction3 = function*() {
    let message = 'Hello3';
    yield message;
    message += ', World!';
    yield message;
};

console.log(generatorFunction3().next());
console.log(generatorFunction3().next());
console.log(generatorFunction3().next());
//The above will log the Generator Object
//The below is a call to the generator Object next Function();
const testGenerator = generatorFunction3();
console.log(testGenerator.next());
console.log(testGenerator.next());
console.log(testGenerator.next());

const generatorFunction4 = function*() {
    let i = 0;
    while (i < 3) {
        yield i;
        ++i;
    }
};
const testGenerator2 = generatorFunction4();
let x = testGenerator2.next(); // { value: 0, done: false }
setTimeout(() => {
    console.log(testGenerator2.next());
    console.log(testGenerator2.next());
    console.log(testGenerator2.next());
}, 50);

//Calculating Fibonacci
const fibonacciGenerator = function*(n) {
    let back2 = 0;
    let back1 = 1;
    let cur = 1;
    for (let i = 0; i < n - 1; ++i) {
        cur = back2 + back1;
        back2 = back1;
        back1 = cur;
        yield cur;
    }
    return cur;
};

const fibonacci = fibonacciGenerator(10);
let it;
for (it = fibonacci.next(); !it.done; it = fibonacci.next()) {}
console.log(it.value); // 55, the 10th fibonacci number
