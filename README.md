# scour.js

<!-- {.massive-header.-with-tagline} -->

> Traverse objects and arrays immutably

Scour is a general-purpose library for dealing with JSON trees.<br>
As a simple utility with a broad purpose, it can be used to solve many problems. Use it to:

- Manage your [Redux] datastore.
- Provide a model layer to access data in your single-page app. [→](#models)
- Navigate a large JSON tree easily.
- Rejoice in having a lightweight alternative to [Immutable.js]. ([Compare](docs/comparison.md))

[![Status](https://travis-ci.org/rstacruz/scour.svg?branch=master)](https://travis-ci.org/rstacruz/scour "See test builds")

## Install

```sh
npm install --save-exact scourjs
```

```js
window.scour                       // non commonjs
const scour = require('scourjs')   // commonjs/node
import scour from 'scourjs'        // es6 modules
```

## Features

Calling `scour(object)` returns a wrapper that you can use to traverse `object`.
Use [get()](#get) to retrieve values.

```js
data =
  { users:
    { 1: { name: 'john' },
      2: { name: 'shane', confirmed: true },
      3: { name: 'barry', confirmed: true } } }
```

```js
scour(data).get('users', '1', 'name')   // => 'john'
```

<br>

### Traversal
Use [go()](#go) to dig into the structure. It will return another `scour`
wrapper scoped to that object.

```js
data =
  { users:
    { admins:
      { bob: { logged_in: true },
        sue: { logged_in: false } } } }
```

```js
users  = scour(data).go('users')            // => [scour (admins)]
admins = scour(data).go('users', 'admins')  // => [scour (bob, sue)]

admins.go('bob').get('logged_in')           // => true
```

<br>

### Chaining

`scour()` provides a wrapper that can be used to chain methods. This is inspired by [Underscore] and [Lodash].

```js
scour(data)
  .go('users')
  .filter({ admin: true })
  .value
```

[Underscore]: http://underscorejs.org/
[Lodash]: http://lodash.com/

<br>

### Immutable modifications

Use [set()](#set) to update values. Scout treats all data as immutable, so this
doesn't modify your original `data`, but gets you a new one with the
modifications made.

```js
data = scour(data)
  .set(['users', '1', 'updated_at'], +new Date())
  .value

// => { users:
//      { 1: { name: 'john', updated_at: 1450667171188 },
//        2: { name: 'shane', confirmed: true },
//        3: { name: 'barry', confirmed: true } } }
```

<br>

### Advanced traversing

Use [filter()] to filter results with advanced querying.

```js
users = scour(data).go('users')

users
  .filter({ confirmed: true })
  .at(0)
  .get('name')   // => 'shane'
```

<br>

### Models

Use [use()](#use) to add your own methods to certain keypaths. This makes them behave like models.<br>
See [a detailed example](docs/extensions_example.md) to learn more.

##### Sample data

<!-- {.file-heading} -->

```js
data =
  { artists:
    { 1: { first_name: 'Louie', last_name: 'Armstrong' },
      2: { first_name: 'Miles', last_name: 'Davis' } } }
```

##### Your models

<!-- {.file-heading} -->

```js
Root = {
  artists () { return this.go('artists') }
}

Artist = {
  fullname () {
    return this.get('first_name') + ' ' + this.get('last_name')
  }
}
```

##### Using with scour

<!-- {.file-heading} -->

```js
db = scour(data)
  .use({
    '': Root,
    'artists.*': Artist
  })

db.artists().find({ name: 'Miles' }).fullname()
//=> 'Miles Davis'
```

<br>

## API

<!--api-->

### scour

> `scour(object)`

Returns a scour instance wrapping `object`.

```js
scour(obj)
```

It can be called on any Object or Array. (In fact, it can be called on
anything, but is only generally useful for Objects and Arrays.)

```js
data = { menu: { visible: true, position: 'left' } }
scour(data).get('menu.visible')

list = [ { id: 2 }, { id: 5 }, { id: 12 } ]
scour(list).get('0.id')
```

__Chaining__:
You can use it to start method chains. In fact, the intended use is to keep
your root [scour] object around, and chain from this.

```js
db = scour({ menu: { visible: true, position: 'left' } })

// Elsewhere:
menu = db.go('menu')
menu.get('visible')
```

__Properties__:
It the [root], [value] and [keypath] properties.

```js
s = scour(obj)
s.root             // => [scour object]
s.value            // => raw data (that is, `obj`)
s.keypath          // => string array
```

__Accessing the value:__
You can access the raw data using [value].

```js
db = scour(data)
db.value               // => same as `data`
db.go('users').value   // => same as `data.users`
```

## Attributes

These attributes are available to [scour] instances.

### value

> `value`

The raw value being wrapped. You can use this to terminate a chained call.

```js
users =
  [ { name: 'john', admin: true },
    { name: 'kyle', admin: false } ]

scour(users)
  .filter({ admin: true })
  .value
// => [ { name: 'john', admin: true } ]
```

### root

> `root`

A reference to the root [scour] instance.
Everytime you traverse using [go()], a new [scour] object is spawned that's
scoped to a keypath.  Each of these [scour] objects have a `root` attribute
that's a reference to the top-level [scour] object.

```js
db = scour(...)

photos = db.go('photos')
photos.root    // => same as `db`
```

This allows you to return to the root when needed.

```js
db = scour(...)
artist = db.go('artists', '9328')
artist.root.go('albums').find({ artist_id: artist.get('id') })
```

### keypath

> `keypath`

An array of strings representing each step in how deep the current scope is
relative to the root. Each time you traverse using [go()], a new [scour]
object is spawned.

```js
db = scour(...)

users = db.go('users')
users.keypath            // => ['users']

admins = users.go('admins')
admins.keypath           // => ['users', 'admins']

user = admins.go('23')
user.keypath             // => ['users', 'admins', '23']
```

## Traversal methods

For traversing. All these methods return [scour] instances,
making them suitable for chaining.

### go

> `go(keypath...)`

Navigates down to a given `keypath`. Always returns a [scour] instance.

```js
data =
  { users:
    { 12: { name: 'steve', last: 'jobs' },
      23: { name: 'bill', last: 'gates' } } }

scour(data).go('users')                    // => [scour (users)]
scour(data).go('users', '12')              // => [scour (name, last)]
scour(data).go('users', '12').get('name')  // => 'steve'
```

__Dot notation:__
Keypaths can be given in dot notation or as an array. These statements are
equivalent.

```js
scour(data).go('users.12')
scour(data).go('users', '12')
scour(data).go(['users', '12'])
```

__Non-objects:__
If you use it on a non-object or non-array value, it will still be
returned as a [scour] instance. This is not likely what you want; use
[get()] instead.

```js
attr = scour(data).go('users', '12', 'name')
attr           // => [scour object]
attr.value     // => 'steve'
attr.keypath   // => ['users', '12', 'name']
```

### at

> `at(index)`

Returns the item at `index`. This differs from `go` as this searches by
index, not by key.

```js
users =
  { 12: { name: 'steve' },
    23: { name: 'bill' } }

scour(users).at(0)          // => [scour { name: 'steve' }]
scour(users).get(12)        // => [scour { name: 'steve' }]
```

### filter

> `filter(conditions)`

Sifts through the values and returns a set that matches given
`conditions`. Supports functions, simple objects, and MongoDB-style
queries.

[query-ops]: https://docs.mongodb.org/manual/reference/operator/query/

```js
scour(data).filter({ name: 'john' })
scour(data).filter({ name: { $in: ['moe', 'larry'] })
```

MongoDB-style queries are supported as provided by [sift.js].  For
reference, see [MongoDB Query Operators][query-ops].

```js
scour(products).filter({ price: { $gt: 200 })
scour(articles).filter({ published_at: { $not: null }})
```

### find

> `find(conditions)`

Returns the first value that matches `conditions`.  Supports MongoDB-style
queries. For reference, see [MongoDB Query Operators][query-ops]. Also
see [filter()], as this is functionally-equivalent to the first result of
`filter()`.

[query-ops]: https://docs.mongodb.org/manual/reference/operator/query/

```js
scour(data).find({ name: 'john' })
scour(data).find({ name: { $in: ['moe', 'larry'] })
```

### first

> `first()`

Returns the first result as a [scour]-wrapped object. This is equivalent
to [at(0)](#at).

### last

> `last()`

Returns the first result as a [scour]-wrapped object. This is equivalent
to `at(len() - 1)`: see [at()] and [len()].

## Reading methods

For retrieving data.

### get

> `get(keypath...)`

Returns data in a given `keypath`.

```js
data =
  { users:
    { 12: { name: 'steve' },
      23: { name: 'bill' } } }

scour(data).get('users')       // => same as data.users
scour(data).go('users').value  // => same as data.users
```

__Dot notation:__
Like [go()], the `keypath` can be given in dot notation.

```js
scour(data).get('books.featured.name')
scour(data).get('books', 'featured', 'name')
```

### len

> `len()`

Returns the length of the object or array. For objects, it returns the
number of keys.

```js
users =
  { 12: { name: 'steve' },
    23: { name: 'bill' } }

names = scour(users).len()  // => 2
```

### toArray

> `toArray()`

Returns an array. If the the value is an object, it returns the values of
that object.

```js
users =
  { 12: { name: 'steve' },
    23: { name: 'bill' } }

names = scour(users).toArray()
// => [ {name: 'steve'}, {name: 'bill'} ]
```

### values

> `values()`

Alias for `toArray()`.

### keys

> `keys()`

Returns keys. If the value is an array, this returns the array's indices.

## Writing methods

These are methods for modifying an object/array tree immutably.
Note that all these functions are immutable--it will not modify existing
data, but rather spawn new objects with the modifications done on them.

### set

> `set(keypath, value)`

Sets values immutably. Returns a copy of the same object ([scour]-wrapped)
with the modifications applied.

```js
data = { bob: { name: 'Bob' } }
db = scour(data)
db.set([ 'bob', 'name' ], 'Robert')
// db.value == { bob: { name: 'Robert' } }
```

__Immutability:__
This is an immutable function, and will return a new object. It won't
modify your original object.

```js
profile = scour({ name: 'John' })
profile2 = profile.set('email', 'john@gmail.com')

profile.value   // => { name: 'John' }
profile2.value  // => { name: 'John', email: 'john@gmail.com' }
```

__Using within a scope:__
Be aware that using all writing methods ([set()], [del()], [extend()]) on
scoped objects (ie, made with [go()]) will spawn a new [root] object. If
you're keeping a reference to the root object, you'll need to update it
accordingly.

```js
db = scour(data)
book = db.go('book')
book.root === db       // correct so far

book = book.set('title', 'IQ84')
book = book.del('sale_price')
book.root !== db      // `root` has been updated
```

__Dot notation:__
Like [go()] and [get()], the keypath can be given in dot notation or an
array.

```js
scour(data).set('menu.left.visible', true)
scour(data).set(['menu', 'left', 'visible'], true)
```

### del

> `del(keypath)`

Deletes values immutably. Returns a copy of the same object
([scour]-wrapped) with the modifications applied.

Like [set()], the keypath can be given in dot notation or an
array.

```js
scour(data).del('menu.left.visible')
scour(data).del(['menu', 'left', 'visible'])
```

See [set()] for more information on working with immutables.

### extend

> `extend(objects...)`

Extends the data with more values. Returns a [scour]-wrapped object. Only
supports objects; arrays and non-objects will return undefined. Just like
[Object.assign], you may pass multiple objects to the parameters.

```js
data  = { a: 1, b: 2 }
data2 = scour(data).extend({ c: 3 })
```

```js
data2  // => [scour { a: 1, b: 2, c: 3 }]
data2.value   // => { a: 1, b: 2, c: 3 }
```

See [set()] for more information on working with immutables.

## Utility methods

For stuff.

### use

> `use(extensions)`

Extends functionality for certain keypaths with custom methods.
See [Extensions example] for examples.

```js
data =
  { users:
    { 12: { name: 'steve', surname: 'jobs' },
      23: { name: 'bill', surname: 'gates' } } }

extensions = {
  'users.*': {
    fullname () {
      return this.get('name') + ' ' + this.get('surname')
    }
  }
}

scour(data)
  .use(extensions)
  .get('users', 12)
  .fullname()       // => 'bill gates'
```

__Extensions format:__
The parameter `extension` is an object, with keys being keypath globs, and
values being properties to be extended.

```js
.use({
  'books.*': { ... },
  'authors.*': { ... },
  'publishers.*': { ... }
 })
```

__Extending root:__
To bind properties to the root method, use an empty string as the keypath.

```js
.use({
  '': {
    users() { return this.go('users') },
    authors() { return this.go('authors') }
  }
})
```

__Keypath filtering:__
You can use glob-like `*` and `**` to match parts of a keypath. A `*` will
match any one segment, and `**` will match one or many segments. Here are
some examples:

- `users.*` - will match `users.1`, but not `users.1.photos`
- `users.**` - will match `users.1.photos`
- `users.*.photos` - will match `users.1.photos`
- `**` will match anything

__When using outside root:__
Any extensions in a scoped object (ie, made with [go()]) will be used relative
to it. For instance, if you define an extension to `admins.*` inside
`.go('users')`, it will affect `users.

```js
data = { users: { john: { } }
db = scour(data)

users = db.go('users')
  .use({ '*': { hasName () { return !!this.get('name') } })

users.go('john').hasName()      // works
```

While this is supported, it is *not* recommended: these extensions will not
propagate back to the root, and any objects taken from the root will not
have those extensions applied to them.

```js
users.go('john').hasName()              // works
db.go('users.john').hasName()           // doesn't work
```

### toJSON

> `toJSON()`

Returns the value for serialization. This allows `JSON.stringify()` to
work with `scour`-wrapped objects. The name of this method is a bit
confusing, as it doesn't actually return a JSON string — but I'm afraid
that it's the way that the JavaScript API for [JSON.stringify] works.

[JSON.stringify]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#toJSON%28%29_behavior

## Iteration methods

For traversing.

### forEach

> `forEach(function(item, key))`

Loops through each item. Supports both arrays and objects. The `item`s
passed to the function will be returned as a [scour] instance.

```js
users =
  { 12: { name: 'steve' },
    23: { name: 'bill' } }

scour(users).each((user, key) => {
  console.log(user.get('name'))
})
```

The values passed onto the function are:

- `item` - the value; always a scour object.
- `key` - the key.

The value being passed onto the function is going to be a [scour] object.
Use `item.value` or `this` to access the raw values.

### each

> `each(fn)`

Alias for [forEach](#foreach).

### map

> `map(function(item, key))`

Loops through each item and returns an array based on the iterator's
return values. Supports both arrays and objects. The `item`s passed to
the function will be returned as a [scour] instance.

```js
users =
  { 12: { name: 'steve' },
    23: { name: 'bill' } }

names = scour(users).map((user, key) => user.get('name'))
// => [ 'steve', 'bill' ]
```

## Utility functions

These are utilities that don't need a wrapped object.

### scour.set

> `scour.set(object, keypath, value)`

Sets a `keypath` into an `object` immutably.

```js
data = { users: { bob: { name: 'john' } } }

result = set(data, ['users', 'bob', 'name'], 'robert')
// => { users: { bob: { name: 'robert' } } }
```

This is also available as `require('scourjs/utilities/set')`.

### scour.del

> `scour.del(object, keypath)`

Deletes a `keypath` from an `object` immutably.

```js
data = { users: { bob: { name: 'robert' } } }
result = del(data, ['users', 'bob', 'name'])

// => { users: { bob: {} } }
```

This is also available as `require('scourjs/utilities/del')`.

### scour.each

> `scour.each(iterable, fn)`

Iterates through `iterable`, either an object or an array. This is an
implementation of [Array#forEach] that also works for objects.

The callback `fn` will be invoked with two parameters: `currentValue` and
`key`, just like `Array#forEach`.

This is also available as `require('scourjs/utilities/each')`.

### scour.map

> `scour.map(iterable, fn)`

Creates a new `Array` with with the results of calling a provided function
on every element in this array. Works like [Array#map], but also works on
objects as well as arrays.

The callback `fn` will be invoked with two parameters: `currentValue` and
`key`, just like `Array#map`.

This is also available as `require('scourjs/utilities/map')`.

### scour.indexedMap

> `scour.indexedMap(iterable, fn)`

Creates a new `Object` with with the results of calling a provided function
returning the keys and values for the new object.

The callback `fn` will be invoked with two parameters: `currentValue` and
`key`, just like `Array#map`.

The callback `fn` should return an array with two elements: with `result[0]`
being the key, and `result[1]` being the value. These are what the new
object will be constructed with.

The `iterable` parameter can be an object or an array. This works like
`Array#map`, but also works on objects as well as arrays.

```js
list = ['Fred', 'Barney', 'Wilma']

object = scour.indexedMap(list, (val, key) => {
  var newkey = val.substr(0, 1)
  return [ newkey, val ]
})

// => { f: 'Fred', b: 'Barney', w: 'Wilma' }
```
<!--api:end-->

[at()]: #at
[del()]: #del
[extend()]: #extend
[filter()]: #filter
[get()]: #get
[go()]: #go
[keypath]: #keypath
[len()]: #len
[root]: #root
[scour]: #scour
[set()]: #set
[value]: #value
[use()]: #use

[Extensions example]: docs/extensions_example.md
[Object.assign]: https://devdocs.io/javascript/global_objects/object/assign
[sift.js]: https://www.npmjs.com/package/sift
[Redux]: http://rackt.github.io/redux
[Immutable.js]: http://facebook.github.io/immutable-js/
[Array#map]: http://devdocs.io/javascript/global_objects/array/map
[Array#forEach]: http://devdocs.io/javascript/global_objects/array/foreach

## Thanks

**scour** © 2015+, Rico Sta. Cruz. Released under the [MIT] License.<br>
Authored and maintained by Rico Sta. Cruz with help from contributors ([list][contributors]).

> [ricostacruz.com](http://ricostacruz.com) &nbsp;&middot;&nbsp;
> GitHub [@rstacruz](https://github.com/rstacruz) &nbsp;&middot;&nbsp;
> Twitter [@rstacruz](https://twitter.com/rstacruz)

[MIT]: http://mit-license.org/
[contributors]: http://github.com/rstacruz/scour/contributors
