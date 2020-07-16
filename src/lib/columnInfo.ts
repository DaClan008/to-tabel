import { EventEmitter } from 'events';
import * as Events from './events';
import { columnProperty, Alignment, emojiLevel } from '../types/options';
import { isNum, getStringSize, getStringLines, fillSpace, fillLine } from './helper';

/**
 * A class for column information.
 * @internal
 */
export class ColumnInfo extends EventEmitter {
	// #region private variables and properties -------------------------------
	private nme: string;

	private lnes: string[] = [];

	/**
	 * The space to calculate between 2 columns if a non-flat structure is used. (i.e. ratio > 0)
	 * Typically it is 2 x padding + border size.
	 */
	private space: number;

	readonly eLevel: emojiLevel;

	/** the actual size of the column set at start (including padding) */
	private readonly setSize;

	private readonly pattern: string;

	readonly tabSize: number;

	private readonly setMinSize: number;

	// must be different to size in order to allow initial building of lines.
	private prevSize = 0;

	/** The actual maximum size of the column (including padding). Set at the start. */
	private readonly setMaxSize: number;

	private table = -1;

	// allow initialization by size component (do not make it -1)
	private real = -2;

	private prntName: string;

	private ordr: number;

	private autoData = true;

	/** the actual maximum size of the data in the column (excluding padding). */
	private dataMaxSize = -1;

	private externalMax = -1;

	/** the actual maximum size of the header of the column (excluding padding) */
	private headerMaxSize = 0;

	/**
	 * Value between 0 and 1.  Indicate the header size compared to content size if not flat.
	 */
	private rat = 0;

	private intRat = 0;

	get hasContent(): boolean {
		return this.dataMaxSize > -1;
	}

	get isFixed(): boolean {
		if (!this.fixed || (this.isPercent && this.tableSize < 0)) return false;
		return true;
	}

	/** Return true if maxsize was set at startup */
	get maxFix(): boolean {
		if (this.setMaxSize < 0 || this.setMaxSize == null) return false;
		if (this.setMaxSize < 1 && this.table < 0) return false;
		return true;
	}
	//	#endregion private properties and variables ---------------------------

	// #region public properties and variables --------------------------------
	/**
	 * Get the percentage value of the size of this collumn inside a table size.
	 * Set on initialization (options).
	 */
	get isPercent(): boolean {
		return this.setSize > 0 && this.setSize < 1;
	}

	/**
	 * Get the internal name for the column. this is only set on intialization. */
	get name(): string {
		return this.nme;
	}

	/**
	 * The printable name for the column.
	 * User set / initialize => may set max size and build new lines.
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

	/**
	 * The order in which the column will appear in relation to other columns.
	 * Returns 0 if no order has been set.
	 * User set / initialize => nothing change on columnInfo.
	 */
	get order(): number {
		return this.ordr;
	}

	set order(val: number) {
		if (val === this.ordr) return;
		this.ordr = Math.max(0, val);
		this.emit(Events.EventChangeOrder, this);
	}

	/**
	 * Get the maximum size of the current collumn (in total)
	 * (include middle padding for ratio type data)
	 * maxSize can only be set on initialization (maxSize option).
	 */
	get maxSize(): number {
		if (this.fixed) return this.size;
		if (this.maxFix) {
			if (this.setMaxSize === 0 || this.setMaxSize >= 1) return this.setMaxSize;
			return this.setMaxSize * this.tableSize;
		}
		const dataMax = Math.max(this.dataMaxSize, this.externalMax, 0);
		// can still be maxFix but without table size... return real values
		return this.rat === 0
			? Math.max(Math.max(dataMax, this.headerMaxSize), 0)
			: Math.max(dataMax + this.headerMaxSize + this.space, 0);
	}

	/** Get the minimum size that the column can be.  Set at startup. */
	get minSize(): number {
		return Math.max(0, this.setMinSize);
	}

	/**
	 * Get the actual maximum size of the header (data) (excluding padding)
	 */
	get maxHeader(): number {
		return this.headerMaxSize;
	}

	/**
	 * get or set the actual maximum size of the content (data) (excluding padding)
	 * inside the column.
	 * This ignores maxHeader size.
	 */
	get maxContent(): number {
		return Math.max(0, this.dataMaxSize, this.externalMax);
	}

	set maxContent(val: number) {
		const oldDataMax = Math.max(this.dataMaxSize, this.externalMax, 0);
		const oldMax = this.maxSize;
		this.dataMaxSize = Math.max(this.dataMaxSize, val);
		if (oldDataMax === Math.max(this.dataMaxSize, this.externalMax, 0)) return;
		if (!this.maxFix && !this.fixed && oldMax !== this.maxSize) {
			this.emit(Events.EventChangeMax, this);
		}
		this.setRatio();
		if (this.autoData) this.size = -1;
		/* istanbul ignore else: no else */ else if (this.rat === 0) this.buildLines();
	}

	/**
	 * Get or set a desired size of the (total) column
	 * including padding but exclude any borders.
	 */
	get size(): number {
		if (this.real >= 0) return this.real;
		if (this.isPercent) {
			if (this.tableSize >= 0) return this.setSize * this.tableSize;
		} else if (this.fixed) return this.setSize;

		return Math.max(
			this.setMinSize,
			Math.max(this.dataMaxSize, this.headerMaxSize, this.externalMax),
			0,
		);
	}

	set size(val: number) {
		// CAN BE:
		// - size is alway 0 if val is 0
		// - percentage (i.e. % on tablesize -> setSize = decimal value below 1)
		//   ~ with out table size => Maxsize of content (audoData = true)  OR
		//                            The real size that has been set to size
		//      + if size was 0 and val > 0 => size will be val
		//    ~ if tablesize is set => Math.ceil(tableSize & the percentage amnt)
		//      + if size was 0 and val < setSize * tableSize => size remain 0.
		//      + if size was 0 and val >= setSize * tableSize => size = setSize * tableSize.
		//    ~ Fixed is automatically set if size is initilized with a size variable.
		//    ~ setting fixed to false will result in size being set to any val provided:
		//      + if val = -1 will reset size to setSize * tableSize
		//  - ratio (i.e. size is contentSize + headerSize) => only relevant if val is < 0
		//  - if fixed (i.e. setSize >= 1 || setSize === 0):
		//    ~ if val === 0 || val < setSize => size = 0
		//    ~ if val >= setSize => size = setSize
		//    ~ if initialized as fixed without size option, setSize => printName on initialization.
		//  - none of the above size = Math.max(0, val); [val limites to 0]
		//  - size can never be smaller than minimumsize (else it will be 0)
		//  - size can never be bigger than maximumsize (else it will be maxsize)
		let amnt = Math.floor(val);
		const percent = this.isPercent;
		if (this.setSize > 0 && this.fixed && val !== 0) {
			let testAmnt = -1;
			if (percent && this.tableSize > -1) testAmnt = Math.ceil(this.setSize * this.tableSize);
			else if (percent) testAmnt = val < 0 ? getStringSize(this.printName).size : val;
			else testAmnt = this.setSize;
			amnt = val < 0 ? testAmnt : testAmnt > val ? 0 : testAmnt;
		}
		const zero = this.real === 0 || amnt === 0 || this.autoData || percent;
		if ((this.fixed && !zero) || amnt === this.real) return;
		const oldVal = this.real;
		const dataMax = Math.max(this.dataMaxSize, this.externalMax, 0);
		if (amnt < 0) {
			if (this.setSize > -1 && !percent) this.real = this.setSize;
			else if (percent && this.tableSize > -1) {
				this.real = Math.ceil(this.setSize * this.tableSize);
			} else if (this.rat === 0) this.real = Math.max(0, this.setMinSize, this.maxSize);
			else this.real = dataMax + this.headerMaxSize + this.space;
			this.autoData = true;
		} else {
			this.real = amnt;
			this.autoData = percent && this.table < 0;
		}

		if (this.real < this.minSize) this.real = 0;
		if (this.maxFix) this.real = Math.min(this.real, this.maxSize);

		if (oldVal === this.real) return;
		this.buildLines();
		this.emit(Events.EventChangeSize, this);
	}

	/**	Get the size of the header Column */
	get headerSize(): number {
		const { size, ratio } = this;
		if (size === 0 && !this.autoData) return 0;
		if (ratio > 0) {
			if (this.rat === 1 && this.autoData && !this.isFixed) {
				return this.maxHeader;
			}
			if (size - this.space < 1) return 0;
			return Math.round((size - this.space) * ratio);
		}
		if ((size === -1 || this.autoData) && !this.isFixed) {
			return Math.max(this.headerMaxSize, this.dataMaxSize, this.externalMax);
		}
		return size;
	}

	/** Get the size of the content column. */
	get contentSize(): number {
		const { size, ratio, headerSize } = this;
		if (size === 0 && !this.autoData) return 0;
		if (ratio) {
			if (headerSize === 0) return 0;
			if (this.rat === 1 && this.autoData && !this.isFixed) {
				const dataMax = Math.max(0, this.dataMaxSize, this.externalMax);
				return dataMax === 0 && headerSize > 0
					? Math.ceil(headerSize / ratio - headerSize)
					: dataMax;
			}
			return size - headerSize - this.space;
		}
		if (this.autoData) return Math.max(this.headerMaxSize, this.dataMaxSize);
		return size;
	}

	/**
	 * The ratio of Header versus column space if the column is not displayed flat.
	 * 0 = no ratio is set.
	 * 1 = ratio is set, but to the actual values of the column (i.e. ratio is unknown)
	 * all other values is the actual ratio.
	 */
	get ratio(): number {
		return this.rat === 1 ? this.intRat : this.rat;
	}

	set ratio(val: number) {
		if (val === this.rat || val < 0 || val > 1) return;
		const old = this.headerSize;
		this.rat = val;
		if (this.headerSize !== old) this.emit(Events.EventChangeRatio, this);

		if (this.autoData) this.size = -1;
		if (this.headerSize !== old) this.buildLines();
	}

	/** The size of the table in which collumn will appear (excluding borders & Padding) */
	get tableSize(): number {
		return this.table;
	}

	set tableSize(val: number) {
		const v = Math.max(val, -1);
		if (v === this.table) return;
		const max = this.maxSize;
		this.table = v;
		const max2 = this.maxSize;
		if (this.maxFix && max !== max2) this.emit(Events.EventChangeMax, this);
		/* istanbul ignore next: ? -1 not hit */
		if (this.size > max2) this.size = this.isPercent ? -1 : max2;
		else if (this.isPercent) this.size = -1; // reset size
	}

	/** Get the header lines array. */
	get lines(): string[] {
		if (this.lnes.length === 0 && this.printName !== '') this.buildLines();
		return this.lnes;
	}

	/** Get the size of the spacer */
	get spacer(): number {
		return this.space;
	}

	/** Alignment of the content.  Set at initialization. */
	readonly align: Alignment;

	/** Alignment of the header.  Set at initialization. */
	readonly headAlign: Alignment;

	/** Get a bollean that if true the sizes for the current column is fixed. */
	fixed?: boolean;
	// #endregion public properties and variables

	/**
	 * A class to keep column information in.
	 * @param {colOptions} options An options object for the current column information.
	 */
	constructor(options: colOptions) {
		super();
		if (!options.name) throw new Error('options must include a valid name variable');
		this.nme = options.name.toString();
		// character / display properties
		this.tabSize = options.tabSize || 2;
		this.eLevel = options.eLevel || emojiLevel.all;
		// alignment
		this.align = options.align != null ? options.align : Alignment.left;
		this.headAlign = options.headAlign != null ? options.headAlign : this.align;

		// size related properties
		this.changeSpace(options.padding, options.borderSize);
		this.table = options.tableSize || -1;
		if (options.size != null) {
			this.setSize = options.size;
			this.fixed = options.fixed == null || options.fixed;
			if (!this.isPercent || this.setSize === 0) this.real = this.setSize;
		} else if (options.fixed != null) this.fixed = options.fixed;
		if (!this.setSize) this.setSize = -1;
		this.setMinSize = options.minSize != null && options.minSize >= 0 ? options.minSize : 0;
		if (this.setMinSize > 0 && this.setMinSize !== this.setSize && options.fixed == null) {
			this.fixed = false;
		}
		if (options.maxSize >= 0) {
			this.setMaxSize = options.maxSize;
			/* istanbul ignore else: no else */
			if (options.fixed == null && options.maxSize !== this.setSize) {
				this.fixed = false;
			}
		} else this.setMaxSize = -1;

		// value related properties
		this.pattern = options.pattern != null ? options.pattern : 'col-~D';
		if (options.printName) this.printName = options.printName;
		else {
			this.printName =
				isNum(this.nme) && this.pattern ? this.pattern.replace(/~D/g, this.nme) : this.nme;
		}
		// order related properties
		this.ordr = options.order ? (options.order <= 0 ? 0 : options.order) : 0;

		// initialize
		if (this.setSize === -1 && this.fixed) {
			this.setSize = getStringSize(this.printName).size;
		}
		this.size = -1;
	}

	// #region private functions ----------------------------------------------
	/**
	 * Method to ensure that the ratios correctly reflect the data (if auto)
	 */
	private setRatio(): void {
		const rat = this.ratio;
		const header = this.headerSize;
		const dataMax = Math.max(this.dataMaxSize, this.externalMax, -1);
		if (dataMax === -1) this.intRat = 0.5;
		else {
			this.intRat = this.headerMaxSize / (this.headerMaxSize + dataMax);
			this.intRat = Math.min(0.8, Math.max(0.2, this.intRat));
		}
		// notify
		if (rat !== this.ratio) {
			this.emit(Events.EventChangeRatio, this);
		}
		if (header !== this.headerSize) this.buildLines();
	}

	/** build the header lines if needs be. */
	private buildLines(force = false): void {
		const size = this.rat > 0 ? this.headerSize : this.size;
		if (!force && size === this.prevSize) return;
		let changed = false;
		this.prevSize = size;

		const lines: string[] = fillLine(
			getStringLines(this.printName, size, this.eLevel),
			this,
			true,
		);

		if (lines.length !== this.lnes.length) changed = true;
		/* istanbul ignore else: no else */ else if (lines.length > 0) {
			for (let i = 0, len = lines.length; i < len; i++) {
				if (this.lnes[i] !== lines[i]) {
					changed = true;
					i = len;
				}
			}
		}
		if (!changed) return;
		this.lnes = lines;
		this.emit(Events.EventChangeLines, this);
	}
	// #endregion private functions -------------------------------------------

	// #region public functions -----------------------------------------------
	/**
	 * Reset the data max size for the column.
	 */
	reset(): void {
		this.dataMaxSize = -1;
		this.externalMax = -1;
		this.setRatio();
	}

	/**
	 * Set the horizontal spacing between the header column and content column.
	 * User changing the size of the spacign between columns.
	 * @param padding The required horizontal padding vor this column.
	 * @param vBorderSpace The required space a vertical border takes up.
	 */
	changeSpace(padding = 2, vBorderSpace = 0): void {
		const size = Math.max(padding, 0) * 2 + Math.max(vBorderSpace, 0);
		if (size === this.space) return;
		const max = this.maxSize;
		this.space = size;
		if (this.rat === 0) return;
		// size change and maxsize change
		/* istanbul ignore else: no else */
		if (max !== this.maxSize) this.emit(Events.EventChangeMax, this);
		if (this.autoData) this.size = -1;
		else this.buildLines();
	}

	internalSizeChange(val: number): void {
		if (!this.autoData && val === -1) return;
		const auto = this.autoData;
		this.size = val;
		this.autoData = auto;
	}

	setExternalMax(val: number): void {
		if (val === this.externalMax) return;
		const oldMax = this.maxSize;
		this.externalMax = Math.max(-1, val);
		if (!this.maxFix && !this.fixed && oldMax !== this.maxSize) {
			this.emit(Events.EventChangeMax, this);
		}
		this.setRatio();
		if (this.autoData) this.size = -1;
		/* istanbul ignore else: no else */ else if (this.rat === 0) this.buildLines();
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
};
