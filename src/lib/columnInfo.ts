import { EventEmitter } from 'events';
import * as Events from './events';
import { columnProperty, Alignment, emojiLevel } from '../types/options';
import { isNum, getStringSize, getStringLines, fillLine, arrayMatch } from './helper';

/**
 * A class for column information.
 * @internal
 */
export class ColumnInfo extends EventEmitter {
	// #region variables
	// GENERAL ================================================================
	/**
	 * A variable storing the Alignment of the content.  Set at initialization.
	 * @readonly
	 * @public
	 */
	readonly align: Alignment;

	/**
	 * A variable storing the emojiLevel to use for calculating string sizes
	 * @readonly
	 * @public
	 */
	readonly eLevel: emojiLevel;

	/**
	 * A variable storing the Alignment of the header.  Set at initialization.
	 * @readonly
	 * @public
	 */
	readonly headAlign: Alignment;

	/**
	 * An array storing the Column header (PrintName value in table form)
	 * depending on the size of the column.
	 */
	private lnes: string[] = [];

	/** A variable that stores the name of the columns */
	private nme: string;

	/**
	 * a variable storing the order number of this column vs other columns in the table.
	 * @default 0
	 * @readonly
	 */
	private readonly ordr: number;

	/**
	 * A pattern to use when the name of the columns is a number.
	 * The number will usualy placed where ~D is situated.
	 * @default col-~D
	 * @readonly
	 */
	private readonly pattern: string;

	/** A variable storing the display name of the columns (might be different to nme) */
	private prntName: string;

	// SIZEING ================================================================
	/**
	 * A variable storing the size of the maximum DATA items inside the column.
	 * (excluding padding and the header size)
	 */
	private dataMaxSize = -1;

	/**
	 * A variable storing the maximum header size of the bound column.
	 * i.e. if there are columns with numbers and names,
	 * the joined columns max header size is stored here.
	 */
	private externalHead = -1;

	/**
	 * A variable storing the size of the maximum DATA itmes inside a bound column.
	 * i.e. if there are columns with numbers and names,
	 * the joined columns max data size is stored here.  This is used together with
	 * dataMaxSize to determine the current maximum data size inside the column.
	 */
	private externalMax = -1;

	/**
	 * A variable storing the size of the header component of the column.
	 * This is usually only set at initialization.
	 */
	private headerMaxSize = 0;

	/**
	 * A variable storing the calculate ratio between header and data components of the column.
	 * This should never really be 0 after initialization.
	 * If no content has been recieved the intRat will be 0.5
	 */
	private intRat = 0;

	/**
	 * A variable that stores the previously sized used when building lines (buildlines function).
	 * If the current size is equal to this value, buildLines will not run again.
	 */
	private prevSize = 0;

	/**
	 * A variable that is used by the sizing function.
	 * This stores the last size a table was set to be, and is mostly used when table is a decimal
	 * or percentage value of the table.  When the column can't be set to the desired size
	 * but tablesize later changes.  The table change might result in the size stored here to be set.
	 */
	private prevSetSize = -1;

	/**
	 * A variable storing the set ratio that should be used between columns and headers.
	 * This size is limited between 0 and 1.
	 */
	private rat = 0;

	/**
	 * A variable storing the real size as set by the table from time to time.
	 * This is the actual size the column should be.
	 */
	private real = -2;

	/**
	 * A variable storing the fixed maximum size of the column (set at initialization)
	 * @readonly
	 */
	private readonly setMaxSize: number;

	/**
	 * A variable storing the fixed minimum size of the column (set at initialization).
	 * @readonly
	 */
	private readonly setMinSize: number;

	/**
	 * A variable storing any fixed sizes of the column (set at initialization).
	 * @readonly
	 * @public
	 */
	readonly setsize;

	/**
	 * A variable storing the total space that should be used between header and content.
	 * (If header and content is aligned horizontally)
	 * .. header | content ) =>
	 *   (header|->|content),  |->| = space.
	 * Typically it is 2 x padding + border size.
	 */
	private space: number;

	/**
	 * A variable storing the size of the table where column is used.
	 * This is used when the setSize variable is a decimal amount
	 * which indicates a size as a percentage of table size.
	 */
	private table = -1;

	/**
	 * A variable storing the size to be given to tab characters.
	 * @readonly
	 * @public
	 */
	readonly tabSize: number;

	// STATE ==================================================================
	/**
	 * Variable that if true, Indicate that the current size of the column was auto determined else
	 * the size was set to a specific value.
	 * NOTE: this exclude sizes set on initialization.
	 */
	private autoData = true;

	/**
	 * A variable set at startup to indicate whether the size of the column should be fixed.
	 * @readonly
	 */
	private readonly fixed?: boolean;

	/**
	 * A variable set by combinedInfo object to indicate that events listeners has been
	 * registered against this object.
	 * @public
	 */
	listening = false;

	/**
	 * An object that is used to ensure the events are called in the correct order,
	 * when the ratio has changed.
	 */
	private ratioEvnt = {
		isRatio: false,
		content: -1,
		head: -1,
	};

	/**
	 * A variable when true indicate that no header should be included in this Column.
	 * @default false
	 * @readonly
	 */
	private readonly excludeHead: boolean;
	// #endregion

	// #region properties
	// SIZING =================================================================
	/**
	 * Get the actual size that the content will be printed in the column.
	 * This may be differrent from maxContent as it takes into account the size value.
	 */
	get contentSize(): number {
		const { size, ratio, rat, autoData, headerMaxSize, setSize, isFixed, excludeHead } = this;
		let dataMax = Math.max(0, this.dataMaxSize, this.externalMax);
		if (size === 0 && !autoData) return 0;
		if (ratio) {
			const { headerSize, space } = this;
			if (headerSize === 0) return 0;
			if (rat === 1 && autoData && !isFixed) {
				return dataMax === 0 && headerSize > 0
					? Math.round(headerSize / ratio - headerSize)
					: dataMax;
			}
			return size - headerSize - space;
		}
		if (this.setMaxSize > -1) dataMax = Math.min(this.setMaxSize, dataMax);
		if (autoData) {
			const head = excludeHead ? 0 : headerMaxSize;
			return isFixed && setSize > -1
				? setSize
				: Math.max(head, dataMax, setSize, this.setMinSize);
		}
		return size;
	}

	/**
	 * Set the size of external headers. this is used when ratio is more than one
	 * and the size of the header is deteremined by the size of the header of all the columns.
	 */
	set headerExternal(val: number) {
		this.externalHead = val < 0 ? 0 : val;
	}

	/**
	 * Get the size the header takes up in the column (excluding spacing)
	 * This may be different from maxHeader as it is determined by the size of the column.
	 * This is the ACTUAL printed size for the header component.
	 */
	get headerSize(): number {
		const { size, ratio, autoData, isFixed } = this;
		if (size === 0 && !autoData) return 0;
		if (ratio > 0) {
			const { maxHeader, space } = this;
			if (autoData && !isFixed) return maxHeader;
			if (size - space < 1) return 0;
			return Math.round((size - space) * ratio);
		}
		if (this.excludeHead) return 0;
		const { headerMaxSize, dataMaxSize, externalMax } = this;
		if ((size === -1 || autoData) && !isFixed) {
			// const head = excludeHead ? 0 : headerMaxSize;
			return Math.max(this.setMinSize, headerMaxSize, dataMaxSize, externalMax);
		}
		return size;
	}

	/**
	 * get the actual maximum size of the content (data) (excluding padding)
	 * inside the column.  This ignores maxHeader size.
	 * Used to set the size of the column data when the data is received.
	 */
	get maxContent(): number {
		return Math.max(0, this.dataMaxSize, this.externalMax);
	}

	set maxContent(val: number) {
		if (this.dataMaxSize >= val) return;
		const { maxSize, maxContent, dataMaxSize } = this;
		this.dataMaxSize = Math.max(dataMaxSize, val);
		if (maxContent === this.maxContent) return;
		if (!this.maxFix && !this.isFixed && maxSize !== this.maxSize) {
			this.emit(Events.EventChangeMax, this);
		}
		this.setRatio();
		if (this.autoData) this.size = -1;
		/* istanbul ignore else: no else */ else if (this.rat === 0) this.buildLines();
	}

	/**
	 * Get a boolean when true indicate that the maximum size of this column has been set
	 * and is determinable (i.e. maximum size can be a fraction that requires a table size).
	 */
	get maxFix(): boolean {
		if (this.setMaxSize < 0 || this.setMaxSize == null) return false;
		if (this.setMaxSize < 1 && this.table < 0) return false;
		return true;
	}

	/**
	 * Get the actual maximum size of the header (data) (excluding padding).
	 */
	get maxHeader(): number {
		return this.rat > 0 ? Math.max(this.headerMaxSize, this.externalHead) : this.headerMaxSize;
	}

	/**
	 * Get the maximum size of the current collumn (in total)
	 * (include middle padding for ratio type data).
	 */
	get maxSize(): number {
		const { maxContent, ratio, headerMaxSize, space, excludeHead, setMaxSize } = this;
		const max = this.valueAdjuster(setMaxSize);
		if (ratio > 0) {
			if (max >= 1) return max;
			return Math.max(0, maxContent + headerMaxSize + space);
		}
		// calculate if not flat
		const { isFixed, maxFix, setSize, minSize } = this;
		const fix = this.valueAdjuster(setSize);
		if (isFixed && fix >= minSize) return fix;
		if (maxFix) {
			return max > -1 && max < minSize ? 0 : Math.max(max, minSize);
		}
		const head = excludeHead ? 0 : headerMaxSize;
		return Math.max(
			0,
			Math.max(head, minSize > 0 ? Math.max(minSize, maxContent) : maxContent),
		);
	}

	/** Get the minimum size that the column can be.  Set at startup. */
	get minSize(): number {
		return Math.max(0, this.setMinSize, this.rat > 0 && this.rat < 1 ? this.space + 2 : 0);
	}

	/**
	 * Get or set the ratio in which the header and content could allign.
	 * 0 = no ratio is set and header and content will allign vertically [header above content].
	 * 1 = ratio will be set to internal calculated ratio and header and content will be Horizontal
	 * The actual ratio is used when value is between 0 and 1 (header aligned horizontal to content)
	 */
	get ratio(): number {
		return this.excludeHead ? 0 : this.rat === 1 ? this.intRat : this.rat;
	}

	set ratio(val: number) {
		if (val === this.rat || val < 0 || val > 1) return;
		this.ratioEvnt = {
			isRatio: true,
			content: this.contentSize,
			head: this.headerSize,
		};
		this.rat = val;
		const { autoData, setSize } = this;
		if (autoData) this.size = -1;
		else if (setSize > 0) {
			const { space, ratio } = this;
			const sz = this.valueAdjuster(setSize);
			this.size = ratio ? Math.round(sz / (1 - ratio) + space) : sz;
		}
		this.ratioEventCheck();
	}

	/**
	 * Get the size set for the column at initialization.
	 * If no size has been set, this will be -1.
	 * If a fraction has been set on intialization and a table size is available,
	 * a calculated size will be returned.
	 */
	get setSize(): number {
		return this.valueAdjuster(this.setsize);
	}

	/**
	 * Get or set a desired size of the (total) column
	 * including padding but exclude any borders.
	 */
	get size(): number {
		return this.real;
	}

	set size(val: number) {
		let amnt = Math.floor(val);
		const { isFixed, setSize, real, rat, space } = this;

		if (isFixed && val !== 0 && rat === 0) {
			const m = this.valueAdjuster(this.setMaxSize);
			const fix = m >= 0 && this.setsize < 1 && setSize > m ? m : setSize;
			amnt = val < 0 ? fix : fix > val ? 0 : fix;
		}
		if (amnt === real) {
			if (val !== amnt && val > -1) this.prevSetSize = val;
			return;
		}
		const oldVal = this.size;
		if (amnt < 0) {
			const { headerSize, ratio, setMinSize, maxSize } = this;
			if (setSize > -1) this.real = setSize;
			else if (ratio === 0) this.real = Math.max(0, setMinSize, maxSize);
			else this.real = Math.ceil(headerSize / ratio) + space;
			this.autoData = true;
			this.prevSetSize = -1;
		} else {
			this.real = amnt;
			this.autoData = val === -1;
			this.prevSetSize = val !== amnt ? val : -1;
		}

		if (this.real < this.minSize) this.real = 0;
		if (this.maxFix) this.real = Math.min(this.real, this.maxSize);

		if (oldVal === this.size) return;
		if (!this.ratioEventCheck()) this.buildLines();
		this.emit(Events.EventChangeSize, this);
	}

	/**
	 * Get the size of the spacer or the total space that should be used
	 * between header and content. (If header and content is aligned horizontally)
	 * (.. header | content ) =>
	 * (header|->|content), |->| = space.
	 * Typically it is 2 x padding + border size. */
	get spacer(): number {
		return this.space;
	}

	/**
	 * Get the space that the data in the column takes up.
	 * This is same as size, unless ratio is used (header and content is horizontal).
	 */
	get spaceSize(): number {
		if (this.ratio > 0) return this.size - this.space;
		return this.size;
	}

	/** Get or set the size of the table. (excluding borders & Padding) */
	get tableSize(): number {
		return this.table;
	}

	set tableSize(val: number) {
		const v = Math.max(val, -1);
		if (v === this.table) return;
		const max = this.maxSize;
		this.table = v;
		const { isPercent, autoData, size, maxFix, prevSetSize: prev, maxSize, setSize } = this;
		if (!isPercent && !maxFix) return;
		// notify if maxSize has changed
		if (maxFix && max !== maxSize) this.emit(Events.EventChangeMax, this);

		const maxsz = maxFix ? this.valueAdjuster(this.setMaxSize) : -1;
		let sz = prev > -1 ? prev : autoData ? -1 : size;
		let resetPrev = -1;
		if (setSize > 0 && sz > 0) {
			sz = setSize > maxsz && maxsz > -1 ? maxsz : setSize;
			sz = prev > -1 && prev < sz ? 0 : sz;
			resetPrev = prev === sz ? -1 : prev;
		} else if (setSize === 0) sz = 0;
		else if (maxFix && sz < 0) sz = maxsz;
		this.size = maxFix ? Math.min(sz, Math.max(0, maxsz)) : sz;
		this.prevSetSize = resetPrev;
	}

	// STATE ==================================================================
	/**
	 * Get a boolean value that indicate whether the current column has data.
	 */
	get hasContent(): boolean {
		return this.dataMaxSize > 0;
	}

	/**
	 * Get true if the column has a fixed size, else false.
	 */
	get isFixed(): boolean {
		if (this.fixed === false) return false;
		return (this.isPercent && this.table > -1) || (this.fixed && !this.isPercent);
	}

	/**
	 * Get true if the size set on initialization is a fractional value (between 0 and 1),
	 * else false.
	 */
	get isPercent(): boolean {
		return this.setsize > 0 && this.setsize < 1;
	}

	// GENERAL ================================================================
	/** Get the header lines array. */
	get lines(): string[] {
		if (this.lnes.length === 0 && this.printName !== '') this.buildLines();
		return this.lnes;
	}

	/**
	 * Get the internal name for the column.  (this name is only set on intialization) */
	get name(): string {
		return this.nme;
	}

	/**
	 * Get The order in which the column will appear in relation to other columns.
	 * Returns 0 if no order has been set.
	 */
	get order(): number {
		return this.ordr;
	}

	/**
	 * Get or set the printable name for the column.
	 * User set / initialize.  This value will appear as column header for the column.
	 */
	get printName(): string {
		return this.prntName;
	}

	set printName(val: string) {
		/* istanbul ignore else: no else */
		if (val === this.prntName) return;
		const size = getStringSize(val, this.tabSize, this.eLevel);
		const max = this.maxSize;
		this.prntName = size.val;
		this.headerMaxSize = size.size;
		this.setRatio();
		if (max !== this.maxSize) {
			/* istanbul ignore else: no else */
			if (this.autoData) this.size = -1;
			this.emit(Events.EventChangeMax, this);
		}
		this.buildLines(true);
	}
	// #endregion properties

	/**
	 * A class to keep column information in.
	 * @param {colOptions} options An options object for the current column information.
	 */
	constructor(options: colOptions) {
		super();
		const { name, tabSize, eLevel, align, headAlign, excludeHeader, padding } = options;
		const { borderSize, tableSize, size, fixed, minSize, maxSize } = options;
		const { pattern, printName, order } = options;
		if (!name) throw new Error('options must include a valid name variable');

		this.nme = name.toString();
		// character / display properties
		this.tabSize = tabSize || 2;
		this.eLevel = eLevel || emojiLevel.all;
		// alignment
		this.align = align != null ? align : Alignment.left;
		this.headAlign = headAlign != null ? headAlign : this.align;
		this.excludeHead = excludeHeader === true;

		// size related properties
		this.changeSpace(padding, borderSize);
		this.table = tableSize || -1;
		if (size != null) {
			this.setsize = size;
			this.fixed = fixed == null || fixed;
		} else if (fixed != null) this.fixed = fixed;
		if (this.setsize == null) this.setsize = -1;
		this.setMinSize =
			minSize != null && minSize >= 0 ? (this.setsize >= 1 ? this.setsize : minSize) : 0;

		this.setMaxSize =
			maxSize >= 0
				? maxSize < 1
					? maxSize
					: Math.max(maxSize, this.minSize)
				: (this.setMaxSize = -1);

		// value related properties
		this.pattern = pattern != null ? pattern : 'col-~D';
		if (printName) this.printName = printName;
		else {
			this.printName =
				isNum(this.nme) && this.pattern ? this.pattern.replace(/~D/g, this.nme) : this.nme;
		}
		// order related properties
		this.ordr = order ? (order <= 0 ? 0 : order) : 0;

		// initialize
		if (this.setsize < 0 && this.isFixed) {
			this.setsize = getStringSize(this.printName).size;
		}
		this.size = -1;
	}

	// #region private functions
	/**
	 * The main function responsible for building lines
	 * for the header component.
	 * @param {boolean} force Will force a rebuild of the data if true
	 * regardless of if it is needed or not. (Default = false)
	 */
	private buildLines(force = false): void {
		const { headerSize, prevSize, printName, eLevel, lnes, rat } = this;
		const size = rat > 0 ? headerSize : this.size;
		if (!force && size === prevSize) return;
		this.prevSize = size;

		const lines: string[] = fillLine(getStringLines(printName, size, eLevel), this, true);
		if (arrayMatch(lines, lnes)) return;

		this.lnes = lines;
		this.emit(Events.EventChangeLines, this);
	}

	/**
	 * A method that is called after size and ratio changes has occured.
	 * It ensures that ratio and size events are called in correct order,
	 * and only once.
	 */
	private ratioEventCheck(): boolean {
		if (!this.ratioEvnt.isRatio) return false;
		const { headerSize: newH, contentSize: newC } = this;
		const { content, head } = this.ratioEvnt;
		if (newH !== head || newC !== content) this.emit(Events.EventChangeRatio, this);
		this.ratioEvnt = {
			isRatio: false,
			content: -1,
			head: -1,
		};
		if (newH === head) return false;
		this.buildLines();
		return true;
	}

	/**
	 * Main function responsible for determining the internal ratio
	 * of header size vs content size.
	 */
	private setRatio(): void {
		const { ratio: rat, headerMaxSize: header, headerSize: oldHead, table } = this;
		const dataMax = this.maxContent;
		if (dataMax <= 0) this.intRat = 0.5;
		else {
			const head = table > 0 ? Math.min(table, header) : header;
			const content = table > 0 ? Math.min(dataMax, table) : dataMax;
			this.intRat = head / (head + content);
		}
		// notify
		if (rat !== this.ratio) this.emit(Events.EventChangeRatio, this);
		if (oldHead !== this.headerSize) this.buildLines();
	}

	/**
	 * Returns the true value of the column based on a given max / set size value.
	 * The true value will include TableSize if needs be
	 * (i.e. return val x tablesize when val is less than 1 and more than 0).
	 * @param val The set maxSize or setSize values of the column.
	 */
	private valueAdjuster(val: number): number {
		if (val <= 0) return val;
		const { tableSize, ratio } = this;
		const TS = tableSize;

		return ratio > 0 && TS >= 0 ? TS : val >= 1 ? val : TS < 1 ? TS : Math.round(TS * val);
	}

	// #endregion private functions

	// #region public functions ===============================================
	/**
	 * Set the horizontal spacing between the header column and content column.
	 * @param padding The required horizontal padding vor this column. (Default = 2)
	 * @param vBorderSpace The required space a vertical border takes up. (Default = 0)
	 */
	changeSpace(padding = 2, vBorderSpace = 0): void {
		const size = Math.max(padding, 0) * 2 + Math.max(vBorderSpace, 0);
		const { space, maxSize, autoData, rat } = this;
		if (size === space) return;
		this.space = size;
		if (rat === 0) return;
		/* istanbul ignore else: no else */
		if (maxSize !== this.maxSize) this.emit(Events.EventChangeMax, this);
		if (autoData) this.size = -1;
		else this.buildLines();
	}

	/**
	 * Gracefull function to set the size of the column without
	 * changing the autoData preset.  Where normally the autoData
	 * property will be forced false when setting the size property,
	 * this function will reset autoData to value that was set before size change.
	 * @param val The new size to set on the column.
	 * @param fixed Whether the size is fixed or not.
	 */
	internalSizeChange(val: number, fixed = false): void {
		const { autoData } = this;
		if (!autoData && val === -1) return;
		this.size = val;
		this.autoData = !fixed ? autoData : false;
	}

	/**
	 * Resets the external data max size for the column.
	 */
	reset(): void {
		this.externalMax = -1;
		this.setRatio();
	}

	/**
	 * Resets the internal maxContent value.
	 */
	resetContent(): void {
		if (this.dataMaxSize <= 0) return;
		this.dataMaxSize = 0;
		this.setRatio();
		this.buildLines();
	}

	/**
	 * Set the maximum content size and fixed sizes for the bounded column.
	 * Bounded column is a column that share the same space in the table.
	 * I.e. if 'Col1' share the space with index '0' then columns for '0'
	 * and 'Col1' is shared (same column index).
	 * @param val The value of the maximum content of the bounded column.
	 * @param fixedSize Any fixed sizes that is used by the bounded column.
	 */
	setExternalMax(val: number, fixedSize = -1): void {
		if (val === this.externalMax && fixedSize === -1) return;
		const { maxSize: oldMax, maxFix, isFixed, autoData } = this;
		this.externalMax = Math.max(-1, val);
		// raise event
		if (!maxFix && !isFixed && oldMax !== this.maxSize) this.emit(Events.EventChangeMax, this);
		// set internal ratio
		this.setRatio();
		if (fixedSize > -1) this.internalSizeChange(fixedSize, true);
		else if (autoData) this.size = -1;
	}
	// #endregion public functions
}

/**
 * A type of object to use as options.
 * @internal
 */
export type colOptions = columnProperty & {
	eLevel?: emojiLevel;
	padding?: number;
	borderSize?: number;
	tabSize?: number;
	tableSize?: number;
	pattern?: string;
	excludeHeader?: boolean;
};
