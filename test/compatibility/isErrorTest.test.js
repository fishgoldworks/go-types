"use strict";

const assert = require("node:assert/strict");
const { describe: suite, test } = require("node:test");
const { isError } = require("../../");

suite("#isError", function () {

    test("true", function () {
        assert.equal(isError(new Error()), true);
    });

    test("false", function () {
        assert.equal(isError(), false);
        assert.equal(isError(undefined), false);
        assert.equal(isError(null), false);
        assert.equal(isError("error"), false);
        assert.equal(isError({message: "error"}), false);
    });
});