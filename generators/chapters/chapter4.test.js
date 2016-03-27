'use strict';

const assert = require('assert');

describe('Chapter 4: Transpiling', () => {
  /** @import:content/chapter-4-intro.md */
  it('', done => {
    const regenerator = require('regenerator');

    const code = regenerator.compile(`
  const generatorFunction = function*() {
    yield 'Hello, World!';
  };`).code;

    // Given the above simple generator function, regenerator will produce
    // the below code.
    assert.equal(code, `
  var generatorFunction = regeneratorRuntime.mark(function callee$0$0() {
    return regeneratorRuntime.wrap(function callee$0$0$(context$1$0) {
      while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.next = 2;
        return 'Hello, World!';
      case 2:
      case "end":
        return context$1$0.stop();
      }
    }, callee$0$0, this);
  });`);
    // acquit:ignore:start
    done();
    // acquit:ignore:end
  });

  /** @import:content/chapter-4-regenerator.md */
  it('Introducing Regenerator', done => {
    const co = require('co');
    const superagent = require('superagent');

    // `plainFunction` is **not** a generator function because
    // it isn't declared with `function*() {}`. However, it returns
    // an object that qualifies as a generator.
    var plainFunction = function() {
      return {
        // `next()` and `throw()` are the only properties necessary for
        // an object to qualify as a generator.
        next: () => {
          return {
            // Note that this generator's `next()` returns a promise
            value: superagent.get('http://www.google.com'),
            done: true
          };
        },
        // `throw()` doesn't get used in this example
        throw: (error) => { throw error; }
      };
    };

    co(function*() {
      // You can use the fake generator returned by `plainFunction`
      // with co, since it "yields" a promise.
      const res = yield plainFunction();
      // res.text now contains Google's home page HTML!
      // acquit:ignore:start
      assert.ok(res.text);
      done();
      // acquit:ignore:end
    });
  });

  /** @import:content/chapter-4-regenerator-2.md */
  it('', done => {
    const co = require('co');
    const regenerator = require('regenerator');
    const superagent = require('superagent');
    // Necessary to include the `regeneratorRuntime` variable
    // that you use in the below generated code.
    regenerator.runtime();

    // The below code is regenerator's output when it transpiles
    //
    // const generatorFunction = function*() {
    //   return superagent.get('http://www.google.com');
    // };
    var generatorFunction = regeneratorRuntime.mark(function callee$0$0() {
      return regeneratorRuntime.wrap(function callee$0$0$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
        case 0:
          return context$1$0.abrupt("return",
            superagent.get('http://www.google.com'));
        case 1:
        case "end":
          return context$1$0.stop();
        }
      }, callee$0$0, this);
    });

    // 'GeneratorFunction'
    generatorFunction.constructor.name;
    // acquit:ignore:start
    assert.equal(generatorFunction.constructor.name, 'GeneratorFunction');
    // acquit:ignore:end

    co(generatorFunction).then((res) => {
      // res.text contains google's home page!
      // acquit:ignore:start
      assert.ok(res.text);
      done();
      // acquit:ignore:end
    });
  });

  /** @import:content/chapter-4-fake-intro.md */
  it('Faking a Generator Function', done => {
    const co = require('co');
    const superagent = require('superagent');

    // Behaves like the below generator function:
    // const generatorFunction = function*() {
    //   return (yield superagent.get('http://www.google.com')).text;
    // };
    const fakeGeneratorFunction = function() {
      let step = 0;
      const numSteps = 2;
      // This function takes the value that was passed to `next()` and
      // the 'step' that the generator is on.
      const generatorLogic = function(v, step) {
        if (step === 0) return superagent.get('http://www.google.com');
        if (step === 1) return v.text;
      }

      return {
        next: (v) => {
          // For the first n-1 functions, return `done: false`
          if (step < numSteps - 1) {
            return { done: false, value: generatorLogic(v, step++) };
          }
          // For last function, return `done: true`
          // (like a `return` in a generator)
          return { done: true, value: generatorLogic(v, step++) };
        },
        throw: (error) => { throw error; }
      }
    };

    // acquit:ignore:start
    co(function*() {
      const html = yield fakeGeneratorFunction();
      assert.ok(html);
      done();
    });
    // acquit:ignore:end
  });

  /** @import:content/chapter-4-fake-full.md */
  it('', done => {
    // acquit:ignore:start
    const co = require('co');
    const superagent = require('superagent');
    // acquit:ignore:end
    // Behaves like the below generator function:
    // const generatorFunction = function*() {
    //   let res;
    //   try {
    //     res = yield superagent.get('http://notvalid.baddomain');
    //   } catch(err) {
    //     return 'Failed';
    //   }
    //   return res.text;
    // };
    const fakeGeneratorFunction = function() {
      let step = 0;
      let variables = {};
      const result = (value, done) => {
        return { value: value, done: done };
      };
      const url = 'http://nota.baddomain';

      const generatorLogic = function(v, step, error) {
        if (step === 0) return result(superagent.get(url), false);
        // This is the catch block
        if (step === 1 && error) return result('Failed', true);
        if (step === 1) {
          variables['res'] = v;
          return result(variables['res'].text, true);
        }
        if (error) throw error;
      }

      return {
        next: (v) => generatorLogic(v, step++),
        // `throw()` needs to set the error parameter to `next()`
        throw: (error) => generatorLogic(null, step++, error)
      }
    };
    // acquit:ignore:start
    co(function*() {
      const html = yield fakeGeneratorFunction();
      assert.equal(html, 'Failed');
      done();
    }).catch(done);
    // acquit:ignore:end
  });

  /** @import:content/chapter-4-fake-api.md */
  it('', done => {
    // acquit:ignore:start
    const co = require('co');
    const superagent = require('superagent');
    // acquit:ignore:end
    // We'll use 2 functions to convert a regular function into a
    // generator. `generatorResult()` returns an object with the same
    // format that `generator.next()` does.
    const generatorResult = (value, done) => {
      return { value: value, done: done };
    };

    // `GeneratorFunction()` converts a fake generator function that
    // takes the `v` and `step` parameters into something you can pass
    // to `co()`
    const GeneratorFunction = function(fakeGeneratorFunction) {
      let res = () => {
        let step = 0;

        return {
          next: (v) => fakeGeneratorFunction(v, step++),
          throw: (error) => { throw error; }
        }
      };
      // Make the result look like a generator function
      Object.defineProperty(res.constructor, 'name',
        { value: 'GeneratorFunction' });

      // Note that this example returns an actual faked generator
      // function rather than a fake generator like previous examples.
      return res;
    };

    // Here's an example of passing a basic fake generator function
    // to `GeneratorFunction()`
    co(GeneratorFunction(function(v, step) {
      if (step === 0) return generatorResult(
        superagent.get('http://www.google.com'), false);
      return generatorResult(undefined, true);
    }))
    // acquit:ignore:start
    .then(() => done());
    // acquit:ignore:end
  });

  /** @import:content/chapter-4-parsing-intro.md */
  it('Parsing Generators With Esprima', (done) => {
    const esprima = require('esprima');

    const parsed = esprima.parse(`
  const generatorFunction = function*() {
    return 'Hello, World';
  };`).body;

    /* `parsed` is an array that looks like what you see below
    [
      {
        "type": "VariableDeclaration",
        "declarations": [
          {
            "type": "VariableDeclarator",
            "id": { "type": "Identifier", "name": "generatorFunction" },
            "init": {
              "type": "FunctionExpression",
              "params": [],
              "body": {
                "type": "BlockStatement",
                "body": [
                  {
                    "type": "ReturnStatement",
                    "argument": {
                      "type": "Literal",
                      "value": "Hello, World",
                      "raw": "'Hello, World'"
                    }
                  }
                ]
              },
              "generator": true
            }
          }
        ],
        "kind": "const"
      }
    ] */
    // acquit:ignore:start
    done();
    // acquit:ignore:end
  });

  /** @import:content/chapter-4-parsing-2.md */
  it('', () => {
    const esprima = require('esprima');
    const estraverse = require('estraverse');

    const parsed = esprima.parse(`
  const generatorFunction = function*() {
    yield function*() {
      yield 'Hello, World!';
    };
  };`);

    let numGenerators = 0;
    estraverse.traverse(parsed, {
      enter: (node, parent) => {
        if (node.type === 'FunctionExpression' && node.generator) {
          ++numGenerators;
        }
      },
      leave: () => {}
    });
    assert.equal(numGenerators, 2);
  });

  /** @import:content/chapter-4-count-yield.md */
  it('', () => {
    // acquit:ignore:start
    const esprima = require('esprima');
    const estraverse = require('estraverse');
    // acquit:ignore:end
    const parsed = esprima.parse(`
  const generatorFunction = function*() {
    yield function*() {
      yield 'Hello, World!';
    };
    yield 'Hello, World!';
  };`);

    let res = [];
    let stack = [];
    estraverse.traverse(parsed, {
      enter: (node, parent) => {
        if (node.type === 'FunctionExpression' && node.generator) {
          // We've found a new generator function, so add a 0 to the
          // result array and push the index of this generator function's
          // count in the result array onto the stack
          stack.push(res.length);
          res.push(0);
        } else if (node.type === 'YieldExpression') {
          // We've found a yield statement! Increment the current
          // generator function's count.
          ++res[stack[stack.length - 1]];
        }
      },
      leave: (node, parent) => {
        if (node.type === 'FunctionExpression' && node.generator) {
          // We've visited everything within a generator function, so
          // pop its index off the stack
          stack.pop();
        }
      }
    });
    assert.deepEqual(res, [2, 1]);
  });

  /** @import:content/chapter-4-transpiler.md */
  it('Write Your Own Transpiler', () => {
    const esprima = require('esprima');
    const estraverse = require('estraverse');
    // escodegen exposes a `generate()` function that takes
    // an esprima syntax tree and outputs code as a string.
    const escodegen = require('escodegen');

    const parsed = esprima.parse(`
  const variables = [];
  const generatorFunction = function*() {
    variables['res'] = yield superagent.get('http://www.google.com');
    return variables['res'];
  };`);

    estraverse.replace(parsed, {
      enter: (node, parent) => {
        if (node.type === 'FunctionExpression' && node.generator) {
          node.generator = false;
          node.params.push({ type: 'Identifier', name: 'v' });
          node.params.push({ type: 'Identifier', name: 'step' });
          // This property will identify this node as a former
          // generator function
          node._steps = [[]];

          return {
            type: 'CallExpression',
            callee: {
              type: 'Identifier',
              name: 'GeneratorFunction'
            },
            arguments: [node]
          }
        }
      }
    });

    assert.equal(escodegen.generate(parsed), `
const variables = [];
const generatorFunction = GeneratorFunction(function (v, step) {
    variables['res'] = yield superagent.get('http://www.google.com');
    return variables['res'];
});`.trim());
  });

  /** @import:content/chapter-4-transpiler-2.md */
  it('', () => {
    // acquit:ignore:start
    const esprima = require('esprima');
    const estraverse = require('estraverse');
    const escodegen = require('escodegen');
    // acquit:ignore:end
    const parsed = esprima.parse(`
  const variables = [];
  const generatorFunction = function*() {
    variables['res'] = yield superagent.get('http://www.google.com');
    return variables['res'];
  };`);
    // acquit:ignore:start
    estraverse.replace(parsed, {
      enter: (node, parent) => {
        if (node.type === 'FunctionExpression' && node.generator) {
          node.generator = false;
          node.params.push({ type: 'Identifier', name: 'v' });
          node.params.push({ type: 'Identifier', name: 'step' });
          node._steps = [[]];

          return {
            type: 'CallExpression',
            callee: {
              type: 'Identifier',
              name: 'GeneratorFunction'
            },
            arguments: [node]
          }
        }
      },
      leave: (node, parent) => {}
    });
    // acquit:ignore:end
    const FunctionCall = (name, args) => {
      return {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: name
        },
        arguments: args
      };
    };
    const Literal = (value) => {
      return {
        type: 'Literal',
        value: value,
        raw: value.toString()
      };
    };

    estraverse.replace(parsed, {
      enter: (node, parent) => {},
      leave: (node, parent) => {
        const type = node.type;
        if (type === 'YieldExpression' || type === 'ReturnStatement') {
          if (type === 'ReturnStatement') {
            const args = [node.argument, Literal(true)];
            node.argument = FunctionCall('generatorResult', args);
          } else if (type === 'YieldExpression') {
            node.type = 'ReturnStatement';
            node._wasYield = true;
            const args = [node.argument, Literal(false)];
            node.argument = FunctionCall('generatorResult', args);
          }
        }
      }
    });

    const yieldStatement = `superagent.get('http://www.google.com')`;
    assert.equal(escodegen.generate(parsed), `
const variables = [];
const generatorFunction = GeneratorFunction(function (v, step) {
    variables['res'] = return generatorResult(${yieldStatement}, false);;
    return generatorResult(variables['res'], true);
});`.trim());
  });

  /** @import:content/chapter-4-transpiler-3.md */
  it('', () => {
    // acquit:ignore:start
    const esprima = require('esprima');
    const estraverse = require('estraverse');
    const escodegen = require('escodegen');
    // acquit:ignore:end
    const clone = v => JSON.parse(JSON.stringify(v));
    // acquit:ignore:start
    const parsed = esprima.parse(`
  const variables = [];
  const generatorFunction = function*() {
    variables['res'] = yield superagent.get('http://www.google.com');
    return variables['res'];
  };`);
    estraverse.replace(parsed, {
      enter: (node, parent) => {
        if (node.type === 'FunctionExpression' && node.generator) {
          node.generator = false;
          node.params.push({ type: 'Identifier', name: 'v' });
          node.params.push({ type: 'Identifier', name: 'step' });
          node._steps = [[]];

          return {
            type: 'CallExpression',
            callee: {
              type: 'Identifier',
              name: 'GeneratorFunction'
            },
            arguments: [node]
          }
        }
      },
      leave: (node, parent) => {}
    });
    const FunctionCall = (name, args) => {
      return {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: name
        },
        arguments: args
      };
    };
    const Literal = (value) => {
      return {
        type: 'Literal',
        value: value,
        raw: value.toString()
      };
    };

    estraverse.replace(parsed, {
      enter: (node, parent) => {},
      leave: (node, parent) => {
        if (node.type === 'YieldExpression' ||
            node.type === 'ReturnStatement') {
          if (node.type === 'ReturnStatement') {
            node.argument = FunctionCall('generatorResult', [
              node.argument,
              {
                type: 'Literal',
                value: true,
                raw: 'true'
              }
            ]);
          } else if (node.type === 'YieldExpression') {
            node.type = 'ReturnStatement';
            node._wasYield = true;
            node.argument = FunctionCall('generatorResult', [
              node.argument,
              {
                type: 'Literal',
                value: false,
                raw: 'false'
              }
            ]);
          }
        }
      }
    });
    // acquit:ignore:end
    const Identifier = name => ({ type: 'Identifier', name: name });
    const BlockStatement = body => ({ type: 'BlockStatement', body: body });
    const ReturnStatement = v => ({ type: 'ReturnStatement', argument: v });
    const If = (t, c) => ({ type: 'IfStatement', test: t, consequent: c });
    const Test = (l, r) => ({ type: 'BinaryExpression', operator: '===',
      left: l, right: r });
    let stack = [];
    let lastGen = () => stack.length && stack[stack.length - 1];
    estraverse.replace(parsed, {
      enter: (node, parent) => {
        // Keep track of nested generator functions
        if (node._steps) stack.push(node);
        // Put top-level expressions into the `_steps` array
        else if (lastGen() && lastGen().body === parent)
          lastGen()._steps[lastGen()._steps.length - 1].push(node);
      },
      leave: (node, parent) => {
        if (node.type === 'ExpressionStatement' &&
            node.expression.type === 'AssignmentExpression' &&
            node.expression.right._wasYield) {
          // Handle assigning to result of `yield`
          const newNode = clone(node);
          newNode.expression.right = Identifier('v');
          lastGen()._steps[lastGen()._steps.length - 1].push(newNode);
          node.type = 'ReturnStatement';
          node.argument = node.expression.right.argument;
        } else if (node.type === 'FunctionExpression' && node._steps) {
          // Merge all of the steps into if statements
          const newBody = [];
          for (let i = 0; i < node._steps.length - 1; ++i) {
            // Wrap each step in an if statement
            const test = Test(Identifier('step'), Literal(i));
            newBody.push(If(test, BlockStatement(clone(node._steps[i]))));
          }
          const r = [Identifier(undefined), Literal(true)];
          newBody.push(ReturnStatement(FunctionCall('generatorResult', r)));
          node.body.body = newBody;
        } else if (node.type === 'ReturnStatement') {
          // If there's a return, create a new step
          lastGen()._steps.push([]);
        } else if (node._steps) stack.pop();
      }
    });
// acquit:ignore:start
    assert.equal(escodegen.generate(parsed), `
const variables = [];
const generatorFunction = GeneratorFunction(function (v, step) {
    if (step === 0) {
        return generatorResult(superagent.get('http://www.google.com'), false);
    }
    if (step === 1) {
        variables['res'] = v;
        return generatorResult(variables['res'], true);
    }
    return generatorResult(undefined, true);
});`.trim());
// acquit:ignore:end
  });

  /** @import:content/chapter-4-outro.md */
  it('', done => {
    // acquit:ignore:start
    const co = require('co');
    const superagent = require('superagent');
    // acquit:ignore:end
    // Generator Runtime API
    const generatorResult = (v, done) => ({ value: v, done: done });
    const GeneratorFunction = function(fn) {
      let res = () => {
        let step = 0;
        return { next: (v) => fn(v, step++), throw: (e) => { throw e; } };
      };
      Object.defineProperty(res.constructor, 'name',
        { value: 'GeneratorFunction' });
      return res;
    };

    const variables = [];
    co(GeneratorFunction(function (v, step) {
      if (step === 0) {
        return generatorResult(superagent.get('http://www.google.com'),
          false);
      }
      if (step === 1) {
        variables['res'] = v;
        return generatorResult(variables['res'], true);
      }
      return generatorResult(undefined, true);
    })).then((v) => {
      // v contains google home page HTML
      // acquit:ignore:start
      done();
      // acquit:ignore:end
    });
  });
});
