import { EventEmitter } from 'events';
import * as Events from './events';

export abstract class BaseData extends EventEmitter {
	constructor(readonly key = '', readonly row = -1) {
		super();
	}

	private sze = -1;

	/**
	 * get the maximum size of the data component only (exclude all padding, marg, borders).
	 * If value changes, altered should be called.
	 */
	abstract get maxData(): number;

	abstract get lines(): string[];

	set altered(val: boolean) {
		if (!val) return;

		// build lines
		if (this.buildLines()) this.emit(Events.EventDataChanged, this);
	}

	/** Get or set the size of the column */
	set size(val: number) {
		if (val !== this.sze) {
			this.sze = Math.max(-1, val);
			this.altered = true;
		}
	}

	get size(): number {
		return this.sze < 0 ? this.maxData : this.sze;
	}

	/** Get the internal size of the column. (i.e. it returns the actually set value only) */
	get internalSize(): number {
		return this.sze;
	}

	/**
	 * Build a new array and if the new array is different from the old should return true.
	 * Else return false.
	 */
	abstract buildLines(): boolean;

	get lineCount(): number {
		return this.lines.length;
	}
}
