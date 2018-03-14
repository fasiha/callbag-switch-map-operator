const tape = require('tape');
const { pipe, fromIter, map, forEach } = require('callbag-basics');
const flatten = require('callbag-flatten');

const flatmap = require('./index');

// Helpers
function dumpbag(bag) {
  let ret = [];
  pipe(bag, forEach(x => ret.push(x)));
  return ret;
}
const flatten1 = arr => arr.reduce((acc, curr) => acc.concat(curr), []);

tape("check that my implementation matches the non-pipe implementation", t => {
  const splitter = n => fromIter([ n * n, n * n * n ]);
  const combiner = (n, power) => [n, power];
  const arr = [ 0, 2, 4, 6, 10 ];
  const source = fromIter(arr);
  const bag1 = flatmap(splitter, combiner)(source);
  const bag2 = flatten(map(orig => map(next => combiner(orig, next))(splitter(orig)))(source));
  t.deepEqual(dumpbag(bag1), dumpbag(bag2), "the pipe/no-pipe implementations agree");
  t.deepEqual(dumpbag(bag1), flatten1(arr.map(n => [[ n, n * n ], [ n, n * n * n ]])), "the data matches");
  t.end();
});

tape("ensure we can deeeeeeply nest", t => {
  const years = Array.from(Array(20), (_, i) => 2001 + i);
  const urls = 'abcdefghijkl'.split('');
  const langs
      = 'ab,aa,af,sq,am,ar,hy,as,ay,az,ba,eu,bn,dz,bh,bi,br,bg,my,be,km,ca,zh,co,hr,cs,da,nl,en,eo,et,fo,fj,fi,fr,fy,gd,gl,ka,de,el,kl,gn,gu,ha,iw,hi,hu,is,in,ia,ie,ik,ga,it,ja,jw,kn,ks,kk,rw,ky,rn,ko,ku,lo,la,lv'
            .split(',');

  let parametersCallbag = pipe(
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
  let expectedParameters = [];
  for (let url of urls) {
    for (let year of years) {
      for (let lang of langs) { expectedParameters.push([ url, year, lang ]); }
    }
  }
  t.deepEqual(dumpbag(parametersCallbag), expectedParameters);

  // Even more nesting!
  const parametersToEndpoints = (url, year, lang) => Array.from(Array(5), (_, i) => `${url}${year}${lang}-${i}`);

  let resultsCallbag = pipe(
      parametersCallbag,
      flatmap(
          ([ url, year, lang ]) => fromIter(parametersToEndpoints(url, year, lang)),
          (_, res) => res,
          ),
  );
  let expectedResults = [];
  for (let [url, year, lang] of expectedParameters) { expectedResults.push(...parametersToEndpoints(url, year, lang)); }
  t.comment(`Generated ${urls.length}*${years.length}*${langs.length}*N=${expectedResults.length}-long array!`);
  t.deepEqual(dumpbag(resultsCallbag), expectedResults);
  t.end();
});

// Because the source for this operator just uses existing callbag operators in a straightforward way, we don't test
// compliance with callbag specs, etc., since that's guaranteed through using existing callbag operators and factories.