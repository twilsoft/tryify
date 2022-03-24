import { assertEquals } from "https://deno.land/std@0.130.0/testing/asserts.ts";
import { tryify, tryifyAsync } from "./tryify.ts";

// lightweight way to check if functions were called
// deno-lint-ignore no-explicit-any
const spyOn = <T>(func: (...args: any) => T) => {
  let lastCalledWith: Parameters<typeof func> = [];
  const wrapper: typeof func = (...args) => {
    lastCalledWith = [...args];
    return func(...args);
  };
  return Object.assign(wrapper, {
    getLastCalledWith: () => lastCalledWith,
  });
};

const brokenAdd = spyOn((_a: number, _b: number) => {
  throw Error("Oops!");
});

const workingAdd = spyOn((a: number, b: number) => a + b);

const brokenAsyncAdd = spyOn((_a: number, _b: number) =>
  Promise.reject("Whoops!")
);

const workingAsyncAdd = spyOn((a: number, b: number) => Promise.resolve(a + b));

Deno.test("tryify", async (t) => {
  await t.step(
    "It calls the underlying function and returns an error upon failure",
    () => {
      const [error, result] = tryify(brokenAdd)(5, 6);
      assertEquals(error?.message, "Oops!");
      assertEquals(result, undefined);
      assertEquals(brokenAdd.getLastCalledWith(), [5, 6]);
    },
  );

  await t.step(
    "It calls the underlying function and returns a result upon success",
    () => {
      const [error, result] = tryify(workingAdd)(100, 1);
      assertEquals(error, undefined);
      assertEquals(result, 101);
      assertEquals(workingAdd.getLastCalledWith(), [100, 1]);
    },
  );
});

Deno.test("tryifyAsync", async (t) => {
  await t.step(
    "It calls the underlying async function and returns an error upon failure",
    async () => {
      const [error, result] = await tryifyAsync(await brokenAsyncAdd)(
        1,
        200,
      );
      assertEquals(error, "Whoops!");
      assertEquals(result, undefined);
      assertEquals(brokenAsyncAdd.getLastCalledWith(), [1, 200]);
    },
  );

  await t.step(
    "It calls the underlying async function and returns a result upon success",
    async () => {
      const [error, result] = await tryifyAsync(workingAsyncAdd)(300, 200);
      assertEquals(error, undefined);
      assertEquals(result, 500);
      assertEquals(workingAsyncAdd.getLastCalledWith(), [300, 200]);
    },
  );

  await t.step(
    "It works with .then syntax",
    () => {
      tryifyAsync(workingAsyncAdd)(305, 205).then(([error, result]) => {
        assertEquals(error, undefined);
        assertEquals(result, 510);
        assertEquals(workingAsyncAdd.getLastCalledWith(), [305, 205]);
      });
    },
  );
});
