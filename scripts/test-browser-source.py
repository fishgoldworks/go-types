"""Optional source-only browser verification with Python Playwright.

This does not build or test production bundles. The normal release command uses
scripts/test-browser.js and the pinned JavaScript development dependencies.
"""
from __future__ import annotations
import json
import os
import shutil
import subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright


def main() -> int:
    root = Path(__file__).resolve().parents[1]
    node = shutil.which('node')
    if node is None:
        raise RuntimeError('Node.js is required to load the source modules.')
    source = subprocess.run(
        [node, str(root / 'scripts/source-test-loader.js')],
        check=True, capture_output=True, text=True, encoding='utf-8', timeout=30,
    ).stdout
    executable = os.environ.get('CHROMIUM_EXECUTABLE') or shutil.which('chromium')
    options = {'executable_path': executable} if executable else {}
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(**options)
        try:
            page = browser.new_page()
            # An inline document requires neither a network listener nor a page server.
            # SharedArrayBuffer may be unavailable without cross-origin isolation.
            page.set_content('<!doctype html><html><body></body></html>')
            page.add_script_tag(content=source)
            page.add_script_tag(content=(root / 'test/browser/contract.js').read_text(encoding='utf-8'))
            result = page.evaluate(
                '({metadata,names})=>runGoTypesBrowserTests(Types,metadata,names)',
                {'metadata': json.loads((root / 'scripts/api.json').read_text(encoding='utf-8')),
                 'names': json.loads((root / 'scripts/exports.json').read_text(encoding='utf-8'))},
            )
            report = {
                'browser': browser.version,
                'driver': 'Python Playwright (source-only)',
                'sourceOnly': True,
                'pageSetup': 'Inline about:blank fixture; not cross-origin isolated',
                'results': [{'mode': 'source', **result}],
            }
        finally:
            browser.close()
    print(json.dumps(report, indent=2))
    return int(bool(result['failed']))


if __name__ == '__main__':
    raise SystemExit(main())
