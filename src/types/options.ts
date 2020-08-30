import { Options as boksOptions } from 'boks';

export { boksOptions };
export enum emojiLevel {
	none = 0,
	all = 1,
	med = 2,
	low = 3,
}

export type Options = {
	/**
	 * Set the alignment for the content inside the column.
	 */
	align?: Alignment;
	/** Determine if and how borders should be printed. */
	borders?: borderOptionTypes | boksOptions[] | false;
	/**
	 * used when columns is defined:
	 * If true, columns not defined in columns option will alsow be added.
	 * Else, only columns specified in columns option will be added to table.
	 * Default is false if columns options is used, else true.
	 */
	canGrow?: boolean;
	/**
	 * If set and a column name is only a number (for instance in case of an array object),
	 * the pattern will be used to generate a display name.
	 * (~D is used as current number placeholder,
	 * if no placeholder is found, one will be added at end of pattern).
	 * If the column names should not be altered, set value to empty string, or false.
	 * @default col-~D
	 */
	columnPattern?: string | boolean;
	/**
	 * Store column information and can be:
	 * STRING ARRAY - containing the names of each column;
	 * NUMBERS ARRAY - containint the size of each column (size if 1>= and percentage <1);
	 * columnProperty ARRAY - containing column Property information for each column;
	 * columnProperties Object.
	 */
	columns?: string[] | number[] | columnProperties | columnProperty[];
	/**
	 * The level of complexity calculating emoji string sizes.
	 * all: will attempt to convert the most complex emoji string to a single character.
	 * med: will attempt to calculate the string size based on destructuring and be cognesent of EF0F
	 * low:  will attempt to calculate the string size based purely on destructuring.
	 * none: will calculate the actual characters in string (string.length).
	 * @default all
	 */
	eLevel?: emojiLevel;
	/** If set to true, no headers will be printed with the data */
	excludeHeader?: boolean;
	/**
	 * If true, fills the table to its max or set size.
	 * else table will only be filled to wrap the actual data size.
	 * @default false
	 */
	fill?: boolean;
	/**
	 * If true and data type is object, the column names will be the object keys.
	 * Else the columns will be "key" and "value".
	 * if data is an array of objects the data will always be flatten,
	 * with each object representing a new row.
	 * @default false
	 */
	flatten?: boolean;
	/**
	 * Set the alignment for the header of the column.
	 * Inherit the value from align if not set.
	 */
	headAlign?: Alignment;
	/**
	 * If true, all rows including empty rows will be printed,
	 * else only rows with data will be printed.
	 * @default false
	 */
	inclusive?: boolean;
	/**
	 * The spacing from the left corner of the screen.
	 * @default 2
	 */
	margin?: number;
	/**
	 * The depth of the object to print out
	 * (i.e. if column value is object and depth is 2, a table will be printed inside the column)
	 * The maximum is 3
	 * @default 1
	 */
	maxDepth?: number;
	/**
	 * sets the maximum size of the table.
	 * @default 120
	 */
	maxSize?: number;
	/**
	 * a padding to use whithin each column
	 * @default 2
	 */
	padding?: number;
	/**
	 * If true, will automatcially print the object after initialization.
	 */
	print?: boolean;
	/**
	 * The set size of the table.
	 * Unlike maxSize, this will force the size to fill if set.
	 * Will also overrids maxSize if set.
	 */
	size?: number;
	/**
	 * wheather the object should be printed as a continuous stream (if true), or once of table.
	 * @default false
	 */
	stream?: boolean;
	/**
	 * The amount of spaces required for a tab character.
	 * @default 2
	 */
	tabSize?: number;
};

export type borderOptionTypes = boksOptions | combinedBorders | BorderTypes;

export type intOptions = {
	borders: combinedBorders;
	maxSize: number;
	padding: number;
	margin: number;
	tabSize: number;
	flatten: boolean;
	maxDepth: number;
	stream: boolean;
};
export type combinedBorders = {
	content: boksOptions | false;
	header: boksOptions | false;
	headPure?: boksOptions | false;
};

export type columnProperty = {
	name: string;
	printName?: string;
	align?: Alignment;
	headAlign?: Alignment;
	order?: number;
	minSize?: number;
	maxSize?: number;
	size?: number;
	fixed?: boolean;
};
export type columnProperties = {
	[key: string]: columnProperty | number | boolean | string;
};

export type columnSize = {
	/** the minimum size of a column */
	minSize?: number;
	/** the maximum size of a column */
	maxSize?: number;
	/**
	 * print size. (a figure below 1 will be considered as percentage of the table size).
	 */
	size?: number;
	/**
	 * If true, the size will not change on recalibration.
	 * @default false
	 */
	fixed?: boolean;
};

export enum Alignment {
	left = 'left',
	center = 'center',
	right = 'right',
}
export type DataTypes = string[][] | Record<string, unknown>;

export enum BorderTypes {
	/** no borders */
	none = 'none',
	/** bold outerborer, normal inner lines for both header and content. */
	boldSingle = 'boldSingle',
	/** bold outerborder, normal innter lines for header and no content borders */
	boldSingleTop = 'boldSingleTop',
	/** all bold lines for header and content */
	bold = 'bold',
	/** all single lines for header and content */
	single = 'single',
	/** bold lines for header and normal lines for content */
	boldTopSingle = 'boldTopSingle',
	/** bold header with no content borders. */
	boldTop = 'boldTop',
	/** single lines for header with no content borders */
	singleTop = 'singleTop',
}
