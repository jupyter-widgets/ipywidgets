// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { maxSatisfying } from 'semver';

/**
 * A cache using semver ranges to retrieve values.
 */
export class SemVerCache<T> {
  set(key: string, version: string, object: T): void {
    if (!(key in this._cache)) {
      this._cache[key] = Object.create(null);
    }
    if (!(version in this._cache[key])) {
      this._cache[key][version] = object;
    } else {
      throw `Version ${version} of key ${key} already registered.`;
    }
  }

  get(key: string, semver: string): T | undefined {
    if (key in this._cache) {
      const versions = this._cache[key];
      const best = maxSatisfying(Object.keys(versions), semver);
      if (best !== null) {
        return versions[best];
      }
    }
  }

  private _cache: { [key: string]: { [version: string]: T } } = Object.create(
    null
  );
}
