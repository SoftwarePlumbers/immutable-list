# ![Software Plumbers](http://docs.softwareplumbers.com/common/img/SquareIdent-160.png) Immutable List

Immutable list, providing maximum compatibility with plain old JS array (including support for [] operator).

## Example

```javascript
let list = ImmutableList.from([1,2,3,4,5,6,7,8,9]);

let result = list
	.map(a=>a*7)
	.filter(a=>a%2===0)
	.slice(2,4)
	.set(1,99)
	.push(list[7])
	.join(', ')
```

and result should equal '42, 99, 8'. No itermediate arrays will be created until the slice method is reached; The intermediate array created for slice is then re-used for the subsequent set method. Thus although an immutable list never changes (e.g. list.set(1,99) in princple creates a new list), lazy operations are used to minimize excess copies and a pipeline of operations like the above is typically more efficient than using the equivalent array methods.

For the latest API documentation see [The Software Plumbers Site](http://docs.softwareplumbers.com/immutable-list/master)

## Project Status

Beta. It seems functional, and the unit tests pass.   

## Why another immutable list utility?

There's lots of good ones out there. However, features of this one that may appeal:

1. No transpilers, written in straight javascript
2. Minimal dependencies (the iterator-plumbing library is also maintained by Software Plumbers)
3. Supports the square bracket operator
4. API is so similar to Array that in many cases ImmutableList can simply replace existing array-based code
5. Clean class-based implementation

