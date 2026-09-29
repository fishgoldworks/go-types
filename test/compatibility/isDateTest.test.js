"use strict";

const assert = require("node:assert/strict");
const { describe: suite, test } = require("node:test");
const { isDate } = require("../../");

suite("#isDate", function () {

    test("true", function () {
        assert.equal(isDate(new Date()), true);
        assert.equal(isDate(new Date("")), true);
    });

    test("false", function () {
        assert.equal(isDate(), false);
        assert.equal(isDate("2001-01-01T00:00:00.000Z"), false);
        assert.equal(isDate(978307200000), false);
        assert.equal(isDate({}), false);
    });
});