"use strict";

const assert = require("node:assert/strict");
const { describe: suite, test } = require("node:test");
const { isIterable } = require("../../");

suite("#isIterable", function () {

    test("true", function () {
        assert.equal(isIterable([]), true);
        assert.equal(isIterable([1, 2]), true);
        assert.equal(isIterable(""), true);
        assert.equal(isIterable("abc"), true);

        if (typeof Symbol !== "undefined") {
            assert.equal(isIterable({[Symbol.iterator]: function(){}}), true);
        }
    });

    test("false", function () {
        assert.equal(isIterable(), false);
        assert.equal(isIterable({}), false);
        assert.equal(isIterable({length: 0}), false);
        assert.equal(isIterable(function () {}), false);
        assert.equal(isIterable(undefined), false);
        assert.equal(isIterable(null), false);
        assert.equal(isIterable(false), false);
        assert.equal(isIterable(123), false);
        assert.equal(isIterable(new Number(123)), false);

        if (typeof Symbol !== "undefined") {
            assert.equal(isIterable(Symbol("abc")), false);
        }
    });
});