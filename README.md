# scour

Traverse objects and arrays.

## Usage

Calling `scour(obj)` returns a wrapper that you can use to traverse `obj`.

```js
const data = {
  users: {
    1: { name: 'john' },
    2: { name: 'shane', confirmed: true },
    3: { name: 'barry', confirmed: true }
  }
}

scour(data).get('users', '1', 'name')   // => 'john'

scour(data).go('users')                   // => [scour object]
scour(data).go('users', '1')              // => [scour object]
scour(data).go('users', '1').get('name')  // => 'john'
```

Use it to set values. Scout treats all data as immutable, so this doesn't
modify your original `data`, but gets you a new one with the modifications made.

```js
data = scour(data)
  .set(['users', '1', 'updated_at'], +new Date())
  .data

// => { users:
//      { 1: { name: 'john', updated_at: 1450667171188 },
//        2: { name: 'shane', confirmed: true },
//        3: { name: 'barry', confirmed: true } } }
```


Use it to traverse collections.

```js
scour(data)
  .go('users')
  .where({ confirmed: true })
  .at(0)
  .get('name')   // => 'shane'
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
s.root             // => <scour>
s.keypath          // => array (string)
```

### go

> `go(keypath)`

Navigates down to a given `keypath`.

```js
data =
  { users:
    { 12: { name: 'steve' },
      23: { name: 'bill' } } }

scour(data).go('users')                    // => <scour instance>
scour(data).go('users', '23').get('name')  // => 'steve'

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

### each

> `each(fn)`

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
<!--api:end-->
