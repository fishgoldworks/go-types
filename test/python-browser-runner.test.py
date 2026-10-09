"""Encoding regression for the optional runner; no Playwright dependency needed."""
import contextlib
import io
import json
import locale
from pathlib import Path
import runpy
import subprocess
import sys
from types import ModuleType, SimpleNamespace
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]


class BrowserRunnerEncodingTests(unittest.TestCase):
    def check_locale(self, encoding):
        scripts = []
        arguments = []
        page = SimpleNamespace(
            set_content=lambda html: None,
            add_script_tag=lambda *, content: scripts.append(content),
            evaluate=lambda code, args: arguments.append(args) or {
                'passed': 0, 'failed': 0, 'skipped': 0
            },
        )
        browser = SimpleNamespace(
            version='encoding-fixture', new_page=lambda: page, close=lambda: None
        )
        api = SimpleNamespace(chromium=SimpleNamespace(launch=lambda **options: browser))
        sync_api = ModuleType('playwright.sync_api')
        sync_api.sync_playwright = lambda: contextlib.nullcontext(api)
        expected_source = subprocess.run(
            ['node', str(ROOT / 'scripts/source-test-loader.js')],
            check=True, capture_output=True, text=True, encoding='utf-8',
        ).stdout
        # Simulate a non-UTF-8 locale independently of the host. Explicitly selected
        # encodings still win, for both pathlib files and subprocess stdout.
        with patch.dict(sys.modules, {
            'playwright': ModuleType('playwright'), 'playwright.sync_api': sync_api
        }), patch.object(locale, 'getencoding', return_value=encoding), patch.object(
            io, 'text_encoding', side_effect=lambda selected, *args: selected or encoding
        ), contextlib.redirect_stdout(io.StringIO()):
            runner = runpy.run_path(str(ROOT / 'scripts/test-browser-source.py'))
            self.assertEqual(runner['main'](), 0)
        self.assertTrue(scripts[0] == expected_source, 'Source loader output changed during decoding')
        self.assertTrue(
            scripts[1] == (ROOT / 'test/browser/contract.js').read_text(encoding='utf-8'),
            'Browser contract text changed during decoding',
        )
        self.assertEqual(arguments[0]['names'], json.loads(
            (ROOT / 'scripts/exports.json').read_text(encoding='utf-8')
        ))
        self.assertTrue(
            arguments[0]['metadata'] == json.loads((ROOT / 'scripts/api.json').read_text(encoding='utf-8')),
            'API examples changed during decoding',
        )

    def test_cp1252_locale_preserves_utf8_browser_inputs(self):
        self.check_locale('cp1252')

    def test_utf8_locale_preserves_utf8_browser_inputs(self):
        self.check_locale('utf-8')


if __name__ == '__main__':
    unittest.main()
