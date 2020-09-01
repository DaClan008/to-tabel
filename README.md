# TO-TABEL

[![Build Status](https://travis-ci.com/DaClan008/totable.svg?branch=master)](https://travis-ci.com/DaClan008/totable.svg?branch=master)
[![Coverage Status](https://coveralls.io/repos/github/DaClan008/totable/badge.svg?branch=master)](https://coveralls.io/github/DaClan008/totable?branch=master)
[![codecov](https://codecov.io/gh/DaClan008/totable/branch/master/graph/badge.svg)](https://codecov.io/gh/DaClan008/totable)
![npm](https://img.shields.io/npm/v/to-tabel)
![npm](https://img.shields.io/npm/dw/to-tabel)
![NPM](https://img.shields.io/npm/l/to-tabel)

An easy way to log content in table form to a console. This table has amongst others the following set of abilities:

-   Include flexibility in using Unicode (or emoji characters) - attempts to correct sizing differences.
-   It can accept complex objects as data, arrays or a combination of both.
-   The column names and sizes can be customized.
-   The size of the table and display options can be customized.
-   It can print a continuos stream of data with the ability to delete rows.
-   It has the ability to ignore empty rows, or show empty rows (depending on options).

## Install

```bash
	npm install to-tabel
```

## Usage

```js
const { Table } = require('totable');

const data = [{ someCol: 'colValue' }];
// the following option will automatically print data to console after initialization
const options = { print: true };

const tbl = new Table(data, options);

/*
output:
  ┌───────────╥────────────┐
  │  someCol  ║  colValue  │
  └───────────╨────────────┘
*/
```

> **PLEASE NOTE** that print and stream functions are async functions. await however will not be used in these examples below, but should be used in code!!

Alternatively if multiple lines (or rows) are included in the data object:

```js
const { Table } = require('totable');

const data = [{ someCol: 'colValue' }, 'val2'];

// no output will occur here
const tbl = new Table(data);
// needs to call print in order to get output
tbl.print();

/*
output:
  ┌────────────┐
  │  someCol   │
  ╞════════════╡
  │  colValue  │
  ├────────────┤
  │  val2      │
  └────────────┘
*/
```

## Data

The acceptable data forms are any of the following:

### Arrays

-   string types,
-   number types,
-   object types,
-   Array types,
-   combination of the above

_NOTE_:

If all items in the arays are of the same type, each item will be considered to be a row in 1 column.

The items of an Array which is inside a data Array, are considered values for each column. [ [ val_for_col1, value_fo_col2 ], [ ...second row data ] ].

Therefore to show a uniform type array in column form, one could place each value in an array of the parent array ([[val1], [val2]) etc.

Any key in the object will be considered to be the name of the column.

### Objects

Any type of object where eacy key in the object represents a column name.

## Options

All options are optional and none is required.

The following set of options are available:

| name                            | short description                                                                        |
| ------------------------------- | ---------------------------------------------------------------------------------------- |
| [align](#align)                 | Set content Alignement                                                                   |
| [borders](#borders)             | set border types                                                                         |
| [canGrow](#canGrow)             | allow for columns to grow                                                                |
| [columnPattern](#columnPattern) | Allow for flexible column names                                                          |
| [columns](#columns)             | Allow for more flexible column options                                                   |
| [eLevel](#eLevel)               | Sets the method for calculating uni characters                                           |
| [excludeHeader](#excludeHeader) | Set whether the header for each column should be printed                                 |
| [fill](#fill)                   | Set whether the full size of the table should be filled, or if content should be wrapped |
| [flatten](#flatten)             | Sets whether header to content should allign vertically or horizontally (flat).          |
| [headAlign](#headAlign)         | Set how the header should align                                                          |
| [inclusive](#inclusive)         | Sets if empty rows should be included or not                                             |
| [margin](#margin)               | Sets the left most margin of the table                                                   |
| [maxDepth](#maxDepth)           | Sets the depth of recursion through the data objects                                     |
| [maxSize](#maxSize)             | Sets the maximum size of the table                                                       |
| [padding](#padding)             | Sets the padding between border and content of each cell                                 |
| [print](#print)                 | Sets whether data should be automatically printed during construction of the object      |
| [size](#size)                   | Set a fixed size to the table                                                            |
| [stream](#stream)               | Must be set if continuous data is going to be received by the table                      |
| [tabSize](#tabSize)             | Set the size that tab characters will take                                               |

### **align:**

The align property aligns the content of the column based on the Alignment Enum:

-   left = 'left'
-   center = 'center'
-   right = 'right'

TYPE: Alignment (string enum type)

DEFAULT: Alignment.left ('left');

USAGE:

It can be used as follows:

```javascript
const data = ['v1', 'v2'];
const options = {
	align: Alignment.center,
	print: true,
};

const tbl = new Table(data, options);

/* output:
  ┌─────────┐
  │  col-0  │
  ╞═════════╡
  │   v1    │
  ├─────────┤
  │   v2    │
  └─────────┘
*/
```

OR

```javascript
const data = ['v1', 'v2'];
const options = {
	align: 'right',
	print: true,
};

const tbl = new Table(data, options);

/* output:
  ┌─────────┐
  │  col-0  │
  ╞═════════╡
  │     v1  │
  ├─────────┤
  │     v2  │
  └─────────┘
*/
```

### **borders**

Borders determine the border style for the Table and uses mainly [boks](https://github.com/DaClan008/boks) under the hood.

TYPE:

-   false: this will disable all borders, and borders won't be printed.
-   boksOptions (object) - Options object used by the [boks](https://github.com/DaClan008/boks) package.
-   boksOptions Array - similar as above, but whith each item in the array representing in order the following list:

    -   headerBorder,
    -   contentBorder,
    -   additionalBorder,

-   combinedBorders (object), which consists of the following properties:

    -   content: of type boksOptions or FALSE
    -   header: of type boksOptions or FALSE
    -   headPure: of type boksOptions or FALSE

-   Predetermined border type, which is an enum with the following options:

    -   none: same effect as making all borders false
    -   boldSingle: The outer borders will be bold, and inner borders will be normal.
    -   boldSingleTop: Only header will have borders of type boldSingle.
    -   bold: all borders will be printed in bold.
    -   single: all borders will be printed normally.
    -   boldTop: the header will be bold borders, content will have no borders.
    -   singleTop: the header will have normal borders and the content no borders.

> **Please note** that there are some complexities in creating different borders especially where the header and content borders meet. They can also meet either horizontally or vertically. The horizontal joined header borders are stored in the optional 'headPure' property if combinedBorders are used.

DEFAULT: custom setup

USAGE:

```javascript
const { templates } = require('boks');
const data = ['v1', 'v2'];
const options = { borders: templates.singleDouble, print: true };

const tbl = new Table(data, options as Options);

/* output:
  ╒═════════╕
  │  col-0  │
  ╞═════════╡
  │  v1     │
  ╞═════════╡
  │  v2     │
  ╘═════════╛
*/

// OR

options = { borders: [templates.bold, templates.single] }

// OR specify each

options = { border: {
	content: templates.single,
	header: templates.bold,
}}

/* output:
  ┏━━━━━━━━━┓
  ┃  col-0  ┃
  ┡━━━━━━━━━┩
  │  v1     │
  ├─────────┤
  │  v2     │
  └─────────┘
*/

// OR

options = { borders: [ false, templates.single ] }

/* output
     col-0
  ╓─────────╖
  ║  v1     ║
  ╟─────────╢
  ║  v2     ║
  ╙─────────╜
*/

// OR

options = { borders: false }

/* output
    col-0
    v1
    v2
*/
```

> PLEASE remember to also fix headPure if columns flow vertically below each other instead of horizontally next to each other.

### canGrow

Will only work if either data is supplied or columns property has been given. If set to true, the columns will be restricted to either the supplied columns, or if no supplied columns then the columns inside the data component.

Adding new data after initialization that has different collumns to those initially set, will not show the additional columns.

TYPE: boolean

DEFAULT: true

USAGE:

```javascript
const data = ['v1', 'v2'];

const options = { canGrow: false };

const tbl = new Table(data, options);

tbl.addRow(['v3', 'v3-2']);
tbl.print();

/* output
  ┌─────────┐
  │  col-0  │
  ╞═════════╡
  │  v1     │
  ├─────────┤
  │  v2     │
  ├─────────┤
  │  v3     │
  └─────────┘


VS if no options is set:

  ┌─────────┬─────────┐
  │  col-0  │  col-1  │
  ╞═════════╪═════════╡
  │  v1     │         │
  ├─────────┼─────────┤
  │  v2     │         │
  ├─────────┼─────────┤
  │  v3     │  v3-2   │
  └─────────┴─────────┘

*/
```

### columnPattern

The column pattern is used to automatically alter the name of a numbered column.

The ~D caracter in the patter is used to place the number in the string.

TYPE: string

DEFAULT: col-~D

USAGE:

```javascript
const data = [
	['v1', 'v2'],
	['v3', 'v4'],
];

const options = { columnPattern: 'new ~D name' };

const tbl = new Table(data, options);

tbl.print();

/* output
  ┌──────────────┬──────────────┐
  │  new 0 name  │  new 1 name  │
  ╞══════════════╪══════════════╡
  │  v1          │  v2          │
  ├──────────────┼──────────────┤
  │  v3          │  v4          │
  └──────────────┴──────────────┘
*/
```

### columns

Is used to customize columns and can be done in several ways.

TYPE:

-   **Array of strings** where each string in the array represent a column name.
-   **Array of numbers** where each number in the array represent the order in which the column will appear (order start at 1). Therefore an array [1, 3, 2] will result in the first item of the data to be printed 1st, the 2nd to be printed third and the third will be printed second.
-   **Array of columnProperty** objects (refer below).
-   Or an **object** where each key in the object represent the name of the column as it will appear on the data object. the values for these keys are as follows:

    -   **number** type value will represent the order for that key (similar to the above),
    -   **string** type will represent the printed name for that key (i.e. the column name can change),
    -   **false** means the column should be excluded in the printing of the table,
    -   **true** means that the column should be included in the printing of the table,
    -   **columnProperty** Object (refer below)

#### columnProperty Object

A column property object is used to set more than one properties on a column. The following properties are available:

| name      | type         | Required | Description                                                                                                                                                                                                                                                          |
| --------- | ------------ | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| name      | string       | yes      | The name of the column as it will appear on the data object. This can only be a number representing the array index number (alternatively the array index number will be gathered from the index of the columnProperty object inside a columnProperty object array). |
| printName | string       | no       | Is the name that will be outputed to the console for the column.                                                                                                                                                                                                     |
| align     | Alignment \* | no       | How this column's content should align (If not set, will inherit from table align property).                                                                                                                                                                         |
| headAlign | Alignment \* | no       | Set how the column's header will align (if not set, will inherit from table headAlign Property). \*                                                                                                                                                                  |
| order     | number       | no       | The order which this column should appear in relation to other columns                                                                                                                                                                                               |
| minSize   | number       | no       | The minimum Size this column should be. If the column is forced to be smaller, this column will not appear.                                                                                                                                                          |
| maxSize   | number       | no       | The maximum size this column should be. This can be a decimal value (between 0 and 1), which represents a fraction of the tableSize                                                                                                                                  |
| size      | number       | no       | The fixed size this column should be. This can be a decimal value (between 0 and 1), which represents a fraction of the tableSize.                                                                                                                                   |
| fixed     | boolean      | no       | If true then the size will be fixed to the initial size of the column. Please note that if size is selected, fixed is automatically assumed and this property needs to be set to false if column is not intended to be fixed.                                        |

> \* Alignment is a string enum (center, left, right)

USAGE:

```javascript
const data = [
	{
		c1: 'v1',
		c2: 'v2',
		c3: 'extra',
	},
	['v3', 'v4', 'extra'],
];

const options = {
	columns: {
		c1: {
			name: 'c1',
			printName: 'my1',
			order: 2,
		},
		c3: {
			name: 'c3',
			printName: 'my2',
			order: 1,
			size: 3,
		},
	},
	canGrow: true,
};

const tbl = new Table(data, options);

tbl.print();

/* output
  ┌─────────┬───────┬───────┐
  │  c2     │  my2  │  my1  │
  ╞═════════╪═══════╪═══════╡
  │  v2     │  ext  │  v1   │
  │         │  ra   │       │
  ├─────────┼───────┼───────┤
  │  extra  │  v4   │  v3   │
  └─────────┴───────┴───────┘
*/
```

> Please note if canGrow is false, only my2 and my1 will be printed.

If the array object is out of place (if you look at 'extra'), this is fixed by ensuring the order of the columns is correct in the object (or array). i.e. including c2 property in the object. (any items in the column object or array is assumed to be in order they will appear).

To fix:

```javascript
const options = {
	columns: {
		c1: {
			name: 'c1',
			printName: 'my1',
			order: 2,
		},
		c2: true,
		c3: {
			name: 'c3',
			printName: 'my2',
			order: 1,
			size: 3,
		},
	},
};

const tbl = new Table(data, options);

tbl.print();
/* output
  ┌──────┬───────┬───────┐
  │  c2  │  my2  │  my1  │
  ╞══════╪═══════╪═══════╡
  │  v2  │  ext  │  v1   │
  │      │  ra   │       │
  ├──────┼───────┼───────┤
  │  v4  │  ext  │  v3   │
  │      │  ra   │       │
  └──────┴───────┴───────┘
*/
```

> further note that all un ordered columns will appear first in the line and the order represent the order they will be printed and not the order they will appear in the data objects.

A string column example is as follows:

```javascript
const data = [
	{
		c1: 'v1',
		my2: 'v2',
		c2: 'extra',
	},
	['v3', 'v4', 'extra'],
];

const options: = {
	columns: ['my1', 'my2'],
	canGrow: true,
};

const tbl = new Table(data, options);

tbl.print();
/* output
  ┌───────┬───────┬─────────┬─────────┐
  │  my1  │  my2  │  c1     │  c2     │
  ╞═══════╪═══════╪═════════╪═════════╡
  │       │  v2   │  v1     │  extra  │
  ├───────┼───────┼─────────┼─────────┤
  │  v3   │  v4   │  extra  │         │
  └───────┴───────┴─────────┴─────────┘
*/
```

### eLevel

The emoji level calculation. Bear in mind there are several ways to calculate emoji's (that may appear to be 1 character long, but in some instances could be 9 or more). This levels could assist in correcting the behaviour or calculation of the emoji.

TYPE: emojiLevel (numbered enum)

-   none = 0 -> each character will be considered to be a new character.
-   all = 1 -> All methods are used to calculate (a nine character emoji will appear be calculated as being 1 character, however the console might still print it in some cases as 2 characters).
-   med = 2 -> only some methods are used in the calculation, but might be more accurate than 1 in that a nine character emoji might appear to be 2 characters instead of 1, and the console might print it as 2.
-   low = 3 -> the lowest level of calculation is used.

DEFAULT: emojiLevel.All

### excludeHeader

This property will exclude the header during printing to the console.

TYPE: boolean

DEFAULT: false

USAGE:

```javascript
const data = [
	['v1', 'v2'],
	['v3', 'v4'],
];

const options = { excludeHeader: true };

const tbl = new Table(data, options);

tbl.print();

/* output
  ┌─────────┬─────────┐
  │  v1     │  v2     │
  ├─────────┼─────────┤
  │  v3     │  v4     │
  └─────────┴─────────┘
While the default behaviour is:
  ┌─────────┬─────────┐
  │  col-0  │  col-1  │
  ╞═════════╪═════════╡
  │  v1     │  v2     │
  ├─────────┼─────────┤
  │  v3     │  v4     │
  └─────────┴─────────┘
*/
```

### fill

This property will stretch the columns to fill either to maximum size or the the set Table size. The default behavious will usually wrap the text.

TYPE: boolean

DEFAULT: false

USAGE:

```javascript
const data = [
	['v1', 'v2'],
	['v3', 'v4'],
];

const options: Options = {
	fill: true,
};

const tbl = new Table(data, options);

tbl.size = 40;

tbl.print();

/* output
  ┌─────────────────────┬─────────────────────┐
  │  col-0              │  col-1              │
  ╞═════════════════════╪═════════════════════╡
  │  v1                 │  v2                 │
  ├─────────────────────┼─────────────────────┤
  │  v3                 │  v4                 │
  └─────────────────────┴─────────────────────┘
*/
```

> Please note that the size takes into consideration the margin aswell.

### flatten

Is only used when one row of data is received and no more. The default behaviour for a single row data object is to printe the headers vertically below each other. This property forces the headers to be printed horizontally next to each other.

TYPE: boolean

DEFAULT: false

USAGE:

```javascript
const data = [['v1', 'v2']];

const options = { flatten: true };

const tbl = new Table(data, options);

tbl.print();

/* output
  ┌─────────┬─────────┐
  │  col-0  │  col-1  │
  ╞═════════╪═════════╡
  │  v1     │  v2     │
  └─────────┴─────────┘
VS normal output:
  ┌─────────╥──────┐
  │  col-0  ║  v1  │
  ├─────────╫──────┤
  │  col-1  ║  v2  │
  └─────────╨──────┘
*/
```

### headAlign

This property will align the header text inside the column space.

TYPE: Alignment (string enum) [center, left, right]

DEFAULT: Alignment.left

USAGE:

```javascript
const data = [
	['someBig DATA1', 'someBig DATA2'],
	['someBig DATA3', 'someBig DATA4'],
];

const options = { headAlign: Alignment.center };

const tbl = new Table(data, options);

tbl.print();

/* output
  ┌─────────────────┬─────────────────┐
  │      col-0      │      col-1      │
  ╞═════════════════╪═════════════════╡
  │  someBig DATA1  │  someBig DATA2  │
  ├─────────────────┼─────────────────┤
  │  someBig DATA3  │  someBig DATA4  │
  └─────────────────┴─────────────────┘
OR if set to 'rigth'
  ┌─────────────────┬─────────────────┐
  │          col-0  │          col-1  │
  ╞═════════════════╪═════════════════╡
  │  someBig DATA1  │  someBig DATA2  │
  ├─────────────────┼─────────────────┤
  │  someBig DATA3  │  someBig DATA4  │
  └─────────────────┴─────────────────┘
*/
```

### inclusive

Sometimes columns will have no data in it. In these cases the table will not print that column unless inclusive is set to true.

TYPE: boolean

DEFAULT: false

USAGE:

```javascript
const data = [{ c1: 'v1', c2: '' }, 'v3'];

const options = { inclusive: true };

const tbl = new Table(data, options);

tbl.print();

/* output
  ┌──────┬──────┐
  │  c1  │  c2  │
  ╞══════╪══════╡
  │  v1  │      │
  ├──────┼──────┤
  │  v3  │      │
  └──────┴──────┘
Where normal behaviour is:
  ┌──────┐
  │  c1  │
  ╞══════╡
  │  v1  │
  ├──────┤
  │  v3  │
  └──────┘
/*
```

### margin

Sets the number of spacing from the left where the table will start.

TYPE: number

DEFAULT: 2

### maxDepth

The maximum depth is used to set the maximum recursion that will happen down data tree. After the table has reached its depth, the object will be printed by JSON.stringify function. This property is usefull if less data needs to be seen and requires less calculation time if set to a lower level.

TYPE: number

DEFAULT: 3

USAGE:

```javascript
const data = { c1: 'v1', c2: { c3: 'v2', c4: { c5: 'v3', c6: 'v4' } } };

const options = { maxDepth: 2 };

const tbl = new Table(data, options);

tbl.print();

/* output
  ┌──────╥──────────────────────────────┐
  │  c1  ║  v1                          │
  ├──────╫──────────────────────────────┤
  │  c2  ║  c3 ║ v2                     │
  │      ║  c4 ║ {"c5":"v3","c6":"v4"}  │
  └──────╨──────────────────────────────┘
if set to maxDepth of 3:
  ┌──────╥────────────────┐
  │  c1  ║  v1            │
  ├──────╫────────────────┤
  │  c2  ║  c3 ║ v2       │
  │      ║  c4 ║ c5 ║ v3  │
  │      ║     ║ c6 ║ v4  │
  └──────╨────────────────┘
*/
```

### maxSize

The max size sets the maximum size that the table can be. Please note that if not used with fill might result the table to be less than max size.

Further note that if size property is also used, this value is overridden or capped by size value.

Finally note that all sizes include margins, padding, and border spaces.

TYPE: number

DEFAULT: 120

### padding

The padding property sets the spacing between the content and the data. On every depth that is recursed the default behavious is to split the padding space. This can be overridden by providing multiple Options objects (each object representing the settgins for that depth level - refer to maxDepth re discussion on depth)

TYPE: number

DEFAULT: 2

### print

The print property allows for automatic printing of the console during initialization of the object. Calling print after the object is constructes is not needed.

> Please note that print is an async function. There is no await option when creating the object through this option. If it is needed to wait for the print to complete it is advised to use the print function after creation.

TYPE: boolean

DEFAULT: false

### size

The size function sets the size of the Table as a whole. This will also automatically set the size of the table to fixed (unless fixed is set to false).

The size will always be the size set in this property unless the Table size is changed afterwards to a value lower than the size value (in which case size will be 0)

> Please note that if fill option is not needed and content is smaller than table size, a smaller table will be printed. If the table should take up the entire size, the set fill to true.

TYPE: number

DEFAULT: -1

### stream

If the table will continuously receive data that must be printed as it is received the stream property should be set to true. This will only print the last received row as far as possible. If this is not set, the data will always be printed normally regardless whether the stream function is used or not.

Using stream function when the stream option is not set will have the result that the whole table is printed on each call to stream.

TYPE: boolean

DEFAULT: false

### tabSize

Is the size that should be used for tab characters.

TYPE: number

DEFAULT: 2

## Exposed Functions

### colChanged

Is called if the collumns have changed in any way and a reprint of the entire table is needed.

PARAMS: none

### updateBorders

Is called after the borders have been changed. This should be called for borders to work correctly if borders are changed manually.

PARAMS: none

### addData

Is called to add multiple rows at the same time

PARAMS:

-   data: any[] | string | boolean | number | object

### addRow

Is called to add a single row to the Table

PARAMS:

-   data: any[] | string | boolean | number | object

### deleteRow

Is called to delete a specific row at the given index number in the table.

PARAMS:

-   index: number

### print

Is called to print out the entire table (please note that having stream set to true will have a different effect than having it set tot false).

ASYNC

PARAMS: none

### stream

Is called to add (if data is provided) data to the table and then to print it out automatically.

Please note that the added data is passed through addData function. Note that some entries might be calculated as multiple rows, whiles others could be interpreted as multiple columns. If multiple rows are interpreted as multiple columns please wrap each value as arrays. i.e. [1, 'text', true] will be considerd as multiple columns, while [ 'text', 'text', 'text' ] will be interepreted as multiple rows. to fix the last use [['text'],['text'], ['text']]. Or alternatively add the data through addRow function and calling stream afterwards.

ASYNC

PARAMS

-   data(optional): any[] | string | boolean | number | object

## Contributions

Any contributions are welcome.
