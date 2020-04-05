# Grandma's Own JSX 👵

You no longer need to write JSX like all your boring colleagues.

Look over your shoulder, at your colleague's code. You see this:

```
import React from 'react';

const MyComponent = () => {
  return (
    <div className="container">
      <h1>A Boring Component</h1>
      <p>Readable syntax is for suckers.</p>
    </div>
  );
}
```

Now, chuckle to yourself. Revel in your superiority, as you look back at your own, equivalent code:

```
//👵📚
// 🎁 div className="container"
// 🎩 h1
// 💖 _ "A Lovely Component"
// 👕 p
// 👵 _ "Syntax just like in one of Grandma's old recipe book"

import React from 'react';

const MyComponent = () => {
  return "👵";/*
    🎁
      🎩
        💖
      👕
        👵
  */
}
```

## Demo

You can [mess about with a demo here](https://codesandbox.io/s/like-grandma-made-jgri5).

## How Do I Use It?

### Step 1

Install it:

```
npm install --save grandmas-own-jsx
```

### Step 2

Add this to your `.babelrc` file:

```
"plugins": [
  "grandmas-own-jsx"
]
```

or, depending on your Babel version:

```
"plugins": [
  "module:grandmas-own-jsx"
]
```

### Step 3

Consider your life choices.

## Explain The Syntax?

At the start of your file, you declare a list of recipes. You use a `'👵📚'` to signal you're starting the recipe book.

```
//👵📚
// 🥰 div className="foo" title="bar"  <--  the emoji is the key we will use, followed by the attributes assigned to it
// 🥳 MyComponent className=foo  <--  we can also use variables and custom components
```

To then actually render those components, use a `'👵'` to signal that we're about to reference Grandma's recipes.

Then, we show what the DOM structure should be, showing what is a child of what.

```
const MyApp = '👵';/*
  🥰
    🥳
*/
```

## Why The Whole 'Grandma' Thing?

I really liked the joke of "Grandma's Old Recipe Book", since there's a reference list at the top. As I started to write this README I realised it really wasn't that funny. Covid-19 is testing me.

![Picture of the Grandma from Windwaker, making soup](./grandmaWindwaker.jpg)
