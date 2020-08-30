import { BordersExtended, templates, borders as boksBorders, getBorder } from 'boks';
import readline from 'readline';
import * as Events from './events';
import { BaseData } from './baseData';
import { ColumnData } from './columnData';

// eslint-disable-next-line object-curly-newline
import {
	Options,
	boksOptions,
	combinedBorders,
	BorderTypes,
	columnProperty,
	columnProperties,
	Alignment,
	emojiLevel,
	// eslint-disable-next-line object-curly-newline
} from '../types/options';
import { ColumnInfo, colOptions } from './columnInfo';
import { fillSpace, isNum, getStringSize, fillLine } from './helper';
import { CombinedInfo } from './combinedInfo';

const states = {
	NONE: 0,
	ADDDATA: 1,
	ADDROW: 2,
	SETRATIO: 4,
	BUILDHEADER: 8,
};

const actions = {
	NONE: 0,
	RESIZE: 1,
	HEADER: 2,
};

export class Table extends BaseData {
	// #region variables
	// DATA -------------------------------------------------------------------
	// --> ARRAY values  xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
	/**
	 * Lines that has been included in the output values.
	 */
	private lnes: lineObjects[] = [];

	/**
	 * Newly accepted data that has not yet been parsed to lines.
	 * If parsed it will be moved to rawData
	 */
	private newData: rawDataObject[] = [];

	/**
	 * New lines that has been parsed from newData,
	 * but not yet included in output values.
	 */
	private newLines: lineObjects[] = [];

	/** The raw data which has already been parsed to lines (per column) */
	private rawData: rawDataObject[] = [];

	// --> COLUMN values xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
	/**
	 * Readonly variable containing alignment preference for the col data.
	 * @readonly
	 */
	private readonly colAlign: Alignment;

	/**
	 * Readonly variable containing alignment preference for the header data.
	 * @readonly
	 */
	private readonly colHeadAlign: Alignment;

	/**
	 * A readonly variable containing the column Pattern that should be used for numbered columns.
	 * columnPattern should have a ~D value in the string to indicate where the number
	 * should be placed if any.
	 * @readonly
	 * @default col-~D
	 */
	private readonly columnPattern: string;

	/**
	 * An object containing the information regarding all columns.
	 * @public
	 */
	cols: colProperties = {};

	/**
	 * The combinedSet of column informations.
	 * This combined unnamed columns with named columns.
	 */
	private combined: { [key: string]: CombinedInfo } = {};

	/**
	 * A quick reference to all column names as it will appear during print.
	 * Note that numbered collums will be an empty string.
	 */
	private keys: string[] = [];

	/**
	 * An sorted array of the combined columns.
	 * @public
	 */
	sortedCols: CombinedInfo[] = [];

	// --> STRING values xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
	/**
	 * If value is a string it represents the header string.
	 * Else it could only be false indicating that no header should be printed.
	 */
	private head: false | string = '';

	/**
	 * Variable storing the last printed header.  Mostly used with streams
	 * and indicate if a total reprint of the table is required (if table has changed).
	 */
	private oldHeader: false | string = '';

	/**
	 * A stored variable contaning the 'value' which was already printed to the console.
	 * This variable is used if stream is true and to keep track of lines to remove.
	 */
	private oldVal = '';

	/** A string variable of empty spaces to the same size of a padding unit. */
	private padString = '';

	/**
	 * The current value of all the rows in the table concatenated to a string.
	 */
	private val = '';

	// BORDERS ----------------------------------------------------------------
	/**
	 * the borders that should be used for the table
	 * @readonly
	 */
	readonly borders: combinedBorders = {
		content: false,
		header: false,
	};

	/** The bottom Border. */
	private bottomBorder = '';

	/**
	 * A variable storing the the size of the left most border (if any).
	 * It Consider both header & content border.
	 */
	private lBorder = 0;

	/**
	 * A variable storing the size of the right most border (if any).
	 * It Consider both header & content border.
	 */
	private rBorder = 0;

	/**
	 * The row separator border.
	 */
	private separator = '';

	/**
	 * A variable storing the size of the horizontal border (if any).
	 * It Considers both header & content borders.
	 */
	private vBorder = 0;

	// size -------------------------------------------------------------------
	/**
	 * A stored value for the largest contentsize of all the columns combined.
	 * Mostly used in cases where the table is not flat (i.e. header | data => horizontal flow)
	 */
	private contMax = 0;

	/**
	 * A readonly variable if true, will fill all the columns to fit the maximum table size.
	 * Maximum table size will be the initial set maximum size, or the set size.
	 * If false, columns will wrap the content, and table size could be less than the size given.
	 * @default false
	 * @readonly
	 */
	private readonly fill: boolean;

	/**
	 * A stored value for the largest header size of all the columns combined.
	 * Mostly used in cases where the table is not flat (i.e. header | data => horizontal flow)
	 */
	private headMx = 0;

	/**
	 * A readonly variable storing the margin size.
	 * Margin size is the spacing on the left of the entire table.
	 * @readonly
	 */
	private readonly margin: number;

	/**
	 * The size for the padding of each collumn.
	 * Padding is the spacing between the Vertical border and the content.
	 */
	private padSize = 0;

	/**
	 * Indicate the ratio that is used if table is not flat (i.e. header | data => horizontal flow
	 * If ratio is 0, it means that header will be ontop and data below => vertical flow.
	 * If more than 1 data rows exist, ratio will cahnge to 0.
	 * @default 1
	 */
	private rat = 1;

	/**
	 * A readonly variable storing the size a tab character will have.
	 * @default 2
	 * @readonly
	 */
	private readonly tabsize: number;

	// DEPTH ------------------------------------------------------------------
	/**
	 * A readonly number variable indicating the maximum depth the data could traverse
	 * @default 3
	 * @readonly
	 */
	private readonly maxdepth: number;

	// STATE ------------------------------------------------------------------
	/**
	 * Indicate what action needs to be taken.
	 * this is a bitwise number.
	 */
	private action = actions.NONE;

	/**
	 * If true will include all rows supplied (result in empty rows),
	 * else will only include rows that has data inside.
	 * @default false
	 */
	private all = false;

	/**
	 * If true new columns can be added later, else the columns are fixed to the intial set.
	 * The initial set could either be the initial data received or columns received.
	 * If no data or column information is received during construction of table, this will be true.
	 * @default true
	 * @readonly
	 */
	private readonly canGrow: boolean = true;

	/**
	 * A readonly variable:
	 * If true, columns will be aligned horizontally next to each other.
	 * If false, columns will be aligned vertically below each other.
	 */
	private readonly flat: boolean;

	readonly isTable = true;

	/**
	 * Indicate a fluid state of the table.
	 * This is a bitwise number.
	 */
	private state = states.NONE;

	/**
	 * If true the table will print and store information to continously receive data.
	 * Else the data will be reprinted completely on each run.
	 * @default false
	 * @readonly
	 */
	private readonly streaming: boolean;

	/**
	 * A variable mostly used during streaming and
	 * if true, indicates that the table should be completely reprinted
	 */
	private valueReset = false;

	// OPTIONS ---------------------------------------------------------------
	/**
	 * A readonly emojiLevel variable to use when calculating string sizes.
	 * @readonly
	 */
	private readonly eLevel: emojiLevel;

	/**
	 * The options that should be set on data of the next depth.
	 * (i.e. columns that has objects as value)
	 */
	private nextOption: Options[];
	// #endregion variables

	// #region  properties
	// HEADER PROPERTIES ========
	/**
	 * Get or set the header element, and should be prefered over calling head variable.
	 * If a string is returned it represents the value for the header component.
	 * Else false will be returned indicating that no header should be printed.
	 */
	private get header(): string | false {
		if (this.head !== false && this.isFlat) return this.head;
		const border = this.buildBorder(this.borders.content, 0);
		if (border) return `${border}\n`;
		return '';
	}

	private set header(val: string | false) {
		/* istanbul ignore if: if not run in tests - safety. */
		if (this.head === false) return;
		this.head = val;
	}

	/** Get or Set the size of the largest header in the Table. */
	private get headMax(): number {
		return this.headMx;
	}

	private set headMax(val: number) {
		const v = Math.max(val, 0);
		this.headMx = v;
		this.sortedCols.forEach(col => {
			const c = col;
			c.headerExternal = v;
		});
	}

	// BORDER PROPERTIES =====
	/** Get the Vertical border for the content section. */
	private get contentVBorder(): string {
		return this.fixBorderSpace(
			this.borders.content ? this.borders.content.vertical || '' : '',
			this.vBorder,
		);
	}

	/**	Get the Vertical border for the Header section. */
	private get headerVBorder(): string {
		let border = '';
		const { borders, isFlat: flat, vBorder } = this;
		const { header, content, headPure: headerPure } = borders;
		const head = flat || headerPure === false ? header : headerPure || header;
		if (head) {
			border = head.vertical;
			if (!border && !flat) border = head.right || '';
		}
		if (!border && !flat && content) border = content.left || '';
		return this.fixBorderSpace(border, vBorder);
	}

	// OUTPUT ==========
	/**
	 * Get an Array of lines (string values) for each row.
	 */
	get lines(): string[] {
		if (this.action & actions.RESIZE || this.newData.length > 0) this.buildLines();
		const lines = [...this.lnes, ...this.newLines].reduce(
			(val: string[], current: lineObjects): string[] => {
				val.push(...current.value);
				return val;
			},
			[],
		);
		if (lines.length > 0 && this.head && this.deep > 1) {
			const head = this.head.split('\n');
			lines.unshift(...head);
		}
		return lines;
	}

	/**
	 * Get the string value of the table.
	 * @public
	 */
	get value(): string {
		this.getValue();
		const { header, oldVal, bottomBorder, val, valueReset } = this;
		return (valueReset ? header + val : oldVal) + bottomBorder;
	}

	// SIZE RELATED PROPERTIES =====
	/** Get the Maximum size (width) of the data (either added together, or stacked). */
	get maxData(): number {
		const { isFlat: flat, padding, vBorder } = this;
		const spacer = padding * 2 + vBorder;
		if (flat) {
			return this.sortedCols.reduce((max, combined, idx) => {
				const { maxSize: current } = combined;
				/* istanbul ignore if: should never be run - safety */
				if (current <= 0) return max;
				return max + current + (idx > 0 ? spacer : 0);
			}, 0);
		}
		const { headMx, contMax } = this;
		if (headMx === 0 && contMax === 0) return 0;
		return Math.max(headMx, 1) + Math.max(contMax, 1) + spacer;
	}

	/**
	 * Get or set the padding inside the table.
	 * Padding is between the border and the content.
	 */
	get padding(): number {
		return this.padSize;
	}

	set padding(val: number) {
		if (val === this.padSize) return;
		this.padSize = Math.max(0, val);
		this.padString = fillSpace(this.padSize);
		// fix current values
		const keys = Object.keys(this.cols);
		keys.forEach(key => this.cols[key].changeSpace(this.padSize, this.vBorder));
		this.colChanged();
		this.action |= actions.RESIZE + actions.HEADER;
	}

	/**
	 * Get or set the Ratio in which header and columns should appear.
	 * This is only used if header - column flow is horizontal (not flat) [ header | data ]
	 */
	private get ratio(): number {
		return this.rat;
	}

	private set ratio(val: number) {
		const v = Math.max(0, val);
		if (this.rat === v || v > 1) return;
		const { rat: old } = this;
		this.rat = val;

		this.sortedCols.forEach(col => {
			const c = col;
			c.ratio = this.rat;
		});
		/**
		 * only change in extreme case... else will be changed through events if needed
		 * and through above itteration.
		 */
		if ((v > 0 && old === 0) || (v === 0 && old > 0)) this.colChanged();
	}

	/**
	 * Get a value by which the size of the table should be reduced by to get to a printable
	 * size.  This therefore exclud margin, outer borders and outer paddings.
	 */
	protected get sizeAdjuster(): number {
		return this.deep === 1 ? this.margin + this.lBorder + this.rBorder + this.padding * 2 : 0;
	}

	/**
	 * Get the space available for the content of the table.
	 * This excludes margin, outer borders and outer paddings.
	 */
	get space(): number {
		const { setSize, sizeAdjuster, maxsize } = this;
		if (setSize === 0) return 0;
		const ignore = sizeAdjuster;
		if (setSize > 0 || maxsize < 0) {
			let { size } = this;
			size -= size > ignore ? ignore : size;
			return size;
		}
		// remove outer paddings from maxsize variable (setSize === -1)
		const max = maxsize <= ignore ? 0 : maxsize - ignore;

		if (!this.isFlat) return max;
		const { vBorder, padding } = this;
		let size = 0;
		let perc = 0;
		let percMax = 0;
		let cntr = -1;
		this.sortedCols.forEach(col => {
			const { maxContent, maxHeader, setsize } = col;
			const sz = Math.max(maxContent, maxHeader, 0);
			if (setsize > 0 && setsize < 1) {
				perc += setsize;
				percMax += sz;
			} else size += sz;
			cntr++;
		});
		if (perc && perc < 1) {
			const percSz = size / (1 - perc) - size;
			if (percSz < percMax) size = Math.floor(percMax / perc);
			else size += Math.floor(percSz);
		}
		return Math.min(max, size + Math.max(0, cntr) * (padding * 2 + vBorder));
	}

	// GENERAL PROPERTIES =====
	/**
	 * Get or Set whether empty rows should be printed.
	 * If true, empty rows will be printed, else all empty rows will not be printed.
	 * @default false
	 */
	get inclusive(): boolean {
		return this.all == null ? false : this.all;
	}

	set inclusive(val: boolean) {
		if (val === this.all) return;
		this.all = val;
		this.redoData();
	}

	/**
	 * Get the column alignment style:
	 * if true the columns should show horizontally [col 1 | col 2 ...];
	 * else the columns should show vertically [ col 1 | data for col 1 ].
	 * NOTE: if set to false and there are more than 1 row in the table, the table
	 * will consider it not to be flat (i.e. resume horizontal printing.)
	 * @default false
	 */
	get isFlat(): boolean {
		if (!this.flat && this.rawData.length + this.newData.length <= 1) return false;
		return true;
	}

	/**
	 * Get the total number of rows in the table.
	 * NOTE: there might be more lines as a row might be spread across multiple lines.
	 */
	get totalRows(): number {
		return this.rawData.length + this.newData.length;
	}

	// #endregion properties

	/**
	 * Initializer of a Table object.
	 * @param data A data Object if available.
	 * @param options The Options to be used by the table.
	 */
	constructor(
		data?:
			| (string | number | object)[]
			| (string | number | object | (string | number)[])[][]
			| object,
		options?: Options | Options[],
	);

	/**
	 * Internal initializer of a table object.
	 * @internal
	 * @param options The Options to be used by the table.
	 * @param data A data Object if available.
	 * @param depth The current depth of the table.
	 * @param key The column key where this table will be placed
	 * @param row The row number where this table will be placed.
	 */
	constructor(
		data?:
			| (string | number | object)[]
			| (string | number | object | (string | number)[])[][]
			| object,
		options?: Options | Options[],
		depth?: number,
		key?: string,
		row?: number,
	);

	constructor(
		data:
			| (string | number | object)[]
			| (string | number | object | (string | number)[])[][]
			| object = {},
		options: Options | Options[] = {},
		/** The depth (in the data structure) of the current Table */
		private readonly deep = 1,
		key = '',
		row = -1,
	) {
		super(key.toString(), row, options, deep);
		const currOption: Options = (Array.isArray(options) ? options.shift() : options) || {};
		let defaultNext: Options = {};

		// GET ALL PROPERTIES ----
		const { maxDepth, eLevel, fill, borders, inclusive, align, headAlign } = currOption;
		const { size, margin, tabSize, padding, flatten, excludeHeader, stream } = currOption;
		const { columns, columnPattern, canGrow, print } = currOption;

		// BORDERS -----
		if (borders != null) {
			this.setBorders(borders as unknown);
		} else {
			this.setBorders({
				content: { ...templates.single },
				header: {
					...templates.single,
					bottom: boksBorders.HorizontalLines.double,
					bottomLeft: boksBorders.LeftIntersect.doubleSingle,
					bottomIntersect: boksBorders.Intersect.doubleSingle,
					bottomRight: boksBorders.RightIntersect.doubleSingle,
				},
				headPure: {
					...templates.single,
					bottomIntersect: boksBorders.BottomIntersect.singleDouble,
					topIntersect: boksBorders.TopIntersect.singleDouble,
					vertical: boksBorders.VerticalLines.double,
					intersect: boksBorders.Intersect.singleDouble,
				},
			});
			const { content, headPure, header } = this.borders;
			defaultNext.borders = {
				content: {
					...content,
					horizontal: boksBorders.HorizontalLines.none,
				},
				headPure: {
					...headPure,
					horizontal: boksBorders.HorizontalLines.none,
				},
				header: {
					...header,
					horizontal: boksBorders.HorizontalLines.none,
				},
			};
		}

		// GENERAL ----
		this.maxdepth = maxDepth != null ? Math.max(1, maxDepth) : 3;
		this.eLevel = eLevel || emojiLevel.all;
		this.fill = fill != null && deep === 1 ? fill : false;
		this.all = inclusive;
		this.colAlign = align || Alignment.left;
		this.colHeadAlign = headAlign || Alignment.left;
		this.flat = flatten || false;
		this.header = excludeHeader ? false : '';

		// SIZING ----
		if (size > -1) this.size = size;
		this.padding = padding != null ? Math.max(padding, 0) : 2;
		this.margin = Math.max(margin != null ? margin : 2, 0);
		this.tabsize = tabSize != null ? Math.max(tabSize, 0) : 2;
		this.streaming = (stream && this.deep === 1) || false;

		delete currOption.maxSize;
		defaultNext = {
			...currOption,
			...defaultNext,
			maxDepth: this.maxdepth,
			eLevel: this.eLevel,
			padding: Math.max(Math.round(this.padding / 2), 1),
			margin: 0,
			stream: false,
		};

		// NEXT SET OF OPTIONS ----
		// delete non-transferable options.
		delete defaultNext.columns;
		if (Array.isArray(options) && options.length > 0) {
			let next = options.shift();
			if (next === false) {
				next = {
					stream: false,
					maxDepth: this.maxdepth,
					eLevel: this.eLevel,
				};
			} else {
				next = {
					...defaultNext,
					...next,
				};
			}
			this.nextOption = [next];
			if (options.length > 0) this.nextOption.push(...options);
		} else this.nextOption = [defaultNext];

		// COLUMN INFO ----
		if (columnPattern != null) {
			if (typeof columnPattern === 'boolean') {
				this.columnPattern = columnPattern ? 'col-~D' : '';
			} else if (columnPattern && !/~D/.test(columnPattern)) {
				this.columnPattern = `${columnPattern}~D`;
			} else this.columnPattern = columnPattern || 'col-~D';
		}

		if (columns != null) {
			this.addColumns(columns);
			this.canGrow = canGrow != null ? canGrow : false;
		}

		// DATA ----
		const skipAdd =
			data == null ||
			(Array.isArray(data) && data.length === 0) ||
			(typeof data === 'object' && Object.keys(data).length === 0);
		if (!skipAdd) {
			this.addData(data);
			if (canGrow != null && this.canGrow) this.canGrow = currOption.canGrow;
		}

		// FINALIZE ----
		if (data && print) this.print();
		else if (this.deep > 1) {
			this.action = actions.RESIZE + actions.HEADER;
			this.buildLines();
		}
	}

	// #region event handlers -------------------------------------------------
	/**
	 * Is called by a CombinedInfo (column) object
	 * when the maximum size of the column has changed.
	 * @param info The combinedInfo object that triggered a maximum size change event.
	 */
	private maxEventListener = (info: CombinedInfo): void => {
		if (info.maxContent > info.size) this.action |= actions.RESIZE;
	};

	/**
	 * Is called by a CombinedInfo (column) object
	 * when the lines ('header') of the column has changed.
	 * @param itm The combinedInfo object that triggered a line change event.
	 */
	private lineEventListener = (itm: CombinedInfo): void => {
		// if ratio - then all data need to change, else only the header has changed.
		if (itm.ratio > 0) this.colChanged();
		else if (!(this.state & states.SETRATIO)) this.action |= actions.HEADER;
	};

	/**
	 * Is called by a CombinedInfo (column) object
	 * when the ratio (header / data) of the column has changed.
	 */
	private ratioEventListener = (): void => {
		this.action |= actions.RESIZE + actions.HEADER;
	};

	/**
	 * Is called by a CombinedInfo (column object)
	 * when the size of the column has changed.
	 * @param info The CombinedInfo object that triggered a change in size event.
	 */
	private sizeEventListener = (info: CombinedInfo): void => {
		const { name, name2 } = info;
		const size = info.contentSize;

		const addToData = (data: rawDataObject): void => {
			const d = data;
			if (d[name]) d[name].size = size;
			if (d[name2]) d[name2].size = size;
		};

		this.newData.forEach(addToData);

		this.rawData.forEach(addToData);
	};

	// #endregion event handlers ----------------------------------------------

	// #region private functions
	// --> BORDERS xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
	/**
	 * Make sure a Vertical border fits a specified size (if custom borders is used)
	 * @param border The border to fix spacing for.
	 * @param size The size the border should be
	 */
	private fixBorderSpace(border: string, size: number): string {
		const borderSize = getStringSize(border);
		const diff = size - borderSize.size;
		if (diff > 0) {
			/* istanbul ignore else: only safety for thicker borders than usual */
			if (diff === 1) return `${border} `;
			/* istanbul ignore next: never ran - extra thick borders  - safety */
			const left = Math.floor(diff / 2);
			/* istanbul ignore next: never ran - extra thick borders  - safety */
			return fillSpace(left) + border + fillSpace(diff - left);
		}
		return border;
	}

	/**
	 * Set the border types for the current table.
	 * @param brdrs The border options to add.
	 */
	private setBorders(brdrs: boksOptions | boksOptions[] | combinedBorders | BorderTypes): void {
		if (!brdrs) {
			this.borders.header = false;
			this.borders.content = false;
			return;
		}
		let header: BordersExtended | false = false;
		let content: BordersExtended | false = false;
		let headPure: BordersExtended | false;
		if (typeof brdrs === 'string') {
			switch (brdrs) {
				case BorderTypes.bold:
					header = { ...templates.bold };
					content = { ...templates.bold };
					headPure = { ...templates.bold };
					break;
				case BorderTypes.boldSingle:
					header = {
						...templates.bold,
						vertical: boksBorders.VerticalLines.line,
						horizontal: boksBorders.HorizontalLines.line,
						intersect: boksBorders.Intersect.line,
						bottomIntersect: boksBorders.BottomIntersect.boldSingle,
						topIntersect: boksBorders.TopIntersect.boldSingle,
					};
					headPure = {
						...templates.bold,
						intersect: boksBorders.Intersect.singleBold,
						horizontal: boksBorders.HorizontalLines.line,
						leftIntersect: boksBorders.LeftIntersect.singleBold,
					};
					content = {
						...templates.bold,
						vertical: boksBorders.VerticalLines.line,
						horizontal: boksBorders.HorizontalLines.line,
						intersect: boksBorders.Intersect.line,
						bottomIntersect: boksBorders.BottomIntersect.boldSingle,
						topIntersect: boksBorders.TopIntersect.boldSingle,
						leftIntersect: boksBorders.LeftIntersect.singleBold,
						rightIntersect: boksBorders.RightIntersect.singleBold,
					};
					break;
				case BorderTypes.boldSingleTop:
					header = {
						...templates.bold,
						horizontal: boksBorders.HorizontalLines.line,
						vertical: boksBorders.VerticalLines.line,
						topIntersect: boksBorders.TopIntersect.boldSingle,
						bottomIntersect: boksBorders.BottomIntersect.boldSingle,
					};
					content = { ...templates.empty };
					headPure = {
						...templates.bold,
						horizontal: boksBorders.HorizontalLines.line,
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						intersect: boksBorders.RightIntersect.singleBold as any,
						leftIntersect: boksBorders.LeftIntersect.singleBold,
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						bottomIntersect: boksBorders.BottomRightBorder.bold as any,
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						topIntersect: boksBorders.TopRightBorder.bold as any,
					};
					break;
				case BorderTypes.boldTop:
					header = { ...templates.bold };
					content = { ...templates.empty };
					headPure = {
						...templates.bold,
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						intersect: boksBorders.RightIntersect.bold as any,
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						bottomIntersect: boksBorders.BottomRightBorder.bold as any,
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						topIntersect: boksBorders.TopRightBorder.bold as any,
					};
					break;
				case BorderTypes.boldTopSingle:
					header = { ...templates.bold };
					content = { ...templates.single };
					headPure = { ...templates.bold };
					break;
				case BorderTypes.single:
					header = { ...templates.single };
					content = { ...templates.single };
					headPure = { ...templates.single };
					break;
				case BorderTypes.singleTop:
					header = { ...templates.single };
					content = { ...templates.empty };
					headPure = {
						...templates.single,
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						topIntersect: boksBorders.TopRightBorder.line as any,
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						intersect: boksBorders.RightIntersect.line as any,
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						bottomIntersect: boksBorders.BottomRightBorder.line as any,
					};
					break;
				default:
					header = { ...templates.empty };
					content = { ...templates.empty };
					// eslint-disable-next-line no-useless-return
					break;
			}
		} else if ((brdrs as combinedBorders).header || (brdrs as combinedBorders).content) {
			({ header, content, headPure } = { ...(brdrs as combinedBorders) });
		} else if (Array.isArray(brdrs)) {
			[header = false, content = false, headPure] = brdrs;
			if (header) header = { ...header };
			if (content) content = { ...content };
			if (headPure) headPure = { ...headPure };
		} else {
			header = { ...(brdrs as boksOptions) };
			content = { ...(brdrs as boksOptions) };
		}
		if (headPure == null && header) headPure = { ...header };
		if (header === false) header = { ...templates.empty };
		if (content === false) content = { ...templates.empty };
		[this.borders.header, this.borders.content] = getBorder([header, content]);
		this.borders.headPure = headPure;

		this.updateBorders();
	}

	/**
	 * Build a horizontal line.
	 * @param border the borders to add
	 * @param borderType Which border to get (0 = top, 1 = middle, 2 = bottom)
	 */
	private buildBorder(border: false | boksOptions, borderType: 0 | 1 | 2): string {
		let answer = '';
		if (!border) return answer;
		let left: false | string = '';
		let flat: false | string = '';
		let flat2: false | string = '';
		let middle: false | string = '';
		let right: false | string = '';
		const { isFlat } = this;
		const { headPure: headerPure, content, header } = this.borders;
		const excludeHead = this.head === false;
		const head = excludeHead ? false : headerPure != null ? headerPure : header;

		switch (borderType) {
			case 1:
				if (!isFlat) {
					left = head ? head.leftIntersect : '';
					/* istanbul ignore next: :'' never called */
					right = content ? content.rightIntersect : '';
					/* istanbul ignore next: :'' never called */
					flat = content ? content.horizontal : '';
					flat2 = head ? head.horizontal : '';
					/* istanbul ignore else: content was always available */
					if (!excludeHead) {
						/* istanbul ignore next: :'' never called */
						middle = head ? head.intersect : '';
						if (!middle && content && content.intersect) {
							middle = content.intersect;
						}
					} else middle = content ? content.leftIntersect || '' : '';
				} else {
					right = border.rightIntersect;
					left = border.leftIntersect;
					flat = border.horizontal;
					middle = border.intersect;
				}
				break;
			case 2:
				if (!isFlat) {
					left = head ? head.bottomLeft : '';
					/* istanbul ignore next: :'' never called */
					right = content ? content.bottomRight : '';
					/* istanbul ignore next: :'' never called */
					flat = content ? content.bottom : '';
					flat2 = head ? head.bottom : '';
					/* istanbul ignore else: content was always available */
					if (!excludeHead) {
						/* istanbul ignore next: :'' never called */
						middle = head ? head.bottomIntersect : '';
						if (!middle && content && content.bottomIntersect) {
							middle = content.bottomIntersect;
						}
					} else middle = content ? content.bottomLeft || '' : '';
				} else {
					left = border.bottomLeft;
					right = border.bottomRight;
					flat = border.bottom;
					middle = border.bottomIntersect;
				}
				break;
			default:
				if (!isFlat) {
					left = head ? head.topLeft : '';
					/* istanbul ignore next: :'' never called */
					right = content ? content.topRight : '';
					/* istanbul ignore next: :'' never called */
					flat = content ? content.top : '';
					flat2 = head ? head.top : '';
					/* istanbul ignore else: content was always available */
					if (!excludeHead) {
						/* istanbul ignore next: :'' never called */
						middle = head ? head.topIntersect : '';
						if (!middle && content && content.topIntersect) {
							middle = content.topIntersect;
						}
					} else middle = content ? content.topLeft || '' : '';
				} else {
					left = border.topLeft;
					right = border.topRight;
					flat = border.top;
					middle = border.topIntersect;
				}
				break;
		}
		if (!flat && !flat2) return answer;
		/* istanbul ignore next: !flat & !middle is never tested */
		if (!left && !right && !flat && !middle) return answer;
		if (!left) left = ' ';
		if (!right) right = ' ';
		if (!flat) flat = ' ';
		if (!flat2) flat2 = ' ';
		/* istanbul ignore if: middle always exists */
		if (!middle) middle = ' ';
		const pad = fillSpace(this.padding, flat);
		let pad2 = fillSpace(this.padding, flat2);
		const spacer = (isFlat ? pad : pad2) + middle + pad;
		let H = 0;
		let C = 0;
		this.sortedCols.forEach(col => {
			if ((!col.hasContent && !this.inclusive) || col.size <= 0) return;
			if (isFlat) {
				const { size } = col;
				if (answer !== '') answer += spacer;
				answer += fillSpace(size, flat as string);
				return;
			}
			H = Math.max(H, col.headerSize);
			C = Math.max(C, col.contentSize);
		});
		if (H === 0 && C === 0 && !answer) return '';
		if (!isFlat) {
			if (excludeHead) {
				H = 0;
				left = middle;
				pad2 = pad;
				answer = fillSpace(C, flat);
			} else answer = fillSpace(H, flat2) + spacer + fillSpace(C, flat);
		}
		if (this.deep <= 1) {
			answer = fillSpace(this.margin) + left + (isFlat ? pad : pad2) + answer + pad + right;
		}
		return answer;
	}

	// --> BUILDERS xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
	/**
	 * Build the header component for the table.
	 */
	private buildHeader(): void {
		if (this.head === false || this.state & states.BUILDHEADER) return;
		const { isFlat: flat, deep, padString, headerVBorder, borders, margin, lBorder } = this;
		if (!flat) {
			this.header = '';
			return;
		}

		this.state |= states.BUILDHEADER;
		const headSpacer = padString + headerVBorder + padString;

		let max = 1;
		let line = '';
		const buildCol = (col: CombinedInfo, indx: number): void => {
			if (col.size <= 0 || (!col.hasContent && !this.inclusive)) return;
			const colLine = col.lines.length > indx ? col.lines[indx] : col.emptyHeader;
			line += (line !== '' ? headSpacer : '') + colLine;
			if (indx === 0) max = Math.max(col.lines.length, max);
		};

		const lines: string[] = [];

		for (let i = 0; i < max; i++) {
			line = '';
			this.sortedCols.forEach(col => buildCol(col, i));
			/* istanbul ignore else: if should always evaluate to true - safety */
			if (line) lines.push(line);
		}

		// get left spacing
		let border = '';
		border = borders.header ? borders.header.left || '' : '';
		border = this.fixBorderSpace(border, lBorder);

		const left = deep > 1 ? '' : fillSpace(margin) + border + padString;

		// get right spacing
		border = borders.header ? borders.header.right || '' : '';
		const right = deep > 1 ? '\n' : `${padString + border}\n`;
		this.header = deep > 1 ? '' : this.buildBorder(borders.header, 0);
		if (this.header) this.header += '\n';

		this.header += lines.reduce((prev, curr) => prev + left + curr + right, '');
		border = this.buildBorder(borders.header, 2);
		if (!border && borders.content) border = this.buildBorder(borders.content, 0);
		this.header += border ? `${border}\n` : '';
		this.state ^= states.BUILDHEADER;
	}

	/**
	 * Build the lines for the table.
	 * [Push new items into newLines array, and move data from newData to rawData Arrays]
	 */
	protected buildLines(): boolean {
		// DATA VALIDATION
		if (this.newData.length === 0) return false;
		if (this.action & actions.RESIZE) this.calcSize();
		if (this.action & actions.HEADER) this.buildMainComp();
		// SETUP
		const { isFlat: flat, padString: pad, headerVBorder, contentVBorder, deep, margin } = this;
		const { header, content } = this.borders;
		const { inclusive, separator, lBorder } = this;
		const excludeHead = this.head === false;
		const lines: lineObjects[] = [];
		// to be used in case of ratio (none flat column)
		const headSpacer = flat ? '' : pad + headerVBorder + pad;
		const contentSpacer = pad + (contentVBorder || '') + pad;
		// the rowLines to add as value
		let value: string[] = [];

		// CONSTRUCTION
		// Build Left Spacing
		let border = '';
		if (!flat) border = header ? header.left || '' : '';
		else border = content ? content.left || '' : '';
		border = this.fixBorderSpace(border, lBorder);

		const left = deep <= 1 ? fillSpace(margin) + border + pad : '';

		// Build right spacing
		border = content ? content.right || '' : '';
		const right = deep <= 1 ? pad + border : '';

		// fix values before start
		if (this.rawData.length === 0) {
			this.lnes = [];
			this.newLines = [];
			this.val = '';
		}

		// get starting index
		let startRow = this.rawData.length;
		if (this.newLines.length > 0) startRow = this.newLines[this.newLines.length - 1].index + 1;

		/**
		 * merge lines together and build the lines to be pushed onto the lines array.
		 */
		const buildLine = (info: colLineInfo[], lineNum: number): string => {
			let line = '';
			let hasData = false;
			for (let i = 0, len = info.length; i < len; i++) {
				const itm = info[i];
				/* istanbul ignore next: all cols will have content here - safety */
				if (itm.col.size <= 0 || (!itm.col.hasContent && !inclusive)) continue;
				// add content
				let tmpLine = itm.lines[lineNum] || itm.col.emptyContent;
				// add header if needs be
				if (!flat) {
					const tmpLine2 = excludeHead
						? ''
						: itm.col.lines[lineNum] || itm.col.emptyHeader;
					/* istanbul ignore next: tmpLine2.trim() never '' in test */
					if (tmpLine.trim() === '' && tmpLine2.trim() === '') continue;
					else hasData = true;
					if (!excludeHead) tmpLine = tmpLine2 + headSpacer + tmpLine;
				} else if (tmpLine.trim()) hasData = true;
				if (line !== '') line += contentSpacer;
				line += tmpLine;
			}
			return hasData || inclusive ? left + line + right : '';
		};

		/**
		 * Validate and construct each line and push it onto lines array.
		 */
		const pushLine = (info: colLineInfo[], max: number, index: number, cntr = 0): void => {
			for (let lne = 0; lne < max; lne++) {
				const line = buildLine(info, lne);
				/* istanbul ignore else: no else */
				if (line.trim()) value.push(line);
			}
			if (deep > 1 && separator && (index > 0 || cntr > 0) && value.length > 0) {
				value.unshift(separator);
			}
			lines.push({ index, value });
		};

		/**
		 * Orchastrate the construction of a lines array by deconstructing a data object.
		 */
		const createRowLines = (data: rawDataObject, idx: number): void => {
			let max = 0;
			// the index of the rowwLines
			const index = idx + startRow;
			const colInfo: colLineInfo[] = [];
			value = [];
			let cntr = 0;
			// set sizes
			this.sortedCols.forEach(col => {
				const { name, name2 } = col;

				const info: colLineInfo = {
					key: name,
					col: col,
					lines: [''],
				};
				// see if column exist on current row
				const hasData = data[name] || data[name2];
				if (!hasData && !inclusive) {
					colInfo.push(info);
					return;
				}
				const NAME = data[name] ? name : name2;
				info.lines = fillLine(hasData ? data[NAME].lines : [''], col);
				if (!flat) {
					value = [];
					max = Math.max(col.lines.length, info.lines.length);
					pushLine([info], max, index, cntr++);
				} else {
					max = Math.max(max, info.lines.length, col.lines.length);
					colInfo.push(info);
				}
			});

			if (flat) pushLine(colInfo, max, index);
		};

		this.newData.forEach(createRowLines);
		/* istanbul ignore else: no else */
		if (lines.length > 0) this.newLines.push(...lines);
		this.rawData.push(...this.newData);
		this.newData = [];
		return lines.length > 0;
	}

	/** Build the main "static" components ( borders, header ) */
	private buildMainComp(): void {
		this.action ^= actions.HEADER;
		const { content } = this.borders;
		this.bottomBorder =
			this.deep > 1 || (!content && this.head === false) ? '' : this.buildBorder(content, 2);
		this.separator = this.buildBorder(content, 1);
		this.buildHeader();
	}

	/**
	 * Is called after new data has been added to the table and
	 * the current rows of the table is more than one but was one before the add.
	 */
	private dataAddedRatioChange(): void {
		this.redoData();
		this.setRatio();
		this.action |= actions.RESIZE + actions.HEADER;
	}

	/**
	 * Builds the string value of for the table.
	 */
	private getValue(): string {
		if (this.val && this.newLines.length === 0 && this.newData.length === 0) return this.val;
		let result = '';
		this.buildLines();
		const { header, streaming, oldVal, oldHeader, separator } = this;
		// const resetVal = this.lnes.length === 0;

		if ((header !== false && header !== oldHeader && oldVal) || this.lnes.length === 0) {
			this.valueReset = true;
			this.val = '';
		}
		// try remove last new line character placed during last run.
		if (this.val) {
			const nChars = this.val.split('\n');
			/* istanbul ignore else: there always thould be n chars - safety */
			if (nChars.length > 0 && nChars[nChars.length - 1] === '') {
				nChars.pop();
				this.val = nChars.join('\n');
			}
		}
		if (this.valueReset || (streaming && !oldVal)) result = header || '';

		const buildLines = (line: lineObjects): void => {
			let tmpVal = '';
			line.value.forEach(lne => {
				tmpVal += tmpVal !== '' || this.val !== '' ? `\n${lne}` : lne;
			});
			this.val += tmpVal;
		};
		this.newLines.forEach((line, idx) => {
			if (line.value.length === 0) return;
			if (this.val !== '' && (idx > 0 || streaming)) {
				this.val += separator ? `\n${separator}` : '';
			}
			buildLines(line);
		});
		this.val += this.val !== '' ? '\n' : '';
		if (oldVal && this.val && !this.valueReset && separator) {
			this.val = `${separator}\n${this.val}`;
		}
		// const head = !streaming && !this.valueReset && header && !oldVal ? header : '';
		this.lnes.push(...this.newLines);
		this.newLines = [];
		return streaming || this.valueReset ? result + this.val : oldVal + this.val;
	}

	/**
	 * Is called when the table needs to be completely redone because of a change
	 * in the environment (i.e. sizing or ratio etc).
	 */
	private redoData(): void {
		if (this.rawData.length === 0) return;
		this.newData.unshift(...this.rawData);
		this.rawData = [];
	}

	// --> COLUMN FUNCTIONS xxxxxxxxxxxxxxxxxxxxx
	/**
	 * Adds columns for an entire row
	 * @param cols The columns inside a complete row.
	 */
	private addColumns(cols: (string | number | columnProperty)[] | columnProperties): void {
		let colKeys: string[];

		let prevKey = -1;
		let fixCombined = false;
		let newCol = false;

		// confirm if a new olumn may be added or not.
		const canProceed = (): boolean => (this.canGrow ? this.keys.length - 1 >= prevKey : false);

		const buildCombinedCols = (): void => {
			this.sortedCols = [];
			let max = this.headMax;
			this.keys.forEach((key: string, idx: number) => {
				const k = key || idx.toString();
				if (this.combined[k]) {
					this.combined[k].addCol(this.cols[key], this.cols[idx.toString()]);
				} else {
					this.combined[k] = new CombinedInfo(this.cols[key], this.cols[idx.toString()]);
					/* istanbul ignore else: no else */
					if (this.combined[k].proper) {
						// register events
						this.combined[k].on(Events.EventChangeMax, this.maxEventListener);
						this.combined[k].on(Events.EventChangeSize, this.sizeEventListener);
						this.combined[k].on(Events.EventChangeRatio, this.ratioEventListener);
						this.combined[k].on(Events.EventChangeLines, this.lineEventListener);
					}
				}
				/* istanbul ignore if: code changed, should never be hit */
				if (!this.combined[k].proper) {
					this.combined[k].removeAllListeners();
					delete this.combined[k];
					return;
				}
				this.combined[k].headerExternal = -1;
				max = Math.max(this.combined[k].maxHeader, max);
				this.sortedCols.push(this.combined[k]);
			});
			this.sortCols();
			if (this.headMax !== max) {
				this.headMax = max;
				/* istanbul ignore if: should never be hit */
				if (this.headMax <= 0) return;
				this.sortedCols.forEach(col => {
					const c = col;
					c.headerExternal = this.headMax;
				});
			}
		};

		// add a new key which does not already exist (to this.keys).
		const addKey = (key: string): void => {
			// find next open
			const idx = this.keys.indexOf('');
			if (key === '' && this.keys.length - 1 > prevKey) return;

			if (idx > -1 && idx > prevKey) {
				this.keys[idx] = key;
				fixCombined = true;
				return;
			}
			if (!canProceed()) return;
			this.keys.push(key);
			newCol = true;
		};

		// add column values to cols variable.
		const addValue = (val: columnProperty, name: string, original: string): void => {
			if (this.cols[name]) {
				prevKey++;
				return;
			}
			const prop: colOptions = {
				eLevel: this.eLevel,
				padding: this.padding,
				borderSize: this.vBorder,
				tabSize: this.tabsize,
				tableSize: this.space,
				pattern: this.columnPattern,
				align: this.colAlign,
				headAlign: this.colHeadAlign,
				excludeHeader: this.head === false,
				...val,
			};
			this.cols[name] = new ColumnInfo(prop);
			if (!this.isFlat) this.cols[name].ratio = 1;
			else this.cols[name].ratio = 0;
			if (isNum(name)) newCol = true;
			addKey(original);
			prevKey++;
		};

		// get all the values
		if (Array.isArray(cols)) {
			cols.forEach((col, idx) => {
				if (col == null) {
					addValue({ name: idx.toString() }, idx.toString(), '');
				} else if (typeof col === 'string') {
					addValue({ name: col || idx.toString() }, col || idx.toString(), col);
				} else if (typeof col === 'number') {
					addValue({ name: idx.toString(), order: col }, idx.toString(), '');
				} else addValue(col, col.name, col.name);
			});
		} else {
			colKeys = Object.keys(cols);
			colKeys.forEach(key => {
				const colType = typeof cols[key];
				if (colType === 'number') {
					addValue({ name: key, order: cols[key] as number }, key, key);
				} else if (colType === 'boolean') {
					if (!cols[key]) addValue({ name: key, maxSize: 0, size: 0 }, key, key);
					else addValue({ name: key }, key, key);
				} else if (colType === 'string') {
					addValue({ name: key, printName: cols[key] as string }, key, key);
				} else addValue(cols[key] as columnProperty, key, key);
			});
		}

		if (fixCombined || this.keys.length !== this.sortedCols.length || newCol) {
			buildCombinedCols();
			this.colChanged();
			this.action |= actions.RESIZE;
			this.action |= actions.HEADER;
		}
	}

	/**
	 * Sort the columns.
	 */
	private sortCols(): void {
		this.sortedCols.sort((a, b) => {
			if (a.order === b.order) return 0;
			if (a.order === 0) return -1;
			if (b.order === 0) return 1;
			return a.order - b.order;
		});
	}

	// --> SIZEING xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
	/**
	 * The main function of the table responsible for calculating and
	 * setting the sizes of each column in the table.
	 */
	private calcSize(): void {
		/* istanbul ignore if: should never be hit - safety */
		if (this.sortedCols.length === 0) return;
		this.setRatio();
		const { isFlat: flat, ratio, sizeAdjuster } = this;
		const size = Math.max(0, this.size - sizeAdjuster);
		let tmpSizes: number[] = [];
		const spacers = this.padding * 2 + this.vBorder;

		const setSizes = (fixed = -1): void => {
			this.sortedCols.forEach((col, idx) => {
				const c = col;
				const sze = fixed > -1 ? fixed : tmpSizes[idx] || 0;
				if (sze) {
					if (sze !== c.size) c.size = sze;
				} else c.size = 0;
			});
		};

		if (!size) setSizes(0);
		else if (!flat) {
			const { headMx, contMax } = this;
			const actualSize = this.head === false ? contMax : headMx + contMax + spacers;
			const calcSize = Math.min(size, actualSize);
			setSizes(calcSize);
		} else {
			tmpSizes = this.getSizeAdjuster();
			setSizes();
		}

		if (this.size - sizeAdjuster !== size || this.ratio !== ratio) {
			this.action |= actions.HEADER;
		}
		this.action ^= actions.RESIZE;
	}

	/**
	 * Get the sizes that each column should be if the columns are spread horizontally.
	 * @returns { number[] }
	 */
	private getSizeAdjuster(): number[] {
		const { space } = this;
		const spacers = this.padding * 2 + this.vBorder;
		const columns = this.keys.length;

		type shortObj = {
			min: number;
			max: number;
			size: number;
			perc: number;
			excl: boolean;
			fix?: number;
		};
		const items: Map<number, shortObj> = new Map();
		const perIndexes: number[] = [];
		let maxTotal = 0;
		let total = 0;
		let percentage = 0;
		let percentMax = 0;
		let totCntr = 0;
		let maxCntr = 0;

		const getPercSize = (current: number): number => {
			if (!percentage) return 0;
			return Math.floor(current * (percentage / (1 - percentage)));
		};

		const filler = (list: number[]): number[] => {
			if (!this.fill) return list;
			const { setSize, maxsize, sizeAdjuster } = this;
			const fixSize = setSize >= 1 ? setSize : maxsize - sizeAdjuster;
			const spaces = (totCntr + perIndexes.length - 1) * spacers;
			const available = Math.round((fixSize - spaces) * (percentage > 0 ? percentage : 1));
			// if (total >= available) return list;
			const adjuster = 1 - (available - total) / available;
			total = 0;
			return list.map(itm => {
				if (itm <= 0) return itm;
				const sz = Math.floor(itm / adjuster);
				total += sz;
				return sz;
			});
		};

		const finalize = (max = false): number[] => {
			let list: number[] = [];
			total = 0;
			totCntr = 0;
			// get the proper size
			this.keys.forEach((key, idx) => {
				if (!items.has(idx)) {
					list.push(0);
					return;
				}
				const itm = items.get(idx);
				if (itm.perc) {
					list.push(-1);
					return;
				}
				if (max) list.push(itm.max);
				else list.push(itm.size);
				total += list[idx];
				if (list[idx]) totCntr++;
			});
			// make sure the proper size has been filled
			list = filler(list);
			// set the table sizes
			let p = getPercSize(total);
			const spaces = (totCntr + perIndexes.length - 1) * spacers;
			let tblSize = p + total;
			if (space > tblSize && percentMax > p) {
				const pMax = Math.round((space - spaces) * percentage);
				p = Math.max(pMax, p);
				tblSize = Math.min(space - spaces, Math.floor(p / percentage));
				p = Math.round(tblSize * percentage);
				const remainder = tblSize - p;
				if (remainder > total) {
					const adj = 1 - (remainder - total) / remainder;
					list = list.map(itm => {
						if (itm <= 0) return itm;
						return Math.floor(itm / adj);
					});
				}
			}
			perIndexes.forEach(itm => {
				this.sortedCols[itm].tableSize = tblSize;
				list[itm] = this.sortedCols[itm].size;
			});
			return list;
		};

		const setSize = (size: number, idx: number, adj = 1): void => {
			let percentSize = getPercSize(total);
			let spaces = Math.max(0, (totCntr + perIndexes.length - adj) * spacers);
			const itm = items.get(idx);
			const s = size < itm.min ? 0 : size > itm.max && itm.max ? itm.max : size;
			if (s && total + spaces + s + percentSize <= space) {
				itm.size = s;
				if (!adj) totCntr++;
				total += s;
			} else if (adj) {
				// fill space
				const sz = space - total - spaces - percentSize;
				if (sz > itm.size && sz < s) {
					setSize(sz, idx);
					return;
				}
			}

			if (!adj) {
				// set maxsizes
				percentSize = getPercSize(maxTotal);
				spaces = (maxCntr + perIndexes.length) * spacers;
				if (maxTotal + spaces + itm.max + percentSize <= space) {
					maxTotal += itm.max;
					maxCntr++;
				}
			}
		};

		// get info
		this.sortedCols.forEach((col, idx) => {
			const { minSize: colMin, isPercent: colPer, setsize: colSet, hasContent } = col;
			const itm: shortObj = { min: colMin, max: 0, size: 0, perc: 0, excl: false };
			// only include items that can / should be printed.
			if (!hasContent && !this.inclusive) return;
			itm.max = Math.max(col.maxContent, col.maxHeader);
			if (col.maxFix) itm.max = Math.min(col.maxSize, itm.max);
			if (itm.min) itm.max = Math.max(itm.min, itm.max);

			if (colSet >= 0) {
				if (!colPer) {
					itm.min = colSet;
					itm.max = colSet;
					itm.fix = colSet;
				} else {
					const testSz = getPercSize(total) + (totCntr + perIndexes.length) * spacers;
					if (testSz > space) return;
					itm.perc = colSet;
					percentage += itm.perc;
					percentMax += itm.max;
					perIndexes.push(idx);
				}
			}
			items.set(idx, itm);
			// initial set
			if (!itm.perc) setSize(itm.min ? itm.min : 1, idx, 0);
		});

		if (maxCntr + perIndexes.length === columns && maxTotal <= space) return finalize(true);
		const reducedSpace =
			(space - (totCntr + perIndexes.length - 1) * spacers) * (1 - percentage);
		const adjust = 1 - (reducedSpace - total) / reducedSpace;
		total = 0;
		items.forEach((itm, idx) => {
			const sz = Math.round(itm.size / adjust);
			setSize(sz, idx);
		});

		return finalize();
	}

	/**
	 * The main function of the table to ensure that the ratio (header to data)
	 * of the table is correctly caculated and set on each column.
	 */
	private setRatio(): void {
		const { isFlat, ratio, setSize } = this;
		if (isFlat && ratio === 0) return;

		this.state |= states.SETRATIO;
		if (isFlat) this.ratio = 0;
		else {
			let { headMax: head, contMax: cont } = this;
			if (setSize >= 0) {
				head = Math.min(setSize, head);
				cont = Math.min(setSize, cont);
			}
			this.ratio = head / (head + cont);
		}
		this.state ^= states.SETRATIO;
	}

	/**
	 * A function that is called by the base class to indicate that the main
	 * size of the table has bee changed.
	 */
	protected sizeChanged(): void {
		this.redoData();
		this.action |= actions.HEADER + actions.RESIZE;
	}

	// #endregion private functions

	// #region public functions
	/**
	 * Initiate a rebuild of the data components.
	 */
	colChanged(): void {
		this.redoData();
		if (this.ratio === 0) this.action |= actions.RESIZE;
	}

	// --> BORDERS xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
	/** Called when the actual border have changed.  Must be done manually if border is changed. */
	updateBorders(): void {
		const old = this.vBorder + this.lBorder + this.rBorder;
		this.vBorder = 0;
		this.lBorder = 0;
		this.rBorder = 0;
		const { content, header } = this.borders;

		/* istanbul ignore else: else should never be hit - safety */
		if (content) {
			if (content.vertical) this.vBorder = content.vertical.length;
			if (this.deep === 1) {
				if (content.left) this.lBorder = content.left.length;
				if (content.right) this.rBorder = content.right.length;
			}
		}

		/* istanbul ignore else: else should never be hit - safety */
		if (header) {
			if (header.vertical) {
				this.vBorder = Math.max(this.vBorder, header.vertical.length);
			}
			if (this.deep === 1) {
				if (header.left) this.lBorder = Math.max(this.lBorder, header.left.length);
				if (header.right) this.rBorder = Math.max(this.rBorder, header.right.length);
			}
		}
		this.action |= actions.HEADER;
		if (old !== this.vBorder + this.lBorder + this.rBorder) {
			this.action |= actions.RESIZE;
		}
	}

	// --> DATA xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
	/**
	 * Adds new data to a currently existing table.
	 * If an array has a complex structure (i.e. arrays or objects inside array),
	 * each item in the array is assumed to resemble a row in the table.
	 * @param data The data to be added.
	 */
	addData(data: unknown[] | string | boolean | number | object): void {
		if (data == null) return;

		// NEW -------------------------------------
		const isComplex = (obj: unknown[]): boolean => {
			let similar = true;
			let globalType = '';
			for (let i = 0, len = obj.length; i < len; i++) {
				const tpe = typeof obj[i];
				if (i === 0) globalType = tpe;
				else if (globalType !== tpe) similar = false;
				if (tpe !== 'string' && tpe !== 'boolean' && tpe !== 'number') return true;
			}
			return similar;
		};
		const { isFlat } = this;
		this.state |= states.ADDDATA;
		if (Array.isArray(data)) {
			if (isComplex(data)) {
				data.forEach(row => this.addRow(row as unknown));
			} else this.addRow(data);
		} else this.addRow(data);

		// if (isFlat !== this.isFlat) this.setRatio();
		if (isFlat !== this.isFlat) this.dataAddedRatioChange();
		this.state ^= states.ADDDATA;
	}

	/**
	 * Add one row to the table.
	 * @param row The row information to add.
	 * If array is passed, each row of array is considered to be a columns in the table.
	 */
	addRow(row: unknown[] | string | boolean | number | object | unknown): void {
		if (row == null) return;
		const result: rawDataObject = {};
		const keyNames: string[] = [];
		const noCols: { [name: string]: number } = {};
		const addColData = (col: unknown = '', idx?: number, name?: unknown): void => {
			const isnum = idx > -1;
			const nme: string = isnum ? idx.toString() : (name as string);

			// get correct Name
			if (isnum) {
				// fixing null items inserted during array forEach itteration
				let { length: len } = keyNames;
				if (len === idx) keyNames.push('');
				else for (let end = Number(nme); len <= end; len++) keyNames.push('');
			} else keyNames.push(nme);

			if (typeof col === 'object' || Array.isArray(col)) {
				if (this.deep === this.maxdepth) {
					addColData(JSON.stringify(col), idx, nme);
					return;
				}
				const options: Options | Options[] = this.nextOption;
				result[nme] = new Table(col, options, this.deep + 1, nme, this.totalRows);
			} else {
				result[nme] = new ColumnData(
					nme,
					col.toString(),
					this.tabsize,
					this.totalRows,
					this.eLevel,
				);
			}
			// match up colsize and datasize
			const max = result[nme].maxData;
			this.contMax = Math.max(this.contMax, max);
			if (this.cols[nme]) this.cols[nme].maxContent = max;
			else noCols[nme] = max;
		};

		this.state |= states.ADDROW;
		const { isFlat } = this;

		if (Array.isArray(row)) row.forEach(addColData);
		else if (typeof row === 'object') {
			const objKeys = Object.keys(row);
			objKeys.forEach(key => addColData(row[key], -1, key));
		} else addColData(row.toString(), 0, ''); // it is string, boolean, number

		// add the column names if needed
		this.addColumns(keyNames);

		this.newData.push(result);

		// update columns added
		const keys = Object.keys(noCols);
		keys.forEach(key => {
			/* istanbul ignore else: no else - safety */
			if (this.cols[key]) this.cols[key].maxContent = noCols[key];
		});

		if (!(this.state & states.ADDDATA)) {
			/* istanbul ignore else: no else */
			if (isFlat !== this.isFlat) this.dataAddedRatioChange();
		}
		this.state ^= states.ADDROW;
	}

	/**
	 * Deletes a row from the Table.
	 * @param index The index of the row to be deleted.
	 */
	deleteRow(index: number): void {
		if (index < 0 || this.rawData.length + this.newData.length <= index) return;
		let idx = index;
		let rem = false;

		const fixColIndex = (data: rawDataObject) => {
			const keys = Object.keys(data);
			const d = data;
			keys.forEach(key => {
				d[key].row = idx;
			});
		};
		const removeData = (dataTable: rawDataObject[]): void => {
			if (!rem) {
				const data = dataTable.splice(idx, 1)[0];
				/* istanbul ignore else: else not hit in tests - safety */
				if (data) rem = true;
			}
			if (dataTable.length === idx) return;
			for (const len = dataTable.length; idx < len; idx++) {
				fixColIndex(dataTable[idx]);
			}
		};

		const fixLines = (lines: lineObjects[]): boolean => {
			const lns = lines;
			let changed = false;
			for (let x = lines.length - 1; x >= 0; x--) {
				if (lns[x].index < index) return changed;
				if (lns[x].index === index) lns.splice(x, 1);
				else lns[x].index--;
				changed = true;
			}
			return changed;
		};

		// fix rawdata || new data
		const raw = this.rawData.length;
		if (index < raw) removeData(this.rawData);
		else idx = index - raw;
		// new data will alwayd be affected
		removeData(this.newData);

		// fix lines // new lines
		fixLines(this.newLines);
		rem = fixLines(this.lnes);
		if (rem) {
			this.newLines.unshift(...this.lnes);
			this.lnes = [];
			this.val = '';
		}
	}

	// --> PRINTING FUNCTIONS xxxxxxxxxxxxxxxxxxxxxxxxxx
	/**
	 * Print data to the console.
	 * @async
	 */
	async print(): Promise<void> {
		const val = this.getValue();
		const { valueReset, bottomBorder, oldVal } = this;
		const printSection = async (end = ''): Promise<void> => {
			if (this.valueReset || !this.streaming) this.oldVal = val;
			else this.oldVal += val;
			this.oldHeader = this.header;
			this.val = '';
			this.valueReset = false;
			return new Promise((res, rej) => {
				process.stdout.write(val + bottomBorder + end, err => {
					/* istanbul ignore if: no need to test error */
					if (err) return rej(err);
					return res();
				});
			});
		};

		const remover = async (left: number, lines: number): Promise<void> =>
			// eslint-disable-next-line implicit-arrow-linebreak
			new Promise((res, rej) => {
				try {
					readline.moveCursor(process.stdout, left, lines, () => {
						readline.clearScreenDown(process.stdout, () => res());
					});
				} catch (error) {
					/* istanbul ignore next: no need to test */
					rej(error);
				}
			});
		// remove previously printed lines
		if (this.streaming) {
			const borderLen = bottomBorder ? bottomBorder.split('\n').length : 0;
			const valLen = oldVal ? oldVal.split('\n').length : 0;
			/* istanbul ignore next: ? 0 never hit in test */
			let removeLines = !valueReset ? (oldVal === '' ? 0 : borderLen) : valLen;
			if (removeLines) {
				removeLines = -Math.max(0, --removeLines);
				/* istanbul ignore next: : 0 never hit in test */
				const moveleft = oldVal ? -Math.abs(this.maxsize + 10) : 0;
				await remover(moveleft, removeLines);
			}
			return printSection();
		}
		return printSection(this.bottomBorder ? '\n' : '');
	}

	/**
	 * Adds data to the table and prints it automatically to the console.
	 * @param data The data to add to the stream.
	 * @async
	 */
	async stream(data?: unknown[] | string | boolean | number | object): Promise<void> {
		/* istanbul ignore else: no else */
		if (data) this.addData(data);
		return this.print();
	}
	// #endregion
}

type rawDataObject = {
	[colName: string]: ColumnData | Table;
};

type colProperties = { [key: string]: ColumnInfo };

type colMininfo = {
	name: string;
	maxSize: number;
	minSize: number;
	size: number;
	order: number;
};

type lineObjects = {
	index: number;
	value: string[];
};
type colLineInfo = {
	key: string;
	col: CombinedInfo;
	lines: string[];
	max?: number;
};
