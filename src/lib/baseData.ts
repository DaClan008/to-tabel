import { EventEmitter } from 'events';
import * as Events from './events';

export abstract class BaseData extends EventEmitter {
	/* istanbul ignore next: default keys should not be relevant in table */
	constructor(readonly key = '', readonly row = -1, readonly maxsize = -1) {
		super();
	}

	private sze = -1;

	/**
	 * get the maximum size of the data component only (exclude all padding, marg, borders).
	 * If value changes, altered should be called.
	 */
	abstract get maxData(): number;

	abstract get lines(): string[];

	/** Get or set the size of the column */
	set size(val: number) {
		/* istanbul ignore else: no else */
		if (val === this.sze) return;
		if (val > this.maxsize && this.maxsize > -1) this.sze = this.maxsize;
		else this.sze = Math.max(-1, val);
		if (this.sizeChanged()) {
			if (this.buildLines(true)) this.emit(Events.EventDataChanged, this);
		}
	}

	get size(): number {
		return this.sze > -1
			? this.maxsize > -1 && this.maxsize < this.sze
				? this.maxsize
				: this.sze
			: this.maxData;
	}

	/** Get the internal size of the column. (i.e. it returns the actually set value only) */
	get setSize(): number {
		return this.sze;
	}

	/**
	 * Build a new array and if the new array is different from the old should return true.
	 * Else return false.
	 */
	abstract buildLines(force?: boolean): boolean;

	abstract sizeChanged(): boolean;

	get lineCount(): number {
		return this.lines.length;
	}
}
