> ## End-of-life
>
> July 2020: Thank you to all the users and contributors who have made this project possible. Moving forward, please consider alternatives such as [immer](https://www.npmjs.com/package/immer).

---

# scour.js

[![Greenkeeper badge](https://badges.greenkeeper.io/rstacruz/scour.svg)](https://greenkeeper.io/)

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

## Chaining methods

These methods are used to traverse nested structures. All these
methods return [scour] instances, making them suitable for chaining.

#### On null values
Note that `undefined`, `false` and `null` values are still [scour]-wrapped
when returned from [go()], [at()] and [find()].

```js
list = [ { name: 'Homer' }, { name: 'Bart' } ]

scour(list).at(4)         // => [ scour undefined ]
scour(list).at(4).value   // => undefined
```

This is done so that you can chain methods safely even when something is null.
This behavior is consistent with what you'd expect with jQuery.

```js
data = { users: { ... } }
db = scour(data)

db.go('blogposts').map((post) => post.get('title'))
// => []
```

### go

> `go(keypath...)`

Navigates down to a given `keypath`. Always returns a [scour] instance.
Rules [on null values] apply.

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
index, not by key. This returns a the raw value, unlike [getAt()]. Rules
[on null values] apply.

```js
users =
  { 12: { name: 'steve' },
    23: { name: 'bill' } }

scour(users).at(0)          // => [scour { name: 'steve' }]
scour(users).get(12)        // => [scour { name: 'steve' }]
```

### getAt

> `getAt(index)`

Returns the item at `index`. This differs from `get` as this searches by
index, not by key. This returns a the raw value, unlike [at()].
*(Since v0.5)*

```js
users =
  { 12: { name: 'steve' },
    23: { name: 'bill' } }

scour(users).at(0)           // => [scour { name: 'steve' }]
scour(users).getAt(0)        // => { name: 'steve' }
```

### filter

> `filter(conditions)`

Sifts through the values and returns a set that matches given
`conditions`. Supports simple objects, MongoDB-style
queries, and functions.

```js
scour(data).filter({ name: 'Moe' })
scour(data).filter({ name: { $in: ['Larry', 'Curly'] })
scour(data).filter((item) => item.get('name') === 'Moe')
```

__Filter by object:__
If you pass an object as a condition, `filter()` will check if that object
coincides with the objects in the collection.

```js
scour(data).filter({ name: 'Moe' })
```

__Filter by function:__
You may pass a function as a parameter. In this case, the `item` being
passed to the callback will be a [scour]-wrapped object. The result
will also be a [scour]-wrapped object, making it chainable.

```js
scour(data)
  .filter((item, key) => +item.get('price') > 200)
  .sortBy('price')
  .first()
```

__Advanced queries:__
MongoDB-style queries are supported as provided by [sift.js].  For
reference, see [MongoDB Query Operators][query-ops].

```js
scour(products).filter({ price: { $gt: 200 })
scour(articles).filter({ published_at: { $not: null }})
```

__Arrays or objects:__
Both arrays and array-like objects are supported. In this example below,
an object will be used as the input.

```js
devices =
  { 1: { id: 1, name: 'Phone', mobile: true },
    2: { id: 2, name: 'Tablet', mobile: true },
    3: { id: 3, name: 'Desktop', mobile: false } }

scour(devices).filter({ mobile: true }).len()
// => 2
```

Also see [scour.filter()] for the unwrapped version.

[query-ops]: https://docs.mongodb.org/manual/reference/operator/query/

### reject

> `reject(conditions)`

Inverse of [filter()] -- see `filter()` documentation for details.

### find

> `find(conditions)`

Returns the first value that matches `conditions`.  Supports MongoDB-style
queries. For reference, see [MongoDB Query Operators][query-ops]. Also
see [filter()], as this is functionally-equivalent to the first result of
`filter()`. Rules [on null values] apply.

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

### sortBy

> `sortBy(condition)`

Sorts a collection. Returns a [scour]-wrapped object suitable for
chaining. Like other chainable methods, this works on arrays as well as
objects. *(Since v0.8)*

```js
data =
  { 0: { name: 'Wilma' },
    1: { name: 'Barney' },
    2: { name: 'Fred' } }

scour(data).sortBy('name').value
// { 1: { name: 'Barney' },
//   2: { name: 'Fred' },
//   0: { name: 'Wilma' } }
```

__Conditions:__
The given condition can be a string or a function. When it's given as a
function, the `item` being passed is a [scour]-wrapped object, just like
in [forEach()] (et al). These two examples below are
functionally-equivalent.

```js
scour(data).sortBy('name')
scour(data).sortBy((item) => item.get('name'))
```

You may also define nested keys in dot-notation:

```js
scour(data).sortBy('user.name')
```

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
that object. If the value is an array, it returns it as is. Also aliased
as `values()`.

```js
users =
  { 12: { name: 'steve' },
    23: { name: 'bill' } }

names = scour(users).toArray()
// => [ {name: 'steve'}, {name: 'bill'} ]
```

### keys

> `keys()`

Returns keys. If the value is an array, this returns the array's indices.
Also see [toArray()] to retrieve the values instead.

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
db = db.set([ 'bob', 'name' ], 'Robert')
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

Extends the data with more values. Returns a [scour]-wrapped object. Just
like [Object.assign], you may pass multiple objects to the parameters.

```js
data  = { a: 1, b: 2 }
data2 = scour(data).extend({ c: 3 })
```

```js
data2  // => [scour { a: 1, b: 2, c: 3 }]
data2.value   // => { a: 1, b: 2, c: 3 }
```

When used with anything non-object, it will be overridden.

```js
data = {}
db = scour(data)
db = db.go('state').extend({ pressed: true }).root

db.value  // => { state: { pressed: true } }
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

### index

> `index(keypath, field)`

Sets up indices to improve [filter()] performance. *(Since v0.12)*

- `keypath` *(String | Array)* - the keypath of the collection.
- `field` *(String)* - the name of the field to be indexed.

```js
data =
  { users:
    { 1: { name: 'John Creamer' },
      2: { name: 'Stephane K' } } }

db = scour(data).index('users', 'name')
db.filter({ name: 'Stephane K' })
```

Doing this will add an index in the root (acccessible via
`scour().indices`) to make searches faster for certain [filter()] queries.
Any writing actions ([set()], [extend()], [del()]) will automatically
update the index.

See [scour-search] for more information on indexing.

[scour-search]: https://github.com/rstacruz/scour-search

### toJSON

> `toJSON()`

Returns the value for serialization. This allows `JSON.stringify()` to
work with `scour`-wrapped objects. The name of this method is a bit
confusing, as it doesn't actually return a JSON string — but I'm afraid
that it's the way that the JavaScript API for [JSON.stringify] works.

[JSON.stringify]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#toJSON%28%29_behavior

### equal

> `equal(other)`

Checks for equality between two Scour-wrapped objects.

```js
a = scour(data)
b = scour(data)

a.equal(b)   // => true
```

## Iteration methods

These methods are generally useful for collections. These
methods can work with either arrays or array-like objects, such as
below.

```js
subjects =
  { 1: { id: 1, title: 'Math', level: 101 },
    2: { id: 2, title: 'Science', level: 103 },
    3: { id: 3, title: 'History', level: 102 } }
```

__Values:__
For all these functions, The items passed onto the callbacks _is_ a
[scour]-wrapped object. Use `item.value` or `this` to access the raw
values.

```js
scour(subjects).forEach((subject, key) => {
  console.log(subject.get('title'))
})
```

__Return values:__
For methods that return values (such as [map()], the returned results _is
not_ a [scour]-wrapped object, and isn't suitable for chaining.

```js
scour(subjects).map((subject, key) => {
  return subject.get('title') + ' ' + subject.get('level')
})
// => [ 'Math 101', 'Science 103', 'History 102' ]
```

### forEach

> `forEach(function(item, key, index))`

Loops through each item. Supports both arrays and objects.
The rules specified in [Iteration methods] apply.

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
- `index` - the index.

### each

> `each(fn)`

Alias for [forEach](#foreach).

### map

> `map(function(item, key))`

Loops through each item and returns an array based on the iterator's
return values. Supports both arrays and objects.
The rules specified in [Iteration methods] apply.

```js
users =
  { 12: { name: 'Steve' },
    23: { name: 'Bill' } }

names = scour(users).map((user, key) => user.get('name'))
// => [ 'Steve', 'Bill' ]
```

### mapObject

> `mapObject(function(val, key))`

Creates a new `Object` with with the results of calling a provided function
on every element in this array. Works like [Array#map], but also works on
objects as well as arrays, and it returns an object instead.
The rules specified in [Iteration methods] apply.

See [scour.mapObject()] for details and the non-wrapped version.

### indexedMap

> `indexedMap(function(val, key))`

Creates a new `Object` with with the results of calling a provided function
returning the keys and values for the new object.
The rules specified in [Iteration methods] apply.

See [scour.indexedMap()] for details and the non-wrapped version.

### reset

> `reset(value, options)`

Returns a clone with the `value` replaced. The new instance will
retain the same properties, so things like [use()] extensions are carried
over.

```js
db = scour({ name: 'hello' })
db.value  //=> { name: 'hello' }

db = db.reset({})
db.value  // => {}
```

This is useful for, say, using Scour with [Redux] and implementing an
action to reset the state back to empty.

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

## Utility functions

These are utilities that don't need a wrapped object.

### scour.get

> `scour.get(object, keypath)`

Gets a keypath from an object.

```js
data = { users: { bob: { name: 'john' } } }

result = get(data, ['users', 'bob', 'name'])
// => 'robert'
```

This is also available as `require('scourjs/utilities/get')`.

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

### scour.extendIn

> `scour.extendIn(object, keypath, extensions...)`

Extends a `keypath` from an `object` immutably.

```js
data = { users: { bob: { name: 'robert' } } }
result = extendIn(data, ['users', 'bob'], { email: 'bob@gmail.com' })

// => { users: { bob: { name: 'robert', email: 'bob@gmail.com' } } }
```

This is also available as `require('scourjs/utilities/extend_in')`.

### scour.each

> `scour.each(iterable, fn)`

Iterates through `iterable`, either an object or an array. This is an
implementation of [Array#forEach] that also works for objects. The callback
`fn` will be invoked with two parameters: `currentValue` and `key`, just
like `Array#forEach`.

This is also available as `require('scourjs/utilities/each')`.

[Array#forEach]: http://devdocs.io/javascript/global_objects/array/foreach

### scour.map

> `scour.map(iterable, fn)`

Creates a new `Array` with with the results of calling a provided function
on every element in this array. Works like [Array#map], but also works on
objects as well as arrays.

The callback `fn` will be invoked with two parameters: `currentValue` and
`key`, just like [Array#map].

This is also available as `require('scourjs/utilities/map')`.

[Array#map]: http://devdocs.io/javascript/global_objects/array/map

### scour.mapObject

> `scour.mapObject(iterable, fn)`

Creates a new `Object` with with the results of calling a provided function
on every element in this array. Works like [Array#map], but also works on
objects as well as arrays, and it returns an object instead.

The callback `fn` will be invoked with two parameters: `currentValue` and
`key`, just like [Array#map].

```js
object = { a: 20, b: 30, c: 40 }
result = scour.mapObject(object, (val, key) => {
  return '$' + val + '.00'
})

// => { a: '$20.00', b: '$30.00', c: '$40.00' }
```

This is also available as `require('scourjs/utilities/map_object')`.

### scour.indexedMap

> `scour.indexedMap(iterable, fn)`

Creates a new `Object` with with the results of calling a provided function
returning the keys and values for the new object.

The callback `fn` will be invoked with two parameters: `currentValue` and
`key`, just like [Array#map].

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

This is also available as `require('scourjs/utilities/indexed_map')`.

### scour.filter

> `scour.filter(iterable, function(val, key), [isArray])`

Creates a new Array or Object with all elements that pass the test
implemented by the provided function.

Works like [Array#filter], but will return an object if an object is also passed.

The optional `isArray` argument, when passed `true`, will always make this
return an `Array`. If `false`, it will always be an `Object`. Leave it
`undefined` for the default behavior.

This is also available as `require('scourjs/utilities/filter')`.

[Array#filter]: http://devdocs.io/javascript/global_objects/array/filter

### scour.sortBy

> `scour.sortBy(iterable, criteria)`

Sorts by a given criteria.

```js
list = [ { name: 'Fred' }, { name: 'Barney' }, { name: 'Wilma' } ]
scour.sortBy(list, 'name')
```

This is also available as `require('scourjs/utilities/sort_by')`.
<!--api:end-->

[at()]: #at
[del()]: #del
[extend()]: #extend
[filter()]: #filter
[forEach()]: #foreach
[get()]: #get
[getAt()]: #getat
[go()]: #go
[keypath]: #keypath
[len()]: #len
[map()]: #map
[root]: #root
[scour]: #scour
[set()]: #set
[toArray()]: #toarray
[value]: #value
[use()]: #use
[scour.mapObject()]: #scour.mapobject
[scour.indexedMap()]: #scour.indexedmap
[scour.filter()]: #scour-filter
[Iteration methods]: #iteration-methods
[on null values]: #on-null-values

[Extensions example]: docs/extensions_example.md
[Object.assign]: https://devdocs.io/javascript/global_objects/object/assign
[sift.js]: https://www.npmjs.com/package/sift
[Redux]: http://rackt.github.io/redux
[Immutable.js]: http://facebook.github.io/immutable-js/
[scour-search]: https://github.com/rstacruz/scour-search

## Thanks

**scour** © 2015+, Rico Sta. Cruz. Released under the [MIT] License.<br>
Authored and maintained by Rico Sta. Cruz with help from contributors ([list][contributors]).

> [ricostacruz.com](http://ricostacruz.com) &nbsp;&middot;&nbsp;
> GitHub [@rstacruz](https://github.com/rstacruz) &nbsp;&middot;&nbsp;
> Twitter [@rstacruz](https://twitter.com/rstacruz)

[MIT]: http://mit-license.org/
[contributors]: http://github.com/rstacruz/scour/contributors
