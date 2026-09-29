'use strict';
// Test-only CommonJS loader for browser source tests. This is not a production bundler.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname,'..');
function sourceTestLoader() {
    const files = ['index.js'];
    function collect(directory) {
        for (const entry of fs.readdirSync(path.join(root,directory), {withFileTypes:true})) {
            const name = directory + '/' + entry.name;
            if (entry.isDirectory()) collect(name);
            else if (name.endsWith('.js')) files.push(name);
        }
    }
    collect('src');
    const modules = files.map(name => `${JSON.stringify('/'+name)}: function(module,exports,require) {\n${fs.readFileSync(path.join(root,name),'utf8')}\n}`).join(',\n');
    return `(function(){
        const modules = {${modules}};
        const cache = Object.create(null);
        function load(name) {
            if (cache[name]) return cache[name].exports;
            if (!modules[name]) throw new Error('Missing test module ' + name);
            const module = {exports:{}}; cache[name] = module;
            modules[name](module,module.exports,function(request) {
                if (!request.startsWith('.')) throw new Error('External test dependency ' + request);
                const parts = name.split('/'); parts.pop();
                for (const part of request.split('/')) {
                    if (part === '..') parts.pop();
                    else if (part !== '.') parts.push(part);
                }
                let target = parts.join('/');
                if (!target.endsWith('.js')) target += '.js';
                return load(target);
            });
            return module.exports;
        }
        globalThis.Types = load('/index.js');
    })();`;
}
module.exports = sourceTestLoader;
if (require.main === module) process.stdout.write(sourceTestLoader());
