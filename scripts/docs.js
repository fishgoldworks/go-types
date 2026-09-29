'use strict';
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const args=process.argv.slice(2);
if(args.length>1 || (args.length===1 && args[0]!=='--check')) throw Error('Usage: node scripts/docs.js [--check]');
const check=args[0]==='--check';
const outputs=new Map();
const api=require('./api.json');
const sourcePath=require('./source-path.js');
const formatExamples=require('./format-examples.js');
const display=JSON.stringify;
let text='# API reference\n\nAll public functions are available from the root and documented per-function subpaths. Examples assume imports from `go-types`. Conversion behaviour is also summarised in [conversions.md](conversions.md).\n\n';
text+='## Shared contracts\n\nThese checks and the checker factory are not a schema validator or a security boundary. Exceptions from application callbacks, input getters, proxy traps and iteration are not silently swallowed. Non-mutating intrinsic receiver probes catch incompatible-receiver errors deliberately. No checker guarantees that an object\'s methods/prototype have not been replaced.\n\n';
text+='Native identity checks, partial refinements and collection-content checks return `boolean` in TypeScript. A structural interface cannot prove native identity, so a failed check cannot safely exclude that type. Date conversion returns `Date` and does not promise to preserve extra input properties.\n\nFixed primitive names `number`, `string`, `boolean`, `bigint` and `symbol`, and strict null/undefined matchers can narrow. Dynamic names, all unions, predicate descriptors and instance matchers return `boolean`, as do the native typeof names `object`, `function` and `undefined`.\n\nA failed collection check can still leave a typed sparse array; failure must not erase that possibility.\n\n';
for(const item of api){
 text+=`<a id="${item.name.toLowerCase()}"></a>\n\n## ${item.name}(${item.params})\n\n**${item.group}.** ${item.summary}\n\n`;
 if(item.notes)text+=item.notes+'\n\n';
 text+='```js\n'+formatExamples(item.examples.map(x=>`${x.expression}; // => ${display(x.expected)}`).join('\n'))+'\n```\n\n';
}
text+=`## Matcher specification contract\n\n| Specification | Meaning |\n|---|---|\n| A valid typeof name | Exact, case-sensitive typeof comparison; "object" includes null. |\n| A boxed valid type-name string | Same comparison; unboxed intrinsically. |\n| null / undefined | Strict identity; omitted type means undefined. |\n| Function or {instanceOf: Function} | Native instanceof only; no constructor body is invoked. |\n| {predicate: fn} | Synchronous primitive-boolean result; invoked without a descriptor receiver. |\n| Nested arrays | Ordered unions, short-circuited during evaluation after complete validation. |\n| Empty union [] | Matches no value. Empty Of collections still pass valid element constraints. |\n\nUnknown type names, unsupported leaves, cyclic unions, selector accessors/inherited selectors, ambiguous descriptors and non-callable instance hooks throw TypeError.\n\nUnion element accessors are rejected rather than executed. Sparse union positions mean undefined; inherited numeric configuration is ignored. Repeated acyclic subarrays are compiled once per array identity. Pure built-in subunions are compacted without executing application code.\n\nConfiguration inspection can trigger proxy/prototype traps. Custom Symbol.hasInstance methods are not executed until matching and their exceptions propagate.\n\nCallable instance targets are not preflighted for constructibility/prototype validity: native evaluation decides, including for bound functions. A primitive may return false where an object input throws a native TypeError.\n\nMutable constructors, instance hooks and callback closures are not frozen; only the descriptor/union structure is snapshotted. Application callbacks must be synchronous and must not mutate Map/Set inputs. Infinite or very large user-supplied structures have no built-in work budget.\n\nInstances retain native realm/prototype semantics. Use {predicate: isDate} for cross-realm Date branding rather than a local Date instance matcher.\n\nComposite matchers and collection validators return boolean in TypeScript; only fixed exact primitive/null/undefined overloads promise narrowing. Use normal control-flow checks when a dynamic validation result needs further refinement.\n`;
outputs.set(path.join(root,'docs/API.md'),text);
// Refresh source API comments from the same reviewed metadata. Preserve implementation rationale.
for(const item of api){
 const file=path.join(root,sourcePath(item.name));let source=fs.readFileSync(file,'utf8');
 source=source.replace(/\/\*\*[\s\S]*?\*\/\s*/g,'');
 const params=item.params.split(', ').map(x=>` * @param {*} ${x} ${x==='value'?(item.group.includes('conversion')||item.group==='Conversion'?'Value to convert.':'Value to inspect.'):x==='condition'?'Boolean or synchronous boolean predicate.':'Matcher specification.'}`).join('\n');
 const comment='/**\n * '+item.summary+'\n'+(item.notes?item.notes.split('\n').map(line=>' *'+(line?' '+line:'')).join('\n')+'\n':'')+params+'\n * @returns {'+(item.returns || (item.name==='createTypeChecker'?'function':'boolean'))+'}\n'+formatExamples(item.examples.map(x=>x.expression+'; // => '+display(x.expected)).join('\n')).split('\n').map(line=>' * @example '+line).join('\n')+'\n */\n';
 const start=source.indexOf('function '+item.name+'(');
 if(start<0)throw Error('Missing named public function: '+item.name);
 source=source.slice(0,start)+comment+source.slice(start);
 outputs.set(file,source);
}
outputs.set(path.join(root,'README.md'),require('./readme.js')({write:false}));
if(check){
 const stale=[...outputs].filter(([file,text])=>!fs.existsSync(file)||fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n')!==text.replace(/\r\n/g,'\n')).map(([file])=>path.relative(root,file));
 if(stale.length) throw Error('Stale documentation: '+stale.join(', ')+'. Run npm run docs.');
 console.log('Generated documentation is current.');
}else{
 for(const [file,text] of outputs)fs.writeFileSync(file,text);
 console.log(`Generated README, API documentation and source examples for ${api.length} exports.`);
}
