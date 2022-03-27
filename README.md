# tryify

A teeny tiny functional style error handling module for Deno 🦕

***If you've found this on Github and want to contribute, please consider making a PR [here](https://git.twilsoft.uk/twilsoft/tryify) instead. PR's can still be opened on github but I'll manually merge them upstream.***

### Why?
I don't like `throw`ing things. If you're like me and want to be more deliberate with your error handling this is the tool for you.

### What?
tryify is a small function that wraps an existing function and matches its api with the small difference that it will also return any errors as a return value instead of throwing them.

### How?
Easy! Take a look:
```ts
import { tryify } from 'https://deno.land/x/tryify@1.0.5' // or
import { tryify } from 'https://deno.land/x/tryify' // or for the latest version. (Not recommended)

const brokenAdd = (a: number, b: number): number => {throw Error('Oops!')};

// THIS
let result; // result has to be mutable to use outside of the try block
try {
  result = brokenAdd(5, 6);
} catch (error) {
  // do something with the 'Oops!' error
}

// BECOMES THIS
const brokenAdd = tryify((a: number, b: number): number => {throw Error('Oops!'))};
const [error, result] = await brokenAdd(5, 6);
// in this case result is undefined and the error is populated with the 'Oops!' error.
// if our function had succeeded, result would be 11 here.
```
If you're working with async/promises, use `tryifyAsync` instead.
```ts
import { tryify, tryifyAsync } from 'https://deno.land/x/tryify@1.0.0'
const [error, result] = await tryifyAsync(someFunc)(5, 6);
```

### Goals
I'm not sure it's possible, but I'm hoping someone smarter than me can help. I'd like to be able to have only one function exported that handles both async and sync promises. I've tried and I can't it working without dirty hacks.

### Trust issues?
Check out the tests.
```sh
deno test tryify.test.ts
```