// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { maxSatisfying } from 'semver';

import { PromiseDelegate } from '@lumino/coreutils';

import { ArrayExt } from '@lumino/algorithm';

import { Throttler } from '@lumino/polling';

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

    // Schedule a pending request retry.
    this._throttle.invoke();
  }

  async get(key: string, semver: string): Promise<T | undefined> {
    const mod = this._getSync(key, semver);
    if (mod) {
      return mod;
    } else {
      const pd = new PromiseDelegate<T | undefined>();
      this._promiseDelegates.push([key, semver, pd, Date.now()]);
      this._throttle.invoke();
      return pd.promise;
    }
  }

  private _getSync(key: string, semver: string): T | undefined {
    if (key in this._cache) {
      const versions = this._cache[key];
      const best = maxSatisfying(Object.keys(versions), semver);
      if (best !== null) {
        return versions[best];
      }
    }
  }

  private _retry(): void {
    const now = Date.now();
    // Try to resolve each pending request successfully.
    this._promiseDelegates.forEach(([key, semver, pd], idx) => {
      const mod = this._getSync(key, semver);
      if (mod) {
        pd.resolve(mod);
        this._promiseDelegates[idx][3] = null;
      }  
    });

    // Clear out all requests which were fulfilled or expired.
    ArrayExt.removeAllWhere(
      this._promiseDelegates,
      (pc: TPromiseCache<T>) => {
        if (pc[3] === null) {
          // Request fulfilled, so remove the entry.
          return true
        } else if (now - pc[3] > TIMEOUT) {
          // Request expired, so remove the entry.
          pc[2].resolve(undefined);
          return true;
        }
        return false;
      }
    );
    
    // If we still have pending requests, try again later.
    if (this._promiseDelegates.length > 0) {
      this._throttle.invoke();
    }
  }

  private _cache: { [key: string]: { [version: string]: T } } = Object.create(
    null
  );
  private _throttle = new Throttler(() => {this._retry();}, 200);
}

export namespace SemVerCache {
  export interface IRegistryData<T> {
    name: string;
    version: string;
    object: T;
  }
}
