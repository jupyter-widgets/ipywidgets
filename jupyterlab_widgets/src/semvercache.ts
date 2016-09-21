// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  maxSatisfying
} from 'semver';


/**
 * A cache using semver ranges to retrieve values.
 */
export
class SemVerCache<T> {
  set(key: string, version: string, object: T) {
    if (!(key in this._cache)) {
      this._cache[key] = Object.create(null);
    }
    if (!(version in this._cache[key])) {
      this._cache[key][version] = object;
    }
  }

  get(key: string, semver: string): T {
    if (key in this._cache) {
      let versions = this._cache[key];
      let best = maxSatisfying(Object.keys(versions), semver);
      return versions[best];
    }
  }

  private _cache: { [key: string]: {[version: string]: T} } = Object.create(null);
}