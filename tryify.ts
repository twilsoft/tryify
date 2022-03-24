// deno-lint-ignore no-explicit-any
type params = any[];
type func<P extends params, R> = (...args: P) => R;
type asyncFunc<P extends params, R> = func<P, PromiseLike<R>>;

/**
 * The result of an attempted method.
 */
export type Tried<T> = [Error, undefined] | [undefined, T];

/**
 * wraps a function and returns a version that will return errors instead of throwing them
 * @param {(args: any) => any} func the function that will be wrapped
 * @example ```ts
 * const errorFunc = (arg1: string, arg2: number): string => {throw Error('oops!')}
 * const tryFunc = tryify(errorFunc);
 * const [error, result] = tryFunc('hello world', 100) // or
 * const [error, result] = tryify(errorFunc)('hello world', 200)
 * // error.message = 'oops!' and result is undefined
 * ```
 */
// deno-lint-ignore no-explicit-any
export function tryify<P extends any[], R>(
  func: func<P, R> extends asyncFunc<P, R> ? never : func<P, R>,
): (...args: Parameters<typeof func>) => Tried<R> {
  return (...args) => {
    try {
      return [undefined, func(...args)];
    } catch (error) {
      return [error, undefined];
    }
  };
}

/**
 * wraps an async function and returns a version that will return errors instead of throwing them
 * @param {(args: any) => Promise<any>} func the function that will be wrapped
 * @example ```ts
 * const errorFunc = async (arg1: string, arg2: number): string => Promise.reject('Whoops!')
 * const tryFunc = tryify(errorFunc);
 * const [error, result] = await tryFunc('hello world', 100) // or
 * const [error, result] = await tryify(errorFunc)('hello world', 200)
 * // error.message = 'Whoops!' and result is undefined
 * ```
 */
// deno-lint-ignore no-explicit-any
export function tryifyAsync<P extends any[], R>(
  func: asyncFunc<P, R>,
): (...args: Parameters<typeof func>) => PromiseLike<Tried<R>> {
  return async (...args) => {
    try {
      return [undefined, await func(...args)];
    } catch (error) {
      return [error, undefined];
    }
  };
}
