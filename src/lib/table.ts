import { BordersExtended, templates, borders as boksBorders, getBorder } from 'boks';
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
import { fillSpace, isNum, getStringSize } from './helper';
import { CombinedInfo } from './combinedInfo';

export class Table extends BaseData {
	// #region variables
	// DATA -------------------------------------------------------------------
	// --> ARRAY values  xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
	private rawData: rawDataObject[] = [];

	private newData: rawDataObject[] = [];

	private newLines: lineObjects[] = [];

	private lnes: lineObjects[] = [];

	// --> COLUMN values xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
	/**	A quick reference to all possible column names (can be index numbers too) */
	private keys: string[] = [];

	/** an object storing all the column information */
	cols: colProperties = {};

	private combined: { [key: string]: CombinedInfo } = {};

	sortedCols: CombinedInfo[] = [];

	private readonly colAlign: Alignment;

	private readonly colHeadAlign: Alignment;

	// --> STRING values xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
	// The current value or value of the table.
	private val = '';

	// The old value of the table
	private oldVal = '';

	private newLineString = '';

	/** The header string if any. */
	private head: false | string = '';

	private get header(): string | false {
		if (this.head === false || !this.flatten) {
			const border = this.buildBorder(this.borders.content, 0);
			if (border) return `${border}\n`;
			if (!this.flatten) return '';
		}
		return this.head;
	}

	private set header(val: string | false) {
		this.head = val;
	}

	private oldHeader: false | string = '';

	/**	The row separator (border) */
	private separator = '';

	/** The bottom Border. */
	private bottomBorder = '';

	private readonly columnPattern: string;

	private pad = '';

	// BORDERS ----------------------------------------------------------------
	/** the borders that should be used for the table */
	borders: combinedBorders = {
		content: false,
		header: false,
	};

	/** the size of the horizontal border (if any).  Consider both header & content border. */
	private vBorder = 0;

	/** the size of the left border (if any).  Consider both header & content border. */
	private lBorder = 0;

	/** the size of the right border (if any).  Consider both header & content border */
	private rBorder = 0;

	// size -------------------------------------------------------------------
	/** the maximum size of the table */
	private readonly maxsize: number;

	/** The margin (start spacing) for the table */
	private readonly margin: number;

	/**	The padding (spacing) that each column should have */
	private padSize = 0;

	/** the tabsizing that should be used when \t characters is used. */
	private readonly tabsize: number;

	// DEPTH ------------------------------------------------------------------
	/** the maximum depth level */
	private readonly maxdepth: number;

	/** the current depth of the table */
	private deep = 1;

	// STATE ------------------------------------------------------------------
	/**
	 * set at initialization.
	 * If true, each property in object will represent a column.
	 * If false, each property in object will represent a row (key|value pairs).
	 */
	private readonly flat: boolean;

	/** indicate if the rawdata was an array that was passed */
	private arrayInitial = false;

	/** True if the total size should be fixed. */
	private fixed = false;

	private valueReset = false;

	/**
	 * Indicate if this object receive information continuously ('true') or once off ('false').
	 * @default false
	 */
	private streaming = false;

	/** If true new columns can be added later, else the columns are fixed. */
	private canGrow = true;

	private buildingHeader = false;

	// OPTIONS ---------------------------------------------------------------
	private nextOption: Options = {
		eLevel: emojiLevel.all,
		padding: 1,
		excludeHeader: true,
		margin: 0,
		flatten: true,
		stream: false,
	};

	private readonly eLevel: emojiLevel;

	// #endregion variables

	// #region  properties
	/**	Get the Vertical border for the Header. */
	private get headerVBorder(): string {
		let border = '';
		if (this.borders.header) {
			border = this.flatten
				? this.borders.header.vertical || ''
				: this.borders.header.right || this.borders.header.vertical || '';
		}
		if (!border && !this.flatten) {
			border = this.borders.content ? this.borders.content.left || '' : '';
		}
		return this.fixBorderSpace(border, this.vBorder);
	}

	private get contentVBorder(): string {
		return this.fixBorderSpace(
			this.borders.content ? this.borders.content.vertical || '' : '',
			this.vBorder,
		);
	}

	get value(): string {
		const val = this.getValue();
		return (this.streaming && !this.valueReset ? this.val : '') + val + this.bottomBorder;
	}

	get isTable(): boolean {
		return true;
	}

	get maxData(): number {
		let max = 0;
		const spacer = this.padding * 2 + this.vBorder;
		this.sortedCols.forEach((combined, idx) => {
			const current = combined.maxSize;
			if (current > 0) {
				if (this.flatten) {
					if (idx > 0) max += spacer;
					max += current;
				} else max = Math.max(max, current);
			}
		});

		return max;
	}

	/** Returns the maximum table size excluding outerborder and margin */
	get space(): number {
		if (this.setSize === 0) return 0;
		const ignore = this.margin + this.lBorder + this.rBorder + this.padding * 2;
		if (this.setSize > 0) {
			return this.setSize - (this.setSize - ignore > 0 ? ignore : 0);
		}
		if (this.maxsize > 0) {
			return this.maxsize - (this.maxsize - ignore > 0 ? ignore : 0);
		}
		const size = this.maxData;
		const len = this.keys.length;
		if (size > 0) return size + (this.padding * 2 + this.vBorder) * (len - 1);
		return Math.max(size, -1);
	}

	/**
	 * Get the column alignment: if true if the columns should show horizontally;
	 * if false the columns will show vertically.
	 */
	get flatten(): boolean {
		if (!this.flat && this.rawData.length + this.newData.length <= 1) return false;
		return true;
	}

	get lines(): string[] {
		if (this.newData.length > 0) this.buildLines();
		return [...this.lnes, ...this.newLines].reduce(
			(val: string[], current: lineObjects): string[] => {
				val.push(...current.value);
				return val;
			},
			[],
		);
	}

	// get or set the padding space in the columns.
	get padding(): number {
		return this.padSize;
	}

	set padding(val: number) {
		if (val !== this.padSize) {
			this.padSize = Math.max(0, val);
			const keys = Object.keys(this.cols);
			this.pad = fillSpace(this.padSize);
			keys.forEach(key => this.cols[key].changeSpace(this.padSize, this.vBorder));
		}
	}

	get totalRows(): number {
		return this.rawData.length + this.newData.length;
	}

	// #endregion properties
	/**
	 * Initializer of a Table object.
	 * @param options The Options to be used by the table.
	 * @param data A data Object if available.
	 */
	constructor(
		options?: Options,
		data?:
			| (string | number | object)[]
			| (string | number | object | (string | number)[])[][]
			| object,
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
		options?: Options,
		data?:
			| (string | number | object)[]
			| (string | number | object | (string | number)[])[][]
			| object,
		depth?: number,
		key?: string,
		row?: number,
	);

	constructor(
		options: Options = {},
		data:
			| (string | number | object)[]
			| (string | number | object | (string | number)[])[][]
			| object = {},
		depth = 0,
		key = '',
		row = -1,
	) {
		super(key.toString(), row);
		this.maxdepth = options.maxDepth != null ? Math.max(1, options.maxDepth) : 3;
		this.deep = depth > 0 ? depth : 1;
		this.eLevel = options.eLevel || emojiLevel.all;
		this.nextOption.eLevel = this.eLevel;

		// deal with border options
		if (options.borders != null) {
			if (!options.borders) this.setBorders(BorderTypes.none);
			else this.setBorders(options.borders);
		} else {
			this.setBorders({
				content: templates.single,
				header: {
					...templates.single,
					bottom: boksBorders.HorizontalLines.double,
					bottomLeft: boksBorders.LeftIntersect.doubleSingle,
					bottomIntersect: boksBorders.Intersect.doubleSingle,
					bottomRight: boksBorders.RightIntersect.doubleSingle,
				},
			});
		}

		// deal with general options
		if (options.align) this.colAlign = options.align;
		if (options.headAlign) this.colHeadAlign = options.headAlign;
		if (options.maxSize != null) this.maxsize = Math.max(options.maxSize, 10);
		if (options.size != null && options.size > 0) {
			this.size = options.size;
			this.maxsize = options.size;
			this.fixed = true;
		}
		if (!this.maxsize && this.deep === 1) this.maxsize = 120;
		if (options.padding != null) this.padding = Math.max(options.padding, 0);
		else this.padding = 2;
		this.margin = Math.max(options.margin != null ? options.margin : 2, 0);
		this.tabsize = options.tabSize != null ? Math.max(options.tabSize, 0) : 2;
		this.flat = options.flatten;
		if (options.excludeHeader != null) this.header = options.excludeHeader ? false : '';
		if (options.stream) this.streaming = options.stream;
		if (options.subOptions && options.subOptions.length > 0) {
			const next = options.subOptions.shift();
			if (next === false) this.nextOption = {};
			else {
				this.nextOption = {
					...this.nextOption,
					...next,
				};
				if (options.subOptions.length > 0) {
					this.nextOption.subOptions = options.subOptions;
				}
			}
		}

		if (options.columnPattern != null) {
			if (typeof options.columnPattern === 'boolean') {
				this.columnPattern = options.columnPattern ? 'col-~D' : '';
			} else if (this.columnPattern && !/~D/.test(options.columnPattern)) {
				this.columnPattern = `${options.columnPattern}~D`;
			} else this.columnPattern = options.columnPattern || 'col-~D';
		}
		// deal with column information details.
		if (options.columns != null) {
			this.addColumns(options.columns);
			this.canGrow = options.canGrow !== null ? options.canGrow : false;
		}
		// deal with data object
		this.addData(data);
		if (options.canGrow != null) this.canGrow = options.canGrow;
		if (data) this.print();
	}

	// #region event handlers -------------------------------------------------
	private maxEventListener = (): void => {
		// did the sizes change?  recalc
		this.calcSize();
	};

	private sizeEventListener = (info: CombinedInfo): void => {
		// change data sizes and lists
		this.colChanged();
		// set new sizes to data
		const flat = this.flatten;
		const { name, name2 } = info;
		const size = flat ? info.size : info.contentSize;

		const addToData = (data: rawDataObject): void => {
			const d = data;
			if (d[name]) d[name].size = size;
			else if (d[name2]) d[name2].size = size;
		};

		this.newData.forEach(addToData);

		this.rawData.forEach(addToData);
	};

	private ratioEventListener = (info: CombinedInfo): void => {
		// set data sizes to correct value
		if (this.flatten) return;

		this.colChanged();

		const addToAll = (data: rawDataObject): void => {
			const keys = Object.keys(data);
			const d = data;
			keys.forEach(key => {
				d[key].size = info.contentSize;
			});
		};

		this.newData.forEach(addToAll);

		this.rawData.forEach(addToAll);
	};

	private lineEventListener = (itm: CombinedInfo): void => {
		// the data has changed

		// if ratio - then all data need to change, else only the header has changed.
		if (itm.ratio > 0) this.colChanged();
		else this.drawBorders();
	};

	private orderEventListener = (): void => {
		// The order of the columns have changed.  so everything should be redrawn.
		this.sortCols();
		this.colChanged();
	};

	private dataChangeEvent = (colData: BaseData) => {
		// the data lines have changed... so those rows should be redrawn.
		const num = isNum(colData.key) ? parseInt(colData.key, 10) : -1;
		if (num > -1) {
			if (this.rawData.length > num) {
				for (let i = this.rawData.length - 1; i >= num; i--) {
					this.newData.unshift(this.rawData.pop());
				}
				// remove from lines
				this.newLines = [];
				for (let i = this.lnes.length - 1; i >= 0; i--) {
					if (this.lnes[i].index === i) this.lnes.splice(i, 1);
				}
			}
		} else this.mustRedraw();
	};

	// #endregion event handlers ----------------------------------------------

	// #region private functions
	private fixBorderSpace(border: string, size: number): string {
		const borderSize = getStringSize(border);
		const diff = size - borderSize.size;
		if (diff > 0) {
			if (diff === 1) return `${border} `;
			const left = Math.floor(diff / 2);
			return fillSpace(left) + border + fillSpace(diff - left);
		}
		return border;
	}

	private sortCols(): void {
		this.sortedCols.sort((a, b) => {
			if (a.order === b.order) return 0;
			if (a.order === 0) return -1;
			if (b.order === 0) return 1;
			return a.order - b.order;
		});
		this.calcSize();
	}

	// --> BORDERS xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
	/**
	 * Set the border types for the current table.
	 * @param brdrs The border options to add.
	 */
	private setBorders(brdrs: boksOptions | boksOptions[] | combinedBorders | BorderTypes): void {
		if (typeof brdrs === 'string') {
			let header: BordersExtended | false = false;
			let content: BordersExtended | false = false;
			switch (brdrs) {
				case BorderTypes.bold:
					header = { ...templates.bold };
					content = { ...templates.bold };
					break;
				case BorderTypes.boldSingle:
					header = {
						...templates.bold,
						horizontal: boksBorders.HorizontalLines.line,
						vertical: boksBorders.VerticalLines.line,
					};
					content = {
						...templates.bold,
						horizontal: boksBorders.HorizontalLines.line,
						vertical: boksBorders.VerticalLines.line,
					};
					break;
				case BorderTypes.boldSingleTop:
					header = {
						...templates.bold,
						horizontal: boksBorders.HorizontalLines.line,
						vertical: boksBorders.VerticalLines.line,
					};
					content = { ...templates.empty };
					break;
				case BorderTypes.boldTop:
					header = { ...templates.bold };
					content = { ...templates.empty };
					break;
				case BorderTypes.boldTopSingle:
					header = { ...templates.bold };
					content = { ...templates.single };
					break;
				case BorderTypes.single:
					header = { ...templates.single };
					content = { ...templates.single };
					break;
				case BorderTypes.singleTop:
					header = { ...templates.single };
					content = { ...templates.empty };
					break;
				default:
					// eslint-disable-next-line no-useless-return
					break;
			}
			if (header && content) {
				[this.borders.header = false, this.borders.content = false] = getBorder([
					header,
					content,
				]);
			}
		} else if ((brdrs as combinedBorders).header || (brdrs as combinedBorders).content) {
			this.borders = { ...(brdrs as combinedBorders) };
		} else if (Array.isArray(brdrs)) {
			[this.borders.header = false, this.borders.content = false] = getBorder(brdrs);
		} else {
			[this.borders.header = false, this.borders.content = false] = getBorder([
				{ ...(brdrs as boksOptions) },
				{ ...(brdrs as boksOptions) },
			]);
		}

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
		let middle = '';
		let right: false | string = '';

		switch (borderType) {
			case 1:
				left = border.leftIntersect;
				right = border.rightIntersect;
				flat = border.horizontal;
				middle = border.intersect;
				break;
			case 2:
				left = border.bottomLeft;
				right = border.bottomRight;
				flat = border.bottom;
				middle = border.bottomIntersect;
				break;
			default:
				left = border.topLeft;
				right = border.topRight;
				flat = border.top;
				middle = border.topIntersect;
				break;
		}
		if (!left && !right && !flat && !middle) return answer;
		if (!left) left = ' ';
		if (!right) right = ' ';
		if (!flat) flat = ' ';
		const pad = fillSpace(this.padding, flat);
		const spacer = pad + middle + pad;
		let head = 0;
		let content = 0;
		const { flatten } = this;
		this.sortedCols.forEach(col => {
			if (flatten) {
				const { size } = col;
				if (size === 0) return;
				if (answer !== '') answer += spacer;
				answer += fillSpace(size, flat as string);
				return;
			}
			head = Math.max(head, col.headerSize);
			content = Math.max(content, col.contentSize);
		});
		if (!flatten) answer = fillSpace(head, flat) + spacer + fillSpace(content, flat);
		if (this.deep <= 1) {
			answer = fillSpace(this.margin) + left + pad + answer + pad + right;
		}
		return answer;
	}

	private buildHeader(): void {
		if (this.head === false || this.buildingHeader) return;
		if (!this.flatten && this.deep > 1) {
			this.header = '';
			return;
		}
		this.buildingHeader = true;

		const headSpacer = this.pad + this.headerVBorder + this.pad;

		// get left spacing
		let border = '';
		if (this.flatten) border = this.borders.header ? this.borders.header.left || '' : '';
		border = this.fixBorderSpace(border, this.lBorder);

		const left = fillSpace(this.margin) + border + this.pad;

		// get right spacing
		border = this.borders.header ? this.borders.header.right || '' : '';
		const right = `${this.pad + border}\n`;

		this.header = this.buildBorder(this.borders.header, 0);
		if (this.header) this.header += '\n';
		let max = 1;

		let line = '';
		const buildCol = (col: CombinedInfo, indx: number): void => {
			if (col.size <= 0) return;
			const colLine = col.lines.length > indx ? col.lines[indx] : col.emptyHeader;
			line += (line !== '' ? headSpacer : '') + colLine;
			if (indx === 0) max = Math.max(col.lines.length, max);
		};

		const lines: string[] = [];

		for (let i = 0; i < max; i++) {
			line = '';
			this.sortedCols.forEach(col => buildCol(col, i));
			if (line) lines.push(line);
		}
		this.header += lines.reduce((prev, curr) => prev + left + curr + right, '');
		border = this.buildBorder(this.borders.header, 2);
		this.header += border ? `${border}\n` : '';
		this.buildingHeader = false;
	}

	/** should be called when the table size have changed. */
	private drawBorders(): void {
		this.bottomBorder = this.buildBorder(this.borders.content, 2);
		this.separator = this.buildBorder(this.borders.content, 1);
		this.buildHeader();
	}

	// --> COLUMN FUNCTIONS xxxxxxxxxxxxxxxxxxxxx
	/**
	 * Adds columns for an entire row
	 * @param cols The columns inside a complete row.
	 */
	private addColumns(cols: (string | number | columnProperty)[] | columnProperties): void {
		let colKeys: string[];

		let prevKey = -1;
		let keyLen = this.keys.length;
		let fixCombined = false;
		let newCol = false;

		// confirm if a new olumn may be added or not.
		const canProceed = (name: string): boolean => {
			if (this.canGrow === false) {
				if (isNum(name)) {
					if (this.keys.length - 1 < parseInt(name, 10)) return false;
				} else return false;
			}
			return true;
		};

		const buildCombinedCols = (): void => {
			this.sortedCols = [];
			this.keys.forEach((key: string, idx: number) => {
				const k = key || idx.toString();
				if (this.combined[k]) {
					this.combined[k].compare(this.cols[k], this.cols[idx.toString()]);
				} else {
					this.combined[k] = new CombinedInfo(this.cols[key], this.cols[idx.toString()]);
					// register events
					this.combined[k].on(Events.EventChangeMax, this.maxEventListener);
					this.combined[k].on(Events.EventChangeSize, this.sizeEventListener);
					this.combined[k].on(Events.EventChangeRatio, this.ratioEventListener);
					this.combined[k].on(Events.EventChangeLines, this.lineEventListener);
					this.combined[k].on(Events.EventChangeOrder, this.orderEventListener);
				}
				if (!this.combined[k].proper) {
					this.combined[k].removeListener(Events.EventChangeMax, this.maxEventListener);
					this.combined[k].removeListener(Events.EventChangeSize, this.sizeEventListener);
					this.combined[k].removeListener(
						Events.EventChangeRatio,
						this.ratioEventListener,
					);
					this.combined[k].removeListener(
						Events.EventChangeLines,
						this.lineEventListener,
					);
					this.combined[k].removeListener(
						Events.EventChangeOrder,
						this.orderEventListener,
					);
					delete this.combined[k];
					return;
				}
				this.sortedCols.push(this.combined[k]);
			});
			this.sortCols();
		};

		// add a new key which does not already exist (to this.keys).
		const addKey = (key: string): void => {
			// find next open
			for (let i = prevKey + 1, len = keyLen; i < len; i++) {
				if (this.keys[i] === '') {
					this.keys[i] = key;
					fixCombined = true;
					prevKey = i;
					i = keyLen;
					return;
				}
			}
			if (!canProceed(key)) return;
			this.keys.push(key);
			fixCombined = true;
			prevKey = keyLen;
			keyLen++;
		};

		// add column values to cols variable.
		const addValue = (val: columnProperty, name: string): void => {
			if (this.cols[name]) return;
			if (!canProceed(name)) return;
			const prop: colOptions = {
				eLevel: this.eLevel,
				padding: this.padding,
				borderSize: this.vBorder,
				tabSize: this.tabsize,
				tableSize: this.space,
				pattern: this.columnPattern,
				align: this.colAlign,
				headAlign: this.colHeadAlign,
				...val,
			};
			this.cols[name] = new ColumnInfo(prop);
			if (!this.flatten) this.cols[name].ratio = 1;
			else this.cols[name].ratio = 0;
			if (isNum(name)) newCol = true;
		};

		// get all the values
		if (Array.isArray(cols)) {
			colKeys = cols.map((col, idx) => {
				if (typeof col === 'string') {
					addValue({ name: col || idx.toString() }, col || idx.toString());
					return col;
				}
				if (typeof col === 'number') {
					addValue({ name: idx.toString(), order: idx }, idx.toString());
					return '';
				}
				addValue(col, col.name || idx.toString());
				return col.name || '';
			});
		} else {
			colKeys = Object.keys(cols);
			colKeys.forEach(key => {
				if (typeof cols[key] === 'number') {
					addValue({ name: key, order: cols[key] as number }, key);
				} else addValue(cols[key] as columnProperty, key);
			});
		}

		// sort out keys
		colKeys.forEach((key, idx) => {
			if (key == null) return;
			if (key === '') {
				if (keyLen < prevKey) {
					if (!canProceed(idx.toString())) return;
					this.keys.push('');
					fixCombined = true;
				}
				prevKey++;
			} else {
				const keyIndx = this.keys.indexOf(key);
				if (keyIndx === -1) addKey(key);
				else if (keyIndx > prevKey) prevKey = keyIndx;
			}
		});

		if (fixCombined || this.keys.length !== this.sortedCols.length || newCol) {
			buildCombinedCols();
			this.colChanged();
		}
	}

	private mustRedraw(): void {
		if (this.rawData.length > 0) {
			this.newData.unshift(...this.rawData);
			this.rawData = [];
		}
	}

	colChanged(): void {
		this.mustRedraw();
		this.drawBorders();
	}

	private calcSize(): void {
		// fix ratios
		const flat = this.flatten;
		const size = this.space;
		const colCnt = this.keys.length;
		const tmpSizes: { [key: string]: number } = {};
		const spacers = this.padding * 2 + this.vBorder;
		let rat = 0;
		let runningSize = 0;
		let runningCnt = 0;
		let maxTotal = 0;
		let hasMin = false;

		const removeRunning = (sze: number): void => {
			runningSize -= sze;
			if (runningSize > 0) runningSize -= spacers;
		};

		const addRunning = (nme: string, sze: number): void => {
			if (sze === 0 || !nme) return;
			runningSize += (runningSize > 0 ? spacers : 0) + sze;
			if (runningSize <= size) {
				tmpSizes[nme] = sze;
				runningCnt++;
			} else removeRunning(sze);
		};

		const percentageCalc = (columnNum: number): void => {
			const table = size - Math.max(0, flat ? columnNum - 1 : 0) * spacers;
			this.sortedCols.forEach((col, idx) => {
				this.sortedCols[idx].ratio = flat ? 0 : 1;
				if (col.percentage) {
					this.sortedCols[idx].tableSize = table;
					addRunning(col.name, col.size);
				} else if (col.minSize > 0) hasMin = true;
			});
		};

		const setMinSizes = (): void => {
			const remainingSize = size - runningSize;
			const remainingCnt = colCnt - runningCnt;
			if (remainingCnt > 0 && remainingSize > 0) {
				this.sortedCols.forEach(col => {
					if (!tmpSizes[col.name] && col.minSize > 0) {
						addRunning(col.name, col.minSize);
						const diff = col.maxSize - tmpSizes[col.name];
						if (diff > 0) maxTotal += diff;
					}
				});
			}
		};

		const setMaxSizes = (): void => {
			const remainingSize = size - runningSize;
			const remainingCnt = colCnt - runningCnt;
			if (remainingCnt > 0 && remainingSize > 0) {
				const fraction = remainingSize > maxTotal ? maxTotal / remainingSize + 1 : 1;
				this.sortedCols.forEach(col => {
					const sze = Math.max(3, Math.floor(col.maxSize * fraction));
					if (!col.percentage && sze > col.minSize) addRunning(col.name, sze);
				});
			}
		};

		const setSizes = (): void => {
			for (let i = 0, len = this.sortedCols.length; i < len; i++) {
				const { name } = this.sortedCols[i];
				if (!flat) this.sortedCols[i].ratio = rat;
				this.sortedCols[i].size = tmpSizes[name] ? tmpSizes[name] : 0;
			}
		};

		// calculate and set percentage values
		if (!flat) {
			// ignore percentage
			let min = 0;
			let content = 0;
			let header = 0;
			let sze = 0;
			if (size - spacers > 0) {
				this.sortedCols.forEach(col => {
					header = Math.max(col.maxHeader, header);
					content = Math.max(col.maxContent, content);
					min = Math.max(min, col.minSize);
				});
				rat = header === 0 || content === 0 ? 0.5 : header / (header + content);
				rat = Math.max(0.15, Math.min(rat, 0.85));
				if (header > 0 || content > 0) {
					header = header > 0 ? header : Math.floor(content / rat) - content;
					content = Math.max(
						min,
						content > 0 ? content : Math.floor(header / rat) - header,
					);
					sze = header + content + spacers;
					if (sze > size - spacers) {
						header = (size - spacers) * rat;
						content = size - spacers - header;
						if (content < min) sze = 0;
						else rat = header / (header + content);
					}
				}
			}
			this.sortedCols.forEach(col => {
				addRunning(col.name, sze);
			});
		} else {
			percentageCalc(colCnt);
			if (hasMin) setMinSizes();
			setMaxSizes();
			// safety check
			if (runningSize === 0 && size > 0 && this.deep === 1 && this.sortedCols.length > 0) {
				for (let i = 0, len = this.sortedCols.length; i < len; i++) {
					const { name, minSize } = this.sortedCols[i];
					if (minSize > 0) {
						addRunning(name, minSize);
						i = len;
					}
				}
			}

			if (runningCnt === 0 && size > 0) {
				// set at least 1 column
				let found = false;
				this.sortedCols.forEach(col => {
					if (col.minSize > size || found) return;
					addRunning(col.name, Math.min(size, col.maxSize));
					found = true;
				});
			} else if (runningCnt < colCnt) {
				// correct percentage if possible
				const colDif = colCnt - runningCnt;
				if (runningSize + colDif * spacers >= size) percentageCalc(runningCnt);
			}
		}

		setSizes();
	}

	private getValue(): string {
		let result = '';
		this.buildLines();

		if (this.header !== false && this.header !== this.oldHeader && this.val) {
			// rebuild everything if header has changed.
			this.newLines.unshift(...this.lnes);
			this.newLineString = '';
			this.valueReset = true;
		}
		if (this.valueReset || (this.streaming && !this.oldVal)) result = this.header || '';
		let newLines = '';

		const buildLines = (line: lineObjects): void => {
			let tmpVal = '';
			line.value.forEach(lne => {
				tmpVal += tmpVal !== '' ? `\n${lne}` : lne;
			});
			newLines += tmpVal;
		};
		this.newLines.forEach(line => {
			if (newLines !== '') newLines += `\n${this.separator}\n`;
			buildLines(line);
		});
		newLines += newLines !== '' ? '\n' : '';
		const head =
			!this.streaming && !this.valueReset && this.header && !this.val ? this.header : '';

		return this.streaming || this.valueReset ? result + newLines : head + this.val + newLines;
	}
	// #endregion private functions

	// #region public functions
	// --> BORDERS xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
	/** Called when the actual border have changed.  Must be done manually if border is changed. */
	updateBorders(): void {
		const old = this.vBorder + this.lBorder + this.rBorder;
		this.vBorder = 0;
		this.lBorder = 0;
		this.rBorder = 0;

		if (this.borders.content) {
			if (this.borders.content.vertical) this.vBorder = this.borders.content.vertical.length;
			if (this.borders.content.left) this.lBorder = this.borders.content.left.length;
			if (this.borders.content.right) this.rBorder = this.borders.content.right.length;
		}

		if (this.borders.header) {
			if (this.borders.header.vertical) {
				this.vBorder = Math.max(this.vBorder, this.borders.header.vertical.length);
			}
			if (this.borders.header.left) {
				this.lBorder = Math.max(this.lBorder, this.borders.header.left.length);
			}
			if (this.borders.header.right) {
				this.rBorder = Math.max(this.rBorder, this.borders.header.right.length);
			}
		}
		this.drawBorders();
		if (old !== this.vBorder + this.lBorder + this.rBorder) {
			this.calcSize();
		}
	}

	deleteRow(index: number): void {
		if (index < 0) return;

		const removeEvents = (data: rawDataObject): void => {
			const keys = Object.keys(data);
			keys.forEach(key => {
				data[key].removeListener(Events.EventDataChanged, this.dataChangeEvent);
			});
		};
		// fix rawdata || new data
		if (index < this.rawData.length) this.rawData.splice(index, 1);
		else {
			const idx = index - this.rawData.length;
			if (idx < this.newData.length) {
				removeEvents(this.newData[idx]);
				this.newData.splice(idx, 1);
			} else return;
		}
		for (let i = this.newLines.length - 1; i >= 0; i--) {
			if (this.newLines[i].index === index) this.newLines.splice(i, 1);
		}
		let removed = false;
		for (let i = this.lnes.length - 1; i >= 0; i--) {
			if (this.lnes[i].index === index) {
				this.lnes.splice(i, 1);
				removed = true;
			}
		}
		if (removed) {
			this.newLines.unshift(...this.lnes);
			this.lnes = [];
		}
		this.altered = true;
	}

	// --> DATA xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
	/**
	 * Build the lines for the table.
	 */
	buildLines(): boolean {
		if (this.newData.length === 0) return false;
		const lines: lineObjects[] = [];
		let changed = false;
		const flat = this.flatten;
		// to be used in case of ratio (none flat column)
		const headSpacer = this.flatten ? '' : this.pad + this.headerVBorder + this.pad;
		const contentSpacer =
			this.pad + (this.contentVBorder ? this.contentVBorder : '') + this.pad;

		// get left spacing
		let border = '';
		if (!this.flatten) border = this.borders.header ? this.borders.header.left || '' : '';
		else border = this.borders.content ? this.borders.content.left || '' : '';
		border = this.fixBorderSpace(border, this.lBorder);

		const left = this.deep <= 1 ? fillSpace(this.margin) + border + this.pad : 0;

		// get right spacing
		border = this.borders.content ? this.borders.content.right || '' : '';
		const right = this.deep <= 1 ? this.pad + border : '';

		// fix values before start
		if (this.rawData.length === 0) {
			this.lnes = [];
			this.newLines = [];
		}

		let startRow = this.rawData.length;
		if (this.newLines.length > 0) startRow = this.newLines[this.newLines.length - 1].index + 1;

		type colLineInfo = {
			key: string;
			col: CombinedInfo;
			lines: string[];
			max?: number;
		};

		const getLine = (info: colLineInfo[], lineNum: number): string => {
			let line = '';
			const hasData = true;
			for (let i = 0, len = info.length; i < len; i++) {
				if (info[i].col.size <= 0) continue;
				if (line !== '') line += contentSpacer;
				// add header if needs be
				if (!flat) {
					if (info[i].col.lines[lineNum]) {
						line += info[i].col.lines[lineNum];
						// hasData = true;
					} else line += info[i].col.emptyHeader;
					line += headSpacer;
				}

				// add content
				if (info[i].lines[lineNum]) {
					line += info[i].lines[lineNum];
					// hasData = true;
				} else line += info[i].col.emptyContent;
			}
			if (hasData) return left + line + right;
			return '';
		};

		const createRowLines = (data: rawDataObject, idx: number): void => {
			let max = 0;
			// the rowLines to add as value
			let value: string[] = [];
			// the index of the rowwLines
			const index = idx + startRow;
			const colInfo: colLineInfo[] = [];
			// set sizes
			this.sortedCols.forEach(col => {
				const { name, name2 } = col;

				const info: colLineInfo = {
					key: name,
					col: col,
					lines: [],
				};
				// see if column exist on current row
				if (!this.newData[idx][name] && !this.newData[idx][name2]) {
					colInfo.push(info);
					return;
				}
				const NAME = this.newData[idx][name] ? name : name2;
				info.lines = col.fillLine(this.newData[idx][NAME].lines);
				if (!flat) {
					value = [];
					max = Math.max(col.lines.length, info.lines.length);
					for (let lne = 0; lne < max; lne++) {
						const line = getLine([info], lne);
						if (line) value.push(line);
					}
					lines.push({ index, value });
				} else {
					max = Math.max(max, info.lines.length, col.lines.length);
					colInfo.push(info);
				}
			});

			if (flat) {
				for (let lne = 0; lne < max; lne++) {
					const line = getLine(colInfo, lne);
					if (line) value.push(line);
				}
				lines.push({ index, value });
			}
		};

		this.newData.forEach(createRowLines);
		this.newLines.push(...lines);
		changed = lines.length > 0;
		this.rawData.push(...this.newData);
		this.newData = [];
		return changed;
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
		const addColumn = (col: unknown, name: string | number): void => {
			const nme = name.toString();

			// get correct Name
			if (isNum(nme)) keyNames.push('');
			else keyNames.push(nme);

			if (typeof col === 'object' || Array.isArray(col)) {
				const options: Options = {
					...this.nextOption,
					maxDepth: this.maxdepth,
				};
				result[nme] = new Table(options, col, this.deep + 1, nme, this.totalRows);
			} else {
				result[nme] = new ColumnData(
					nme,
					col.toString(),
					this.tabsize,
					this.totalRows,
					this.eLevel,
				);
			}
			result[nme].on(Events.EventDataChanged, this.dataChangeEvent);
			// match up colsize and datasize
			if (this.cols[nme]) this.cols[nme].maxSize = result[nme].maxData;
			else if (noCols[nme]) noCols[nme] = Math.max(noCols[nme], result[nme].maxData);
			else noCols[nme] = result[nme].maxData || 0;
		};

		if (Array.isArray(row)) {
			row.forEach(addColumn);
		} else if (typeof row === 'object') {
			const objKeys = Object.keys(row);
			objKeys.forEach(key => addColumn(row[key], key));
		} else {
			// it is string, boolean, number
			addColumn(row.toString(), '0');
		}

		// add the column names if needed
		this.addColumns(keyNames);

		const resKeys = Object.keys(result);
		resKeys.forEach(key => {
			let colSz = -1;
			if (isNum(key)) {
				const idx = parseInt(key, 10);
				if (idx < this.keys.length) colSz = this.cols[this.keys[idx]].size;
			} else if (this.keys[key]) colSz = this.cols[key].size;
			if (colSz > -1) result[key].size = colSz;
		});
		// add the row
		this.newData.push(result);

		// update columns added
		const keys = Object.keys(noCols);
		keys.forEach(key => {
			if (this.cols[key]) this.cols[key].maxSize = noCols[key];
		});
	}

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
			for (let i = 0, len = obj.length; i < len; i++) {
				const itmType = typeof obj[i];
				if (itmType !== 'string' && itmType !== 'boolean' && itmType !== 'number') {
					return true;
				}
			}
			return false;
		};

		if (Array.isArray(data)) {
			if (isComplex(data)) {
				data.forEach(row => this.addRow(row as unknown));
			} else this.addRow(data);
		} else this.addRow(data);
	}

	stream(data: unknown[] | string | boolean | number | object): void {
		this.addData(data);
		this.print();
	}

	print(): void {
		const val = this.getValue();

		const printSection = (): void => {
			process.stdout.write(val + this.bottomBorder);
			if (this.valueReset || !this.streaming) this.val = val;
			else this.val += val;
			this.oldVal = this.val;
			this.valueReset = false;
		};

		// remove previously printed lines
		if (this.streaming) {
			let removeLines = 0;
			if (this.valueReset) removeLines = Math.max(0, this.val.split('\n').length - 1);
			else removeLines = Math.max(0, this.bottomBorder.split('\n').length - 1);
			if (removeLines !== 0) {
				removeLines = -Math.abs(removeLines);
				const moveleft = -Math.abs(this.maxsize + 10);
				process.stdout.moveCursor(moveleft, removeLines, () => {
					process.stdout.clearScreenDown(printSection);
				});
			} else printSection();
		} else printSection();
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
