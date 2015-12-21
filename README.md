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

scour(data).get('users')                // => scour object
scour(data).get('users', '1')           // => scour object
scour(data).get('users', '1').data      // => { name: 'john' }
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
  .get('users')
  .where({ confirmed: true })
  .at(0)
```
