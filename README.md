# scour

Traverse objects and arrays.

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

### Immutable modifications

Use [set()](#set) to update values. Scout treats all data as immutable, so this
doesn't modify your original `data`, but gets you a new one with the
modifications made.

```js
data = scour(data)
  .set(['users', '1', 'updated_at'], +new Date())
  .data

// => { users:
//      { 1: { name: 'john', updated_at: 1450667171188 },
//        2: { name: 'shane', confirmed: true },
//        3: { name: 'barry', confirmed: true } } }
```


### Advanced traversing

Use [where()](#where) to filter results with advanced querying.

```js
users = scour(data).go('users')

users
  .where({ confirmed: true })
  .at(0)
  .get('name')   // => 'shane'
```

### Models

Use [extend()](#extend) to add your own methods to certain keypaths. This makes them behave like models.

```js
db = scour(data)
  .extend({
    '': {
      artists () {
        return this.go('artists')
      }
    },
    'artists.*': {
      fullname () {
        return this.get('first_name') + ' ' + this.get('last_name')
      }
      albums () {
        return this.root.go('albums')
          .where({ artist_id: this.get('id') })
      }
    }
  })
```

```js
data =
  { artists:
    { 1: { first_name: 'Louie', last_name: 'Armstrong' },
      2: { first_name: 'Miles', last_name: 'Davis' } },
    albums:
    { 32: { artist_id: 1, title: 'Kind of Blue' },
      35: { artist_id: 2, title: 'Struttin' } } }
```

```js
db.artists().find({ name: 'Miles' }).fullname()
//=> 'Miles Davis'

db.artists().find({ name: 'Miles' }).albums().at(0).get('title')
// => 'Kind of Blue'
```

## API

<!--api-->

### scour

> `scour(data, options)`

scour:
Returns a scour instance.

```js
scour(obj)
```

Has the following properties:

```js
s = scour(obj)
s.root             // => [scour object]
s.data             // => raw data (that is, `obj`)
s.keypath          // => string array
```

You can access the raw data using `.data`.

```js
db = scour(data)
db.data               // => same as `data`
db.go('users').data   // => same as `data.users`
```

When you traverse down using [go()](#go), `root` will point to the root
scour instance, and `keypath` will be updated accordingly.

```js
db = scour(data)
admins = db.go('users').go('admins')
```

```js
admins.keypath  // => ['users', 'admins']
admins.root     // => db
```

### go

> `go(keypath)`

Navigates down to a given `keypath`. Always returns a `scour` instance.

```js
data =
  { users:
    { 12: { name: 'steve', last: 'jobs' },
      23: { name: 'bill', last: 'gates' } } }

scour(data).go('users')                    // => [scour (users)]
scour(data).go('users', '12')              // => [scour (name, last)]
scour(data).go('users', '12').get('name')  // => 'steve'
```

If you use it on a non-object or non-array value, it will still be
returned as a scour instance. This is not likely what you want; use
[get()](#get) instead.

```js
attr = scour(data).go('users', '12', 'name')
attr           // => [scour object]
attr.data      // => 'steve'
attr.keypath   // => ['users', '12', 'name']
```

### get

> `get(keypath)`

Returns data in a given `keypath`.

```js
data =
  { users:
    { 12: { name: 'steve' },
      23: { name: 'bill' } } }

scour(data).get('users')       // => same as data.users
scour(data).go('users').data   // => same as data.users

```

### _get

> `_get(result, keypath)`

(Internal)

### at

> `at(index)`

Returns the item at `index`. This differs from `get` as this searches by
index, not by key.

```js
users =
  { 12: { name: 'steve' },
    23: { name: 'bill' } }

scour(users).at(0)         // => { name: 'steve' }
scour(users).get(12).data  // => { name: 'steve' }

```

### set

> `set(keypath, value)`

Sets data. (To be implemented)

### spawn

> `spawn(data, options)`

(Internal) Returns a clone of the instance extended with the given `data`
and `options`.

### forEach

> `forEach(fn)`

Loops through each item. Supports both arrays and objects.

If the item found is an object, it will be returned as a `scour` instance.

```js
users =
  { 12: { name: 'steve' },
    23: { name: 'bill' } }

scour(users).each((user, key) => {
  console.log(user.get('name'))
})
```

The values passed onto the function are:

- `val` - the value; always a scour object.
- `key` - the key.

The value being passed onto the function is going to be a `scour` object.
Use `val.data` to access the raw data.

### each

> `each(fn)`

Alias for [forEach](#foreach).

### map

> `map(fn)`

Loops through each item and returns an array based on the iterator's
return values. Supports both arrays and objects.

```js
users =
  { 12: { name: 'steve' },
    23: { name: 'bill' } }

names = scour(users).map((user, key) => user.get('name'))
// => [ 'steve', 'bill' ]

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

Returns an array. If the data is an object, it returns the values.

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

Returns keys. If the data is an array, returns the array's indices.

### where

> `where(conditions)`

Sifts through the values and returns a set that matches given `conditions`.
Supports MongoDB-style queries.

For reference, see [MongoDB Query Operators][query-ops].

[query-ops]: https://docs.mongodb.org/manual/reference/operator/query/

```js
scour(data).where({ name: 'john' })
scour(data).where({ name: { $in: ['moe', 'larry'] })
```

### find

> `find(conditions)`

Returns the first value that matches `conditions`.
Supports MongoDB-style queries.

For reference, see [MongoDB Query Operators][query-ops].

[query-ops]: https://docs.mongodb.org/manual/reference/operator/query/

```js
scour(data).find({ name: 'john' })
scour(data).find({ name: { $in: ['moe', 'larry'] })
```

### extend

> `extend(props)`

Extends functionality with some prototype.

```js
users =
  { 12: { name: 'steve', surname: 'jobs' },
    23: { name: 'bill', surname: 'gates' } }

methods = {
  fullname () {
    return this.get('name') + ' ' + this.get('surname')
  }
}

scour(users)
  .get(12)
  .extend(methods)
  .fullname()       // => 'bill gates'

```

### toJSON

> `toJSON()`

Returns the value for serialization. This allows `JSON.stringify()` to
work with `scour`-wrapped objects.

The name of this method is a bit confusing, as it doesn't actually return
a JSON string — but I'm afraid that it's the way that the JavaScript API
for [JSON.stringify] works.

[JSON.stringify]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#toJSON%28%29_behavior
<!--api:end-->
