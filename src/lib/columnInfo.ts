import { EventEmitter } from 'events';
import * as Events from './events';
import { columnProperty, Alignment, emojiLevel } from '../types/options';
import { isNum, getStringSize, getStringLines, fillSpace } from './helper';

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
	private readonly sze = -1;

	private readonly pattern: string;

	readonly tabSize: number;

	private readonly minsize: number;

	private prevSize = -1;

	/** The actual maximum size of the column (including padding). Set at the start. */
	private maxsize = -1;

	private table = -1;

	private real = -1;

	private prntName: string;

	private ordr: number;

	private nameFix = false;

	private autoData = true;

	/** the actual maximum size of the data in the column (excluding padding). */
	private dataMaxSize = 1;

	/** the actual maximum size of the header of the column (excluding padding) */
	private headerMaxSize = 0;

	private fromTbl = false;

	/**
	 * Value between 0 and 1.  Indicate the header size compared to content size if not flat.
	 */
	private rat = 0;

	private intRat = 0;

	/** Return true if maxsize was set at startup */
	private get maxFix(): boolean {
		if (this.maxsize < 0 || this.maxsize == null) return false;
		if (this.maxsize < 1 && this.table < 0) return false;
		return true;
	}
	//	#endregion private properties and variables ---------------------------

	// #region public properties and variables --------------------------------
	/**
	 * Get the percentage value of the size of this collumn inside a table size.
	 * Set on initialization (options).
	 */
	get percentage(): boolean {
		return this.sze > 0 && this.sze < 1;
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
	set printName(val: string) {
		if (val !== this.prntName) {
			const size = getStringSize(val, this.tabSize, this.eLevel);
			const max = this.maxSize;
			this.prntName = size.val;
			this.headerMaxSize = size.size;
			this.setRatio();
			if (max !== this.maxSize) this.emit(Events.EventChangeMax, this);
			this.buildLines();
		}
	}

	get printName(): string {
		if (!this.prntName) this.printName = this.getPrintName(this.nme);
		return this.prntName;
	}

	/**
	 * The order in which the column will appear in relation to other columns.
	 * Returns 0 if no order has been set.
	 * User set / initialize => nothing change on columnInfo.
	 */
	set order(val: number) {
		if (val === this.ordr) return;
		this.ordr = Math.max(0, val);
		this.emit(Events.EventChangeOrder, this);
	}

	get order(): number {
		return this.ordr || 0;
	}

	/**
	 * Get or Set the maximum size of the current collumn (in total)
	 * (include middle padding for ratio type data)
	 * Set only when new data arrives (i.e. set actual data size).
	 * Can only set true column maxSize on construction.
	 */
	set maxSize(val: number) {
		if (this.maxFix || this.fixed) return;
		const oldMax = this.dataMaxSize;
		this.dataMaxSize = Math.max(this.dataMaxSize, val);
		if (oldMax !== this.dataMaxSize) {
			this.setRatio();
			if (this.autoData) this.size = -1;
			else if (this.ratio === 0) this.buildLines();
			this.emit(Events.EventChangeMax, this);
		}
	}

	get maxSize(): number {
		if (this.fixed) return this.size;
		if (this.maxFix) return this.getSize(this.maxsize);
		// can still be maxFix but without table size... return real values
		return this.rat === 0
			? Math.max(this.minsize, Math.max(this.dataMaxSize, this.headerMaxSize), 0)
			: Math.max(this.minsize, this.dataMaxSize + this.headerMaxSize + this.space, 0);
	}

	/** Get the minimum size that the column can be.  Set at startup. */
	get minSize(): number {
		return Math.max(0, this.minsize);
	}

	/** The actual size of the header (data) (excluding padding) */
	get maxHeader(): number {
		return this.headerMaxSize;
	}

	/** The actual size of the content (data) (excluding padding). */
	get maxContent(): number {
		return this.dataMaxSize;
	}

	/**
	 * Get or set a desired size of the (total) column
	 * including padding but exclude any borders.
	 */
	set size(val: number) {
		const oldVal = this.real;

		if ((this.percentage && this.table > -1) || this.fixed || oldVal === val) return;

		if (val === -1) {
			if (this.percentage && this.table) this.real = this.table * this.sze;
			else if (this.rat === 0) this.real = Math.max(0, this.minsize, this.maxsize);
			else this.real = this.dataMaxSize + this.headerMaxSize + this.space;
			this.autoData = true;
		} else {
			this.real = val;
			if (this.percentage && !this.fromTbl) this.table = this.real / this.sze;
			this.autoData = false;
		}

		if (this.real < this.minSize) this.real = 0;
		if (this.maxFix) this.real = Math.min(this.real, this.maxsize);

		if (oldVal === this.real) return;
		if (this.ratio === 0) this.buildLines();
		this.emit(Events.EventChangeSize, this);
	}

	get size(): number {
		return this.fixed && !this.percentage ? this.sze : this.real;
	}

	/**	Get the size of the header Column */
	get headerSize(): number {
		const { size, ratio } = this;
		if (size === 0 && !this.autoData) return 0;
		if (ratio > 0) {
			if (ratio === 1 || this.autoData) return this.headerMaxSize;
			if (size - this.space < 0) return 0;
			return Math.round((size - this.space) * ratio);
		}
		if (size === -1 || this.autoData) return Math.max(this.headerMaxSize, this.dataMaxSize);
		return size;
	}

	/** Get the size of the content column. */
	get contentSize(): number {
		const { size, ratio } = this;
		if (size === 0 && !this.autoData) return 0;
		if (ratio) {
			if (ratio === 1 || this.autoData) {
				return this.dataMaxSize > 0
					? this.dataMaxSize
					: Math.max(0, Math.floor(this.headerMaxSize / (1 - ratio)));
			}
			if (size - this.space < 0) return 0;
			return Math.max(0, Math.floor((1 - ratio) * (size - this.space)));
		}
		if (size === -1 || this.autoData) return Math.max(this.headerMaxSize, this.dataMaxSize);
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
		const old = this.maxHeader;
		this.rat = val;
		if (this.maxHeader !== old) {
			this.buildLines();
			this.emit(Events.EventChangeRatio, this);
		}
	}

	/** The size of the table in which collumn will appear (excluding borders & Padding) */
	get tableSize(): number {
		return this.table;
	}

	set tableSize(val: number) {
		const v = Math.max(val, -1);
		if (v !== this.table) {
			this.table = v;
			if (!this.percentage) return;
			this.fromTbl = true;
			this.size = v > 0 ? v * this.sze : v;
			this.fromTbl = false;
		}
	}

	/** Get the header lines array. */
	get lines(): string[] {
		if (this.lnes.length === 0 && this.printName !== '') this.buildLines();
		return this.lnes;
	}

	/** Get the size of the spacer */
	get spacer(): number {
		return this.space || 0;
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
		this.nme = options.name;
		this.changeSpace(options.padding, options.borderSize);
		this.table = options.tableSize || 0;
		this.tabSize = options.tabSize || 2;
		this.eLevel = options.eLevel || emojiLevel.all;
		this.align = options.align != null ? options.align : Alignment.left;
		this.headAlign = options.headAlign != null ? options.headAlign : this.align;
		this.pattern = options.pattern != null ? options.pattern : 'col-~D';
		if (options.printName) {
			this.printName = options.printName;
			this.nameFix = true;
		} else this.printName = this.getPrintName(this.nme);
		this.ordr = options.order;
		if (options.size != null) {
			this.size = options.size;
			if (!this.percentage) {
				this.fixed = options.fixed == null || options.fixed;
			}
		} else if (options.fixed != null) this.fixed = options.fixed;
		this.minsize = options.minSize != null && options.minSize >= 0 ? options.minSize : 0;
		if (this.minsize > 0 && this.minsize !== this.sze && options.fixed == null) {
			this.fixed = false;
		}
		if (options.maxSize != null && options.maxSize >= 0) {
			this.maxsize = options.maxSize;
			if (options.fixed == null && options.maxSize !== this.sze) {
				this.fixed = false;
			}
		}
	}

	// #region private functions ----------------------------------------------
	/**
	 * Get a printable name or the column if the name is a number.
	 * @param val A value to confirm the printable name against.
	 */
	private getPrintName(val: string): string {
		if (!val) return val;
		if (isNum(val) && this.pattern) return this.pattern.replace(/~D/g, val);
		return val;
	}

	/**
	 * Get a size value for the column if the column is a percentage type column.
	 * @param value The size to confirm.  (Default is sze value)
	 */
	private getSize(value?: number): number {
		const val = value || this.sze;
		if (val <= 0) return Math.max(-1, val);
		if (val < 1) {
			if (this.tableSize < 1) return Math.round(this.tableSize * val);
			return 0;
		}
		return val;
	}

	/**
	 * Method to ensure that the ratios correctly reflect the data (if auto)
	 */
	private setRatio(): void {
		const rat = this.ratio;
		const old = this.intRat;
		if (this.dataMaxSize <= 1) this.intRat = 0.5;
		else {
			this.intRat = this.headerMaxSize / (this.headerMaxSize + this.dataMaxSize);
			this.intRat = Math.min(0.8, Math.max(0.2, this.headerMaxSize));
		}
		if (old !== this.intRat && rat !== this.ratio) this.emit(Events.EventChangeRatio, this);
	}

	/** build the header lines if needs be. */
	private buildLines(): void {
		if (this.size === this.prevSize) return;
		let changed = false;
		this.prevSize = this.size;

		const lines: string[] = this.fillLine(
			getStringLines(this.printName, this.size, this.eLevel),
			true,
		);
		if (lines.length !== this.lnes.length) changed = true;
		else if (lines.length > 0) {
			for (let i = 0, len = lines.length; i < len; i++) {
				if (this.lnes[i] !== lines[i]) {
					changed = true;
					i = len;
				}
			}
		}
		if (!changed) return;
		this.lnes = lines;
		this.emit(Events.EventChangeLines, this.name);
	}
	// #endregion private functions -------------------------------------------

	// #region public functions -----------------------------------------------
	/**
	 * Reset the data max size for the column.
	 */
	reset(): void {
		this.dataMaxSize = 0;
		this.setRatio();
	}

	/**
	 * Return a string array to ensure proper alignement of content (header or data).
	 * @param {string[]} data The data to correctly align.
	 * @param {boolean} header Set as ture if dealing with header column.  Default is false.
	 * @returns {string[]} a properly aligned array of data.
	 */
	fillLine(data: string[], header = false): string[] {
		const result: string[] = [];
		const workSize = !this.ratio ? this.size : header ? this.headerSize : this.contentSize;
		const align = header ? this.headAlign : this.align;

		if (workSize === 0) return [];

		for (let i = 0, len = data.length; i < len; i++) {
			let size = getStringSize(data[i], this.tableSize, this.eLevel);
			let line = data[i];
			if (size.size < workSize || workSize === -1) {
				const diff = workSize - size.size;
				switch (align) {
					case Alignment.center:
						line = fillSpace(Math.floor(diff / 2), ' ') + line;
						line += fillSpace(diff - Math.floor(diff / 2), ' ');
						break;
					case Alignment.right:
						line = fillSpace(diff, ' ') + line;
						break;
					default:
						line += fillSpace(diff, ' ');
						break;
				}
				result.push(line);
			} else if (size.size > workSize) {
				for (let x = line.length - 1; x >= 0; x--) {
					let tmp = line.slice(0, x);
					size = getStringSize(tmp, this.tabSize, this.eLevel);
					if (size.size <= workSize) {
						const diff = workSize - size.size;
						switch (this.align) {
							case Alignment.center:
								tmp = fillSpace(Math.floor(diff / 2), ' ') + tmp;
								tmp += fillSpace(diff - Math.floor(diff / 2), ' ');
								break;
							case Alignment.right:
								tmp = fillSpace(diff, ' ') + tmp;
								break;
							default:
								tmp += fillSpace(diff, ' ');
								break;
						}
						result.push(tmp);
						x = -1;
					}
				}
			} else result.push(line); // equal
		}
		return result.length === 0 ? [''] : result;
	}

	/**
	 * Set the horizontal spacing between the header column and content column.
	 * User changing the size of the spacign between columns.
	 * @param padding The required horizontal padding vor this column.
	 * @param vBorderSpace The required space a vertical border takes up.
	 */

	changeSpace(padding = 2, vBorderSpace = 0): void {
		const size = Math.max(padding, 0) * 2 + Math.max(vBorderSpace, 0);
		if (size !== this.space) {
			const max = this.maxSize;
			this.space = size;
			if (this.ratio) {
				// size change and maxsize change
				if (max !== this.maxSize) this.emit(Events.EventChangeSize, this);
				if (this.autoData) this.size = -1;
				else this.buildLines();
			}
		}
	}
	// #endregion public functions
}

/**
 * A type of object to use as options.
 * @internal
 */
export type colOptions = columnProperty & {
	eLevel: emojiLevel;
	padding?: number;
	borderSize?: number;
	tabSize?: number;
	tableSize?: number;
	pattern?: string;
};
