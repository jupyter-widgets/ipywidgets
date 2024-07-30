/**
 * Load a package using requirejs and return a promise
 *
 * @param pkg Package name or names to load
 */
export function requirePromise(pkg: string | string[]): Promise<any> {
  return new Promise((resolve, reject) => {
    const require = (window as any).requirejs;
    if (require === undefined) {
      reject('Requirejs is needed, please ensure it is loaded on the page.');
    } else {
      require(pkg, resolve, reject);
    }
  });
};
