import { getStringSize, getStringLines } from './helper';
import { BaseData } from './baseData';
import { emojiLevel } from '../types/options';

export class ColumnData extends BaseData {
	lines: string[] = [];

	private max = -1;

	private prevSize = -1;

	constructor(
		key: string,
		private val: string,
		tabSpace: number,
		row: number,
		private readonly eLevel = emojiLevel.all,
		maxSize?: number,
	) {
		super(key, row, maxSize);
		const size = getStringSize(val || '', tabSpace, eLevel);
		this.val = size.val;
		this.max = size.size;
		this.lines = getStringLines(this.val, -1, this.eLevel);
	}

	sizeChanged(): boolean {
		if (this.size === this.prevSize) return false;
		this.prevSize = this.size;
		return true;
	}

	buildLines(force = false): boolean {
		/* istanbul ignore else: no else */
		let changed = false;

		/* istanbul ignore else: no else */
		if (this.size <= 0 || !this.val) {
			changed = this.lineCount !== 0;
			this.lines = [];
			return changed;
		}
		const lines = getStringLines(this.val, this.size, this.eLevel);
		/* istanbul ignore else: no else */
		if (lines.length !== this.lineCount) changed = true;

		for (let i = 0, len = lines.length; i < len; i++) {
			/* istanbul ignore else: no else */
			if (lines[i] !== this.lines[i]) {
				changed = true;
				i = len;
			}
		}
		/* istanbul ignore else: no else */
		if (!changed) return false;
		this.lines = lines;
		return true;
	}

	get isRawData(): boolean {
		return true;
	}

	get value(): string {
		return this.val;
	}

	get maxData(): number {
		return this.max;
	}
}
