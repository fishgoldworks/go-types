'use strict';
// Exception events are measured separately from timing; no built-ins are replaced.
const inspector = require('node:inspector');
const path = require('node:path');
const root = process.argv[2] && !process.argv[2].startsWith('--') ? path.resolve(process.argv[2]) : path.join(__dirname,'..');
const T = require(root);
const session = new inspector.Session(); session.connect();
let count = 0;
session.on('Debugger.paused', ({params}) => {
    if(params.reason === 'exception') count++;
    session.post('Debugger.resume');
});
let observations;
try {
    session.post('Debugger.enable');
    session.post('Debugger.setPauseOnExceptions',{state:'all'});
    observations = [
        ['isEmpty dictionary',()=>T.isEmpty({})], ['isBlank dictionary',()=>T.isBlank({x:null})],
        ['isEmpty Map',()=>T.isEmpty(new Map())], ['isTypeOf descriptor',()=>T.isTypeOf(1,{predicate:x=>typeof x==='number'})],
        ['isMap object rejection',()=>T.isMap({})], ['isEmpty array',()=>T.isEmpty([])],
        ['isFinite object rejection',()=>T.isFinite({})], ['isInteger object rejection',()=>T.isInteger({})],
        ['isSafeInteger object rejection',()=>T.isSafeInteger({})], ['isNumeric object rejection',()=>T.isNumeric({})]
    ].map(([name,check])=>{count=0;const result=check();return {name,result,exceptions:count};});
} finally {
    session.post('Debugger.setPauseOnExceptions',{state:'none'});
    session.disconnect();
}
console.log(JSON.stringify({node:process.version,observations},null,2));
if(process.argv.includes('--assert-zero') && observations.some(x=>x.exceptions!==0)) process.exitCode=1;
