"use strict";

const assert = require("node:assert/strict");
const { describe: suite, test } = require("node:test");
const { isMap } = require("../../");

if (typeof Map !== "undefined") {
    suite("#isMap", function () {

        test("true", function () {
            assert.equal(isMap(new Map()), true);
        });

        test("false", function () {
            assert.equal(isMap(), false);
            assert.equal(isMap(Map), false);
            assert.equal(isMap(undefined), false);
            assert.equal(isMap(null), false);
            assert.equal(isMap({}), false);
            assert.equal(isMap([]), false);
        });
    });
}