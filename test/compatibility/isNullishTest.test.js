"use strict";

const assert = require("node:assert/strict");
const { describe: suite, test } = require("node:test");
const { isNullish } = require("../../");


suite("#isNullish", function () {

    test("nullish", function () {
        assert.equal(isNullish(), true);
        assert.equal(isNullish(undefined), true);
        assert.equal(isNullish(null), true);
    });

    test("not nullish", function () {
        assert.equal(isNullish(0), false);
        assert.equal(isNullish(NaN), false);
        assert.equal(isNullish(false), false);
        assert.equal(isNullish(""), false);
        assert.equal(isNullish({}), false);
        assert.equal(isNullish([]), false);
        assert.equal(isNullish(function () {}), false);
    });
});