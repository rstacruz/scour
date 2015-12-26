# Changelog

## [v0.7.0]
> Dec 27, 2015

- Implement `scour.sortBy()`.
- `scour#sortBy()` - allow dot notation.

## [v0.6.0]
> Dec 26, 2015

- Improve handling of null values.

## [v0.5.0]
> Dec 25, 2015

- Make `scour.get()`, `scour.at()`, and `scour.find()` return scour-wrapped objects, even if undefined.
- Implement `scour#getAt()`.

## [v0.4.0]
> Dec 25, 2015

- Implement `scour.extendIn()`.
- Optimize various functions.
- `scour#extend()` - fix behavior when extending a root.
- Place built files in `dist/scour.js` and `dist/scour.min.js`.
 Fix usage with browserify.

## [v0.3.0]
> Dec 24, 2015

- Implement `scour.mapObject()`.
- Implement `scour.indexedMap()`.
- Implement `scour.filter()`.
- Implement `scour.reject()`.
- Implement `scour.sortBy()`.
- Implement `scour#mapObject()`.
- Implement `scour#indexedMap()`.
- `scour#forEach()` - pass the 3rd parameter as the index.
- `scour.each()` - pass the 3rd parameter as the index even for arrays.

## [v0.2.0]
> Dec 23, 2015

- Make `use()` available for scoped objects (ie, `.go().use()`).
- Fix `extend()` (et al) to return modified roots.
- Make initialization faster.

## [v0.1.0]
> Dec 23, 2015

- Initial release.

[v0.1.0]: https://github.com/rstacruz/scour/compare/v0.0.0...v0.1.0
[v0.2.0]: https://github.com/rstacruz/scour/compare/v0.1.0...v0.2.0
[v0.3.0]: https://github.com/rstacruz/scour/compare/v0.2.0...v0.3.0
[v0.4.0]: https://github.com/rstacruz/scour/compare/v0.3.0...v0.4.0
[v0.5.0]: https://github.com/rstacruz/scour/compare/v0.4.0...v0.5.0
[v0.6.0]: https://github.com/rstacruz/scour/compare/v0.5.0...v0.6.0
[v0.7.0]: https://github.com/rstacruz/scour/compare/v0.6.0...v0.7.0
