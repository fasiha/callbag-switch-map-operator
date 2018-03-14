const pipe = require('callbag-pipe');
const map = require('callbag-map');
const flatten = require('callbag-flatten');

const flatmap = (mapper, flattener = ((_, result) => result)) => source => pipe(
    source,
    map(orig => pipe(
            mapper(orig),
            map(next => flattener(orig, next)),
            )),
    flatten,
);
/*
If I write the above without pipes, it'd be a bit impenetrable:
```js
const flatmap = (mapper, flattener = ((_, result) => result)) => source => flatten(
    map(orig => map(next => flattener(orig, next))(mapper(orig)))(source));
```
However, this is a straightforwrard generalization of the example given in `callbag-flatten`.

The nested pipes in this implementation are always used with provided sources, so the output of `flatmap` should be
readily usable in yet-more-nested pipes.
*/

module.exports = flatmap;