import { getStringSize, getStringLines, arrayMatch } from './helper';
import { BaseData } from './baseData';
import { emojiLevel } from '../types/options';

export class ColumnData extends BaseData {
	/**
	 * An Array of lines (string values) for the current data object.
	 * @public
	 */
	lines: string[] = [];

	/**
	 * A variable storing the maximum size of the data.
	 * @readonly
	 */
	private readonly max: number;

	readonly isRawData = true;

	/**
	 * A variable storing the size of the data that has been set.
	 */
	private setContentSize = -1;

	/**
	 * Get the string value of the table.
	 * @public
	 */
	get value(): string {
		return this.val;
	}

	/** Get the actual size (width) of the data object. */
	get maxData(): number {
		return this.max;
	}

	/**
	 * Get a value by which the size of the data should be reduced by.
	 * This will always be 0 in the case of a columnData object.
	 */
	protected get sizeAdjuster(): number {
		return 0;
	}

	/**
	 * Stores a string value at a specified cell (row, column) inside a table.
	 * @param key The key or column name of the data.
	 * @param val The acual value / data.
	 * @param tabSpace indicate how large the tabSpacing should be (for tab characters).
	 * @param row The row number where the data will be placed.
	 * @param eLevel The emoji level to be used when calculating size.
	 */
	constructor(
		key: string,
		private val: string,
		tabSpace: number,
		row: number,
		private readonly eLevel = emojiLevel.all,
	) {
		super(key, row, -1);
		const size = getStringSize(val || '', tabSpace, eLevel);
		this.val = size.val;
		this.max = size.size;
		this.buildLines();
	}

	/**
	 * Is called whenever the size of the dataobject should change.
	 */
	protected sizeChanged(): void {
		/* ignore empty */
	}

	/**
	 * Build the lines for the current data.
	 */
	protected buildLines(force = false): boolean {
		/* istanbul ignore else: no else */
		const { size, val, eLevel, setContentSize: prevSize, max, lines: old } = this;
		this.setContentSize = size;
		if (prevSize >= max && size >= max) return true;

		this.lines = size <= 0 || !val ? [] : getStringLines(val, size, eLevel);
		return force ? !arrayMatch(old, this.lines) : true;
	}
}
