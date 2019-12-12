# AutoComplete
This is a standard JavaScript (as well as Node requiriable) class that adds super easy auto completion to your input elements.

## Implementation
### Standard Webpage JavaScript
If you are using this for a website and standard JavaScript in general, just add it to your ``header`` tag as any other script:
```html
<header>
  <script src="autocomplete.js"></script>
</header>
```
### Node.js module
If you are using Node.js with Electron or something else that supports using a browser with Node.js, you can also add it as a module instead:
```js
const {AutoComplete} = require("autocomplete.js");
```

## Getting started
Adding autocompletion is as easy as 1 line of code to get started.
```js
const instance = new AutoComplete(document.querySelector("YourInput"), ["Autocompletes"]);
// Or it can also be done using the static AutoComplete.add() function
const instance = AutoComplete.add(document.querySelector("YourInput"), ["Autocompletes"]);
```

`AutoComplete`'s constructor takes 2 arguments: `inputElement` and `completions`.  
Using `AutoComplete.add()` is completely identical to using `new Autocomplete()`.
```js
/**
  * Initialize an object and activate autocomplete.
  * @param {HTMLInputElement} inputElement Element to watch and autocomplete.
  * @param {string[]} completions Completions that this input box can autocomplete to. You can always add or remove by just modifying the ``completions`` variable of an instance.
  */
new AutoComplete(inputElement, completions = []);
```

## Array of completions
`AutoComplete` instances has an array variable called `completions`. You can add and remove autocompletion strings dynamically by editing this.  
**Default: `[]`**
```js
/**
  * List of words and sentences available for autocompletions.
  * This list is automatically sorted by shortest to longest string when executed.
  * @type {string[]}
  */
completions = [];
```

## Enabled/Disabled
You can disabled autocompletion temporarily until re-enabled by modifying the `enabled` variable.  
**Default: `true`**
```js
/**
  * The current state of activation. If ``true``, autocompletion will happen
  */
enabled = true;
```

## Case Sensitivity
You can toggle case sensitivity by modifying the `caseSensitive` variable.  
**Default: `false`**
```js
/**
  * If the autocompletion should be case sensitive.
  */
caseSensitive = false;
```

## Tab Fill
You can toggle between if the `Tab` button fills the autocompletion or not by editing the `tabFill` variable.  
**Default: `true`**
```js
/**
  * When ``Tab`` is press and an autocompletion is present, should it fill instead of tab stopping?
  */
tabFill = true;
```

## Word Separator
`AutoComplete` instances also carry a `separateBy` variable.  
By default this is `space` but can be set to any string. `Space` is the most logical thing to separate words by and therefore recommend to keep default.

**Default: `" "`**
```js
/**
  * The character to separate words by (Space by default)
  */
separateBy = " ";
```

## Known supported element types
```html
<input>
<textarea></textarea> <!-- Multiline supported! -->
```

Go ahead and try it in action, it's super simple.