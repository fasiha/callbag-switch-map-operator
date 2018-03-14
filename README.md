# callbag-flat-map-operator

Callbag operator implemeting `flatmap`, allowing you to map each element of a source callbag to a new callbag, and optionally to custom-collapse each pair of original/new elements into a final source callbag.

This library contains a single function that implements the example in [`callbag-flatten`](https://github.com/staltz/callbag-flatten)'s README showing the basic pattern of calling `map` inside `map`, and then `flatten`ing. That is, its [implementation](index.js), is a combination of existing callbag operators (namely, `pipe`, `map`, and `flatten`), so there is absolutely no magic here. (Compare this to the [`callbag-flat-map`](https://github.com/avinashcodes/callbag-flat-map) which implements this operator from scratch, and is not as readily inspectable.)

## Installation
In a Node.js project, run
```
$ npm install --save callbag-flat-map-operator
```

## API and examples

```js
const flatmap = require('callbag-flat-map-operator');
```

### `flatmap(mapper[, flattener = (a, b) => b])`
I think it's much easier to see what this does with examples, but I'll try to formalize this: with an abuse of TypeScript notation, this can be notionally described as:
```ts
flatmap(mapper: A => Callbag<B>, flattener?: (A, B) => C)(source: Callbag<A>): Callbag<C>
```
That is, `flatmap` is a callbag operator (a higher-order function) that takes up to two functions:
- a `mapper` maps each emission of a source callbag and converts it to a new callbag, and
- a `flattener` that maps each pair of values from the original source callbag and the callbag spawned from it to a final value,

and produces a new source callbag that emits the outputs of `flattener`. By default, `flattener = (a, b) => b`, that is, the returned callbag will just emit a flattened stream of all callbags created by the `mapper`, but by overriding this you can achieve all sorts of useful behavior.

An example will hopefully be much more illuminating. This shows how we can repeatedly use the outputs of `flatmap` in more `flatmaps`, and shows a couple of uses for `flattener` (for this example, be sure to run `npm install callbag-basics`):
```js
const flatmap = require('callbag-flat-map-operator');

const { pipe, fromIter, forEach } = require('callbag-basics'); // npm i callbag-basics

const years = [ 2017, 2016 ];
const urls = 'users,edits'.split(',');
const langs = 'en,zh'.split(',');

// This is the Cartesian product of {years, urls, langs}, so 2 * 2 * 2 elements will be emitted
const parametersCallbag = pipe(
    fromIter(urls),
    flatmap(
        _ => fromIter(years),
        (url, year) => [url, year],
        ),
    flatmap(
        _ => fromIter(langs),
        ([ url, year ], lang) => [url, year, lang],
        ),
);

const parametersToEndpoints = (url, year, lang) => Array.from(Array(2), (_, i) => `/${url}/${year}/${lang}-v${i + 1}`);
const resultsCallbag = pipe(
    parametersCallbag,
    flatmap(
        ([ url, year, lang ]) => fromIter(parametersToEndpoints(url, year, lang)),
        (_, res) => res, // optional, this is the default
        ),
);

pipe(
    resultsCallbag,
    forEach(x => console.log(x)),
);
// /users/2017/en-v1
// /users/2017/en-v2
// /users/2017/zh-v1
// /users/2017/zh-v2
// /users/2016/en-v1
// /users/2016/en-v2
// /users/2016/zh-v1
// /users/2016/zh-v2
// /edits/2017/en-v1
// /edits/2017/en-v2
// /edits/2017/zh-v1
// /edits/2017/zh-v2
// /edits/2016/en-v1
// /edits/2016/en-v2
// /edits/2016/zh-v1
// /edits/2016/zh-v2
```

## Background
- [`callbag-basics`](https://github.com/staltz/callbag-basics) and links to articles therein
- [GitHub's search results for "callbag"](https://github.com/search?q=callbag&type=Repositories&utf8=%E2%9C%93)
- André Staltz's ["Why we need callbags"](https://staltz.com/why-we-need-callbags.html)
