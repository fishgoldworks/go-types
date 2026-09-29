"use strict";

const assert = require("node:assert/strict");
const { describe: suite, test } = require("node:test");
const { isEmpty } = require("../../");

suite("#isEmpty", function () {

    test("empty", function () {
        assert.equal(isEmpty(), true);
        assert.equal(isEmpty(undefined), true);
        assert.equal(isEmpty(null), true);
        assert.equal(isEmpty(""), true);
        assert.equal(isEmpty([]), true);
        assert.equal(isEmpty({}), true);
        assert.equal(isEmpty(new Set()), true);
    });

    test("not empty", function () {
        assert.equal(isEmpty(0), false);
        assert.equal(isEmpty(NaN), false);
        assert.equal(isEmpty(" "), false);
        assert.equal(isEmpty([undefined]), false);
        assert.equal(isEmpty([null]), false);
        assert.equal(isEmpty([""]), false);
        assert.equal(isEmpty({"": undefined}), false);
        assert.equal(isEmpty({"": null}), false);
        assert.equal(isEmpty({"": ""}), false);
        assert.equal(isEmpty(new Set([undefined])), false);
    });
});