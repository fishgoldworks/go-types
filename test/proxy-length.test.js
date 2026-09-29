'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const T=require('..');
for (const length of [-1,0.5,NaN,Infinity,'1',1n,undefined,2**32]) {
    test(`invalid exposed array length: ${String(length)} (${typeof length})`,()=>{
        let memberReads=0;
        const value=new Proxy([], {
            get(target,key,receiver){if(key==='length')return length; return Reflect.get(target,key,receiver);},
            getOwnPropertyDescriptor(target,key){
                if(key==='0'){memberReads++;throw new Error('Array members inspected before validating length');}
                return Reflect.getOwnPropertyDescriptor(target,key);
            }
        });
        assert.throws(()=>T.createTypeChecker(value),TypeError);
        assert.equal(memberReads,0);
        assert.equal(T.isArrayOf(value,'number'),false);
        assert.equal(T.isNonEmptyArray(value),false);
    });
}
test('valid array proxy length is read once by array and matcher operations',()=>{
    for(const [check,values] of [[value=>T.isArrayOf(value,'number'),[1]],[T.isNonEmptyArray,[1]],[value=>T.createTypeChecker(value)(1),['number']]]){
        let reads=0;
        const value=new Proxy(values,{get(target,key,receiver){if(key==='length')reads++;return Reflect.get(target,key,receiver);}});
        assert.equal(check(value),true);assert.equal(reads,1);
    }
});
