// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { maxSatisfying } from 'semver';

import { ArrayExt } from '@lumino/algorithm';

import { PromiseDelegate } from '@lumino/coreutils';

import { Throttler } from '@lumino/polling';

const TIMEOUT = 300;

interface IRequest<T> {
  name: string;
  semVer: string;
  result: PromiseDelegate<T | undefined>;
  timestamp: number | null;
}

/**
 * A registry using semver ranges to retrieve values.
 *
 * Each object in the registry is associated with a name and a semantic
 * version. Objects can be retrieved by giving the name and a semantic version
 * range, and the maximum satisfying version of the object will be returned.
 *
 * Object retrieval may be delayed for a short timeout if no matching object
 * can be found. This is to allow a short window for objects to be registered
 * before get requests are resolved as unsatisfied. Practically, this means
 * that initial object registration can happen concurrent with the first
 * requests.
 *
 */
export class SemVerRegistry<T> {
  /**
   * Register a object with a given name and version.
   */
  register(options: SemVerRegistry.IRegistryData<T>): void {
    const { name, version, object } = options;
    let versions = this._registry.get(name);
    if (versions === undefined) {
      versions = new Map<string, T>();
      this._registry.set(name, versions);
    }

    if (versions.has(version)) {
      throw new Error(`Version ${version} of ${name} already registered.`);
    }
    versions.set(version, object);

    // Some pending requests may now be satisfied, so schedule a retry.
    if (this._pendingRequests.length > 0) {
      this._throttle.invoke();
    }
  }

  /**
   * Get an object for a name and semVer range.
   *
   * @returns a promise resolving to the object with the maximum version
   * satisfying the version range if one is registered, or undefined if one is
   * not registered.
   *
   * #### Notes
   * Resolution may be delayed for a short timeout to allow for some delay in
   * registering the object.
   */
  async get(name: string, semVer: string): Promise<T | undefined> {
    const mod = this._getSync(name, semVer);
    if (mod) {
      return mod;
    }
    const result = new PromiseDelegate<T | undefined>();
    const timestamp = Date.now();
    this._pendingRequests.push({ name, semVer, result, timestamp });
    this._throttle.invoke();
    return result.promise;
  }

  /**
   * Synchronously get an object for a name and semVer range.
   *
   * @returns the object with the maximum version satisfying the version range
   * or undefined if one does not exist.
   */
  private _getSync(name: string, semVer: string): T | undefined {
    const versions = this._registry.get(name);
    if (versions) {
      const best = maxSatisfying(Array.from(versions.keys()), semVer);
      if (best !== null) {
        return versions.get(best);
      }
    }
  }

  /**
   * Retry resolving pending requests.
   */
  private _retry(): void {
    const now = Date.now();
    // Try to resolve each pending request successfully.
    this._pendingRequests.forEach(request => {
      const { name: key, semVer: semver, result } = request;
      const mod = this._getSync(key, semver);
      if (mod) {
        result.resolve(mod);
        request.timestamp = null;
      }
    });

    // Clear out all requests which were fulfilled or expired.
    ArrayExt.removeAllWhere(
      this._pendingRequests,
      ({ result, timestamp }) => {
        if (timestamp === null) {
          // Request fulfilled, so remove the entry.
          return true;
        } else if (now - timestamp > TIMEOUT) {
          // Request expired, so give up and remove the entry.
          result.resolve(undefined);
          return true;
        }
        return false;
      }
    );

    // If we still have pending requests, try again later.
    if (this._pendingRequests.length > 0) {
      this._throttle.invoke();
    }
  }

  private _registry = new Map<string, Map<string, T>>();
  private _pendingRequests: IRequest<T>[] = [];
  private _throttle = new Throttler(() => {
    this._retry();
  }, TIMEOUT);
}

export namespace SemVerRegistry {
  export interface IRegistryData<T> {
    name: string;
    version: string;
    object: T;
  }
}
