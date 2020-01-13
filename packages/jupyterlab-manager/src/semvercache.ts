// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { maxSatisfying } from 'semver';

import { PromiseDelegate } from '@lumino/coreutils';

import { ArrayExt } from '@lumino/algorithm';

const TIMEOUT = 500;

type TPromiseCache<T> = [
  string,
  string,
  PromiseDelegate<T | undefined>,
  number | null
];

/**
 * A cache using semver ranges to retrieve values.
 */
export class SemVerCache<T> {
  _promiseDelegates: TPromiseCache<T>[] = [];
  _timeout: number;

  set(options: SemVerCache.IRegistryData<T>): void {
    const { name, version, object } = options;
    if (!(name in this._cache)) {
      this._cache[name] = Object.create(null);
    }
    if (!(version in this._cache[name])) {
      this._cache[name][version] = object;
    } else {
      throw `Version ${version} of name ${name} already registered.`;
    }
    this._retry();
  }

  _retry(): void {
    clearTimeout(this._timeout);

    this._promiseDelegates.forEach(([key, semver, pd], idx) => {
      const mod = this._getSync(key, semver);
      if (mod) {
        pd.resolve(mod);
        this._promiseDelegates[idx][3] = null;
      }
    });

    this._checkTimeouts();
  }

  _getSync(key: string, semver: string): T | undefined {
    if (key in this._cache) {
      const versions = this._cache[key];
      const best = maxSatisfying(Object.keys(versions), semver);
      if (best !== null) {
        return versions[best];
      }
    }
  }

  _checkTimeouts(now: number = Date.now()): void {
    ArrayExt.removeAllWhere(
      this._promiseDelegates,
      (pc: TPromiseCache<T>, index: number) => {
        if (pc[3] === null || now - pc[3] < TIMEOUT) {
          // clear off this one
          pc[2].resolve(undefined);
          return true;
        }
        return false;
      }
    );
    // reset timeout if we still have elements
    if (this._promiseDelegates.length > 0) {
      // all nulls have beend
      const newTimeout = now - (this._promiseDelegates[0][3] as number);
      this._timeout = (setTimeout(
        () => this._checkTimeouts,
        newTimeout
      ) as unknown) as number;
    }
  }

  async get(key: string, semver: string): Promise<T | undefined> {
    const mod = this._getSync(key, semver);
    if (mod) {
      return mod;
    } else {
      const pd = new PromiseDelegate<T | undefined>();
      this._promiseDelegates.push([key, semver, pd, Date.now()]);
      if (this._promiseDelegates.length === 1) {
        this._timeout = (setTimeout(
          () => this._checkTimeouts,
          TIMEOUT
        ) as unknown) as number;
      }
      return pd.promise;
    }
  }

  private _cache: { [key: string]: { [version: string]: T } } = Object.create(
    null
  );
}

export namespace SemVerCache {
  export interface IRegistryData<T> {
    name: string;
    version: string;
    object: T;
  }
}
