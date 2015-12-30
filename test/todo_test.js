'use strict'

const test = require('tape')

test('todo: v0.3', (t) => {
  t.ok(1, 'most things')
  t.ok(1, '.set')
  t.ok(1, '.del')
  t.ok(1, '.extend')
  t.ok(1, 'extensions')
  t.ok(1, '.sortBy')
  t.ok(1, '.get() no args')
  t.ok(1, 'dot notation')
  t.ok(1, 'always return scour objects')
  t.end()
})

test('todo: optimizations', (t) => {
  t.ok(1, 'use native .forEach')
  t.ok(1, 'optimize .sortBy(string)')
  t.end()
})

test('todo: array', (t) => {
  t.ok(1, '.at')
  t.ok(1, '.go and .at returning objects, ALWAYS')
  t.ok(1, '.getAt')
  t.ok(1, '.gather')
  t.skip('.slice')
  t.skip('.initial')
  t.ok(1, '.first')
  t.ok(1, '.last')
  t.end()
})

test('todo: collections', (t) => {
  t.ok(1, '.reject')
  t.skip('.pluck')
  t.skip('.reduce / .reduceRight')
  t.skip('.every / .all')
  t.skip('.some / .any')
  t.skip('.contains / .includes')
  t.end()
})
