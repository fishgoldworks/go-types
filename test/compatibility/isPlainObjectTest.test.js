"use strict";

const assert = require("node:assert/strict");
const { describe: suite, test } = require("node:test");
const { isPlainObject } = require("../../");

suite("#isPlainObject", function () {

    test("true", function () {
        assert.equal(isPlainObject({}), true);
        assert.equal(isPlainObject(new Object()), true);
    });

    test("false", function () {
        assert.equal(isPlainObject(), false);
        assert.equal(isPlainObject(undefined), false);
        assert.equal(isPlainObject(null), false);
        assert.equal(isPlainObject(false), false);
        assert.equal(isPlainObject(0), false);
        assert.equal(isPlainObject(""), false);
        assert.equal(isPlainObject(function () {}), false);
        assert.equal(isPlainObject([]), false);
        assert.equal(isPlainObject(new String("")), false);
    });
});