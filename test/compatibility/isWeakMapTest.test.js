"use strict";

const assert = require("node:assert/strict");
const { describe: suite, test } = require("node:test");
const { isWeakMap } = require("../../");

if (typeof WeakMap !== "undefined") {
    suite("#isWeakMap", function () {

        test("true", function () {
            assert.equal(isWeakMap(new WeakMap()), true);
        });

        test("false", function () {
            assert.equal(isWeakMap(), false);
            assert.equal(isWeakMap(WeakMap), false);
            assert.equal(isWeakMap(undefined), false);
            assert.equal(isWeakMap(null), false);
            assert.equal(isWeakMap({}), false);
            assert.equal(isWeakMap([]), false);
        });
    });
}