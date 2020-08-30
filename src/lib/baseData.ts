import { Options } from '../types/options';

export abstract class BaseData {
	// #region - variables and properties
	/** readonly variable storing the value of the maxsize as set during initialization. */
	protected readonly maxsize;

	/** a variable storing the size of the Table. */
	private sze = -1;

	// ABSTRACT / PROTECTED PROPERTIES -------------------------
	/**
	 * Get an Array of lines (string values) for each row.
	 */
	abstract get lines(): string[];

	/** Get the Maximum size (width) of the data (either added together, or stacked). */
	abstract get maxData(): number;

	/**
	 * Get a value by which the size of the table should be reduced by to get to a printable
	 * size.  This therefore exclud margin, outer borders and outer paddings.
	 */
	protected abstract get sizeAdjuster(): number;

	// NORMAL PROPERTIES -----------
	/**
	 * Get the total amount of lines in the table.
	 * This may differ from row count
	 */
	get lineCount(): number {
		return this.lines.length;
	}

	/** Get the internal size of the column. (i.e. it returns the actually set value only) */
	get setSize(): number {
		return this.sze;
	}

	/** Get or set the size of the data */
	set size(val: number) {
		/* istanbul ignore else: no else */
		if (val === this.sze) return;
		const { size: old } = this;
		if (val > this.maxsize && this.maxsize > -1) this.sze = this.maxsize;
		else this.sze = Math.max(-1, val);
		if (old !== this.size) {
			this.sizeChanged();
			this.buildLines(true);
		}
	}

	get size(): number {
		const { sze, maxData } = this;
		const sizeAdjuster = this.sizeAdjuster ? this.sizeAdjuster : 0;
		return sze > -1 ? sze : maxData + sizeAdjuster;
	}

	// #endregion

	/* istanbul ignore next: default keys should not be relevant in table */
	/**
	 * Constructs an abstract base data object.
	 * @param key The key or column name for the current data object.
	 * @param row The row number for the data in this object.
	 * @param opts Any Options available that relate to the current data.
	 * @param deep The depth of the current data
	 */
	constructor(
		readonly key = '',
		public row = -1,
		opts?: Options | Options[] | number,
		deep?: Number,
	) {
		let max = -1;
		if (opts) {
			if (typeof opts === 'number') max = opts;
			else {
				const curOpts: Options = (Array.isArray(opts) ? opts[0] : opts) || {};
				max = curOpts.maxSize || (deep === 1 ? 120 : -1);
			}
		}
		this.maxsize = max;
	}

	/**
	 * Build the lines for the table.
	 * [Push new items into newLines array, and move data from newData to rawData Arrays]
	 */
	protected abstract buildLines(force?: boolean): boolean;

	/**
	 * Get a value by which the size of the table should be reduced by to get to a printable
	 * size.  This therefore exclud margin, outer borders and outer paddings.
	 */
	protected abstract sizeChanged(): void;
}
