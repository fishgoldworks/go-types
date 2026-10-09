'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ts = require('typescript');
const api = require('./api.json');

// Exercise the same language-service output used for editor hovers and signature help.
// The consumer has an installed package; no paths map back to repository declarations.
module.exports = function testTooltips(consumer) {
  const files = [];
  let hovers = 0,
    signatures = 0;
  for (const extension of ['cts', 'mts']) {
    const file = path.join(consumer, 'tooltips.' + extension);
    const statements = [],
      probes = [];
    for (const item of api) {
      const rootName = 'root_' + item.name,
        focusedName = 'focused_' + item.name;
      statements.push('import { ' + item.name + ' as ' + rootName + " } from 'go-types';");
      statements.push(
        extension === 'cts'
          ? 'import ' + focusedName + " = require('go-types/" + item.name + "');"
          : 'import ' + focusedName + " from 'go-types/" + item.name + "';"
      );
      for (const name of [rootName, focusedName]) {
        const marker = name + '(';
        statements.push(marker + 'undefined);');
        probes.push({ item, marker });
      }
    }
    const text = statements.join('\n') + '\n';
    fs.writeFileSync(file, text);
    files.push(file);
    const options = {
      strict: true,
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.NodeNext,
      moduleResolution: ts.ModuleResolutionKind.NodeNext
    };
    const host = {
      getScriptFileNames: () => [file],
      getScriptVersion: () => '0',
      getScriptSnapshot: (filename) => {
        const source = ts.sys.readFile(filename);
        return source === undefined ? undefined : ts.ScriptSnapshot.fromString(source);
      },
      getCurrentDirectory: () => consumer,
      getCompilationSettings: () => options,
      getDefaultLibFileName: (settings) => ts.getDefaultLibFilePath(settings),
      fileExists: ts.sys.fileExists,
      readFile: ts.sys.readFile,
      readDirectory: ts.sys.readDirectory,
      directoryExists: ts.sys.directoryExists,
      getDirectories: ts.sys.getDirectories,
      realpath: ts.sys.realpath
    };
    const service = ts.createLanguageService(host);
    try {
      assert.deepEqual(
        service.getSemanticDiagnostics(file).map((d) => ts.flattenDiagnosticMessageText(d.messageText, '\n')),
        []
      );
      const prose = (parts) => ts.displayPartsToString(parts).replace(/\s+/g, ' ');
      for (const { item, marker } of probes) {
        const offset = text.indexOf(marker);
        const hover = service.getQuickInfoAtPosition(file, offset + 1);
        assert.ok(
          hover && prose(hover.documentation).includes(item.summary),
          extension + ': hover purpose for ' + marker
        );
        assert.ok(
          hover.tags?.some((tag) => tag.name === 'see' && prose(tag.text).includes('docs/API.md#')),
          extension + ': hover reference for ' + marker
        );
        hovers++;
        const help = service.getSignatureHelpItems(file, offset + marker.length, undefined);
        assert.ok(help && help.items.length, extension + ': signature help for ' + marker);
        for (const signature of help.items) {
          assert.ok(
            prose(signature.documentation).includes(item.summary),
            extension + ': overload purpose for ' + marker
          );
          assert.ok(
            signature.tags?.some((tag) => tag.name === 'returns' && prose(tag.text).includes(item.summaryReturn)),
            extension + ': overload result for ' + marker
          );
          signatures++;
        }
      }
    } finally {
      service.dispose();
    }
  }
  for (const file of files) fs.unlinkSync(file);
  return { apis: api.length, hovers, signatures };
};
