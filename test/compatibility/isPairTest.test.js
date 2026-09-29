"use strict";

const assert = require("node:assert/strict");
const { describe: suite, test } = require("node:test");
const { isPair } = require("../../");

suite("#isPair", function () {

    test("true", function () {
        assert.equal(isPair([null, null]), true);
        assert.equal(isPair([1, 2]), true);
        assert.equal(isPair([{}, {}]), true);
    });

    test("false", function () {
        assert.equal(isPair([]), false);
        assert.equal(isPair([1]), false);
        assert.equal(isPair([1, 2, 3]), false);
        assert.equal(isPair({a: 1, b: 2}), false);
        assert.equal(isPair({a: 1, b: 2, length: 2}), false);
        assert.equal(isPair("ab"), false);
    });
});