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
	) {
		super(key, row);
		const size = getStringSize(val || '', tabSpace, eLevel);
		this.val = size.val;
		this.max = size.maxSize;
		this.lines = getStringLines(this.val, -1, this.eLevel);
	}

	buildLines(): boolean {
		if (this.size === this.prevSize) return false;
		let changed = false;
		this.prevSize = this.size;

		if (this.size <= 0 || !this.val) {
			changed = this.lineCount !== 0;
			this.lines = [];
			return changed;
		}
		const lines = getStringLines(this.val, this.size, this.eLevel);
		if (lines.length !== this.lines.length) changed = true;

		for (let i = 0, len = lines.length; i < len; i++) {
			if (lines[i] !== this.lines[i]) {
				changed = true;
				i = len;
			}
		}
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
