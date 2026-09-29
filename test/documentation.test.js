'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const T=require('../');
const api=require('../scripts/api.json');
for(const item of api.filter(x=>x.group!=='DOM')){
 for(const example of item.examples){
  test('documented example: '+example.expression,()=>assert.deepEqual(Function(...Object.keys(T), "return (" + example.expression + ");")(...Object.values(T)),example.expected));
 }
}
test('documentation covers exactly the public API',()=>assert.deepEqual(api.map(x=>x.name).sort(),Object.keys(T).sort()));
