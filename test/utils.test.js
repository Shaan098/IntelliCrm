import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chunkText, splitIntoPages, getAllowedCategories } from '../src/utils.js';

test('chunkText splits text into correct number of chunks', () => {
  const text = 'a'.repeat(2500);
  const chunks = chunkText(text, 1000, 150);
  // 2500 chars, step size 850 (1000-150) -> expect 3 chunks
  assert.equal(chunks.length, 3);
});

test('chunkText respects overlap between consecutive chunks', () => {
  const text = 'abcdefghij'.repeat(200); // 2000 chars
  const chunks = chunkText(text, 1000, 150);
  const endOfFirst = chunks[0].slice(-150);
  const startOfSecondOverlap = chunks[1].slice(0, 150);
  assert.equal(endOfFirst, startOfSecondOverlap);
});

test('chunkText handles text shorter than chunk size', () => {
  const text = 'short text';
  const chunks = chunkText(text, 1000, 150);
  assert.equal(chunks.length, 1);
  assert.equal(chunks[0], text);
});

test('splitIntoPages correctly separates pages using markers', () => {
  const text = 'Page one content\n\n-- 1 of 3 --\n\nPage two content\n\n-- 2 of 3 --\n\nPage three content';
  const pages = splitIntoPages(text);
  assert.equal(pages.length, 3);
  assert.equal(pages[0].pageNumber, 1);
  assert.match(pages[0].text, /Page one content/);
  assert.equal(pages[2].pageNumber, 3);
  assert.match(pages[2].text, /Page three content/);
});

test('splitIntoPages filters out empty pages', () => {
  const text = '\n\n-- 1 of 2 --\n\nReal content here';
  const pages = splitIntoPages(text);
  // the empty first segment before the marker should be filtered out
  assert.equal(pages.length, 1);
  assert.match(pages[0].text, /Real content here/);
});

test('getAllowedCategories returns correct categories for known roles', () => {
  assert.deepEqual(getAllowedCategories('admin'), ['technical', 'hr', 'finance', 'general']);
  assert.deepEqual(getAllowedCategories('hr'), ['hr', 'general']);
  assert.deepEqual(getAllowedCategories('support'), ['technical', 'general']);
});

test('getAllowedCategories defaults to general-only for unknown role', () => {
  assert.deepEqual(getAllowedCategories('nonexistent_role'), ['general']);
});

test('getAllowedCategories defaults to general-only for undefined role', () => {
  assert.deepEqual(getAllowedCategories(undefined), ['general']);
});