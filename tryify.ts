// deno-lint-ignore no-explicit-any
type args = any;
type func<T> = (...args: args) => T;

/**
 * The result of an attempted method.
 */
export type Tried<T> = [Error, undefined] | [undefined, T];

type notPromise<T> = T extends Promise<unknown> ? never : unknown;
/**
 * wraps a function and returns a version that will return errors instead of throwing them
 * @param {(args: any) => any} func the function that will be wrapped
 * @example ```ts
 * const errorFunc = (arg1: string, arg2: number): string => throw Error('oops!')
 * const tryFunc = tryify(errorFunc);
 * const [error, result] = tryFunc('hello world', 100) // or
 * const [error, result] = tryify(errorFunc)('hello world', 200)
 * // error.message = 'oops!' and result is undefined
 * ```
 */
export function tryify<T extends notPromise<T>>(
  func: func<T>,
): (...args: Parameters<typeof func>) => Tried<T> {
  return (...args) => {
    try {
      return [undefined, func(...args)];
    } catch (error) {
      return [error, undefined];
    }
  };
}

const poo = () => 5;
const t = tryify(poo)();

/**
 * wraps an async function and returns a version that will return errors instead of throwing them
 * @param {(args: any) => any} func the function that will be wrapped
 * @example ```ts
 * const errorFunc = async (arg1: string, arg2: number): string => Promise.reject('Whoops!')
 * const tryFunc = tryify(errorFunc);
 * const [error, result] = await tryFunc('hello world', 100) // or
 * const [error, result] = await tryify(errorFunc)('hello world', 200)
 * // error.message = 'Whoops!' and result is undefined
 * ```
 */
export function tryifyAsync<T>(
  func: func<PromiseLike<T>>,
): (...args: Parameters<typeof func>) => PromiseLike<Tried<T>> {
  return async (...args) => {
    try {
      return [undefined, await func(...args)];
    } catch (error) {
      return [error, undefined];
    }
  };
}
