# Comparison

## Versus Lodash

[Underscore] is a library of utility functions. [Lodash] is a more modern implementation of it.

Unlike Lodash and Underscore, scour is primarily a utility to traverse deep object trees. Lodash covers many functions useful for managing objects and arrays, but very few for making immutable edits.

Scour can also traverse through scopes using [go()], which allows you to manage a subtrees and navigate through it.

Scour also has extensions via [use()], which allows you to navigate your data with model-like objects ([example]).

* Features
  * __Lodash__: includes object utilities, as well as functions, strings, and many others.
  * __Scour__: only utilities relevant for objects/arrays.
* Chaining
  * __Lodash__: supports chaining.
  * __Scour__: supports chaining, and scope traversal ([go()]).
* Immutable utilities
  * __Lodash__: has a lot, but none for setting keys deep in an object tree.
  * __Scour__: has [get()].
* Lazy evaluation
  * __Underscore__: not supported.
  * __Lodash__: calls to `.map()`, `.filter()` (et al) can be chained and will be optimized.
  * __Scour__: not supported yet.
* Size (minified and gzipped)
  * __Underscore__: 5.7kb (as of 1.8.3)
  * __Lodash__: 18.4kb (as of 3.0.0)
  * __Scour__: 3.4kb

## Versus Immutable.js

[Immutable] is a library for dealing with data in an immutable fashion.

Scour also has extensions via [use()], which allows you to navigate your data with model-like objects ([example]).

It is really hefty (like 57kb) and has a huge API surface area.

[Underscore]: http://underscorejs.org/
[Lodash]: https://lodash.com/
[Immutable]: http://facebook.github.io/immutable-js/
[go()]: ../README.md#go
[get()]: ../README.md#get
[use()]: ../README.md#use
[example]: extensions_example.md
