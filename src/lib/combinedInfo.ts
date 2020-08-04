/* eslint-disable no-param-reassign */
import { EventEmitter } from 'events';
import * as Events from './events';
import { ColumnInfo } from './columnInfo';
import { Alignment, emojiLevel } from '../types/options';
import { fillSpace } from './helper';
import { IColumnSize } from './interfaces';

export class CombinedInfo extends EventEmitter implements IColumnSize {
	// #region private variables ----------------------------------------------
	private max = 0;

	private dataMax = -1;

	private sze = 0;

	private hSze = 0;

	private cSze = 0;

	private lnes: string[] = [];

	private ordr = 0;

	private nmeCol: ColumnInfo;

	private numCol: ColumnInfo;

	private emptyC = '';

	private emptyH = '';
	// #endregion private variables -------------------------------------------

	// #region properties -----------------------------------------------------
	/**	Return false if either the number ColumInfo or name ColumnInfo is null, else true. */
	get proper(): boolean {
		return this.nmeCol != null || this.numCol != null;
	}

	/** Returns the percentage in terms of table size vs column size */
	get isPercent(): boolean {
		const nme = this.nmeCol ? this.nmeCol.isPercent : false;
		const num = this.numCol ? this.numCol.isPercent : false;
		return nme || num;
	}

	get tabSize(): number {
		if (this.nmeCol) return this.nmeCol.tabSize;
		if (this.numCol) return this.numCol.tabSize;
		return 2;
	}

	get eLevel(): emojiLevel {
		if (this.nmeCol) return this.nmeCol.eLevel;
		if (this.numCol) return this.numCol.eLevel;
		return emojiLevel.all;
	}

	/** Returns a string for an empty header line. */
	get emptyHeader(): string {
		return this.emptyH;
	}

	/** Returns a string for an empty content line. */
	get emptyContent(): string {
		return this.emptyC;
	}

	/** Get the lines for the header. */
	get lines(): string[] {
		if (this.nmeCol == null) {
			if (this.numCol == null) return [];
			return this.numCol.lines;
		}
		return this.nmeCol.lines;
	}

	/** Get the name of this object. */
	get name(): string {
		return this.nmeCol == null ? '' : this.nmeCol.name;
	}

	/** Get the secondary name of this object. */
	get name2(): string {
		return this.numCol == null ? '' : this.numCol.name;
	}

	get maxFix(): boolean {
		return (this.nmeCol && this.nmeCol.maxFix) || (this.numCol && this.numCol.maxFix);
	}

	/** Get or Set the order number of this object. */
	get order(): number {
		const nme = this.nmeCol ? this.nmeCol.order : 0;
		const num = this.numCol ? this.numCol.order : 0;
		return Math.max(num, nme, 0);
	}

	/** Get the maximum size of the data. */
	get maxSize(): number {
		const nme =
			this.nmeCol == null ? 0 : this.ratio ? this.nmeCol.maxContent : this.nmeCol.maxSize;
		const num =
			this.numCol == null ? 0 : this.ratio ? this.numCol.maxContent : this.numCol.maxSize;
		const nmeFixed = this.nmeCol && this.nmeCol.maxFix;
		const numFixed = this.numCol && this.numCol.maxFix;
		let max = 0;

		if (nmeFixed && !numFixed) max = nme;
		else if (!nmeFixed && numFixed) max = num;
		else if (nmeFixed && numFixed) max = Math.min(num, nme);
		else max = Math.max(nme, num);

		if (this.ratio > 0) {
			let content = max;
			const header = this.maxHeader;
			const spacer =
				this.nmeCol == null
					? this.numCol == null /* istanbul ignore next: line never hit */
						? 0
						: this.numCol.spacer
					: this.nmeCol.spacer;
			if (content === 0) {
				content = Math.max(0, Math.floor(header / this.ratio) - header);
			}
			return header + spacer + content;
		}
		return max;
	}

	/** Get the minimum size of the columne. */
	get minSize(): number {
		const nme = this.nmeCol == null ? 0 : this.nmeCol.minSize;
		const num = this.numCol == null ? 0 : this.numCol.minSize;
		return Math.max(nme, num, 0);
	}

	/** Get the maximum header size of the header data. */
	get maxHeader(): number {
		return this.nmeCol == null
			? this.numCol == null
				? 0
				: this.numCol.maxHeader
			: this.nmeCol.maxHeader;
	}

	/** Get the maximum data size for the content */
	get maxContent(): number {
		const nme = this.nmeCol == null ? 0 : this.nmeCol.maxContent;
		const num = this.numCol == null ? 0 : this.numCol.maxContent;
		return Math.max(nme, num, 0);
	}

	/** Get and set the actual size for the column. */
	get size(): number {
		let sze = 0;
		const fixedNme = this.nmeCol && this.nmeCol.isFixed;
		const fixedNum = this.numCol && this.numCol.isFixed;
		if (fixedNme) sze = this.nmeCol.size;
		else if (fixedNum) sze = this.numCol.size;
		else if (this.nmeCol) sze = this.nmeCol.size;
		else sze = this.numCol != null ? this.numCol.size : 0;
		sze = this.maxFix && this.maxSize > 0 ? Math.min(sze, this.maxSize) : sze;
		return sze >= this.minSize ? sze : 0;
	}

	set size(val: number) {
		let sze = this.maxFix && this.maxSize > 0 ? Math.min(val, this.maxSize) : val;
		if (sze > -1 && sze < this.minSize) sze = 0;
		if (sze <= 0) {
			const fixedNme = this.nmeCol && this.nmeCol.isFixed;
			const fixedNum = this.numCol && this.numCol.isFixed;
			if (fixedNme) {
				if (sze === -1) this.nmeCol.size = -1;
				sze = this.nmeCol.size > sze && sze > -1 ? 0 : this.nmeCol.size;
			} else if (fixedNum) {
				if (sze === -1) this.numCol.size = -1;
				sze = this.nmeCol.size > sze && sze > -1 ? 0 : this.numCol.maxSize;
			}
		}
		if (this.nmeCol != null) this.nmeCol.size = sze;
		if (this.numCol != null) this.numCol.size = sze;
	}

	get spaceSize(): number {
		return this.nmeCol == null
			? this.numCol == null
				? 0
				: this.numCol.spaceSize
			: this.nmeCol.spaceSize;
	}

	/** Get the size of the header column. */
	get headerSize(): number {
		return this.nmeCol == null
			? this.numCol == null
				? 0
				: this.numCol.headerSize
			: this.nmeCol.headerSize;
	}

	/** Get the size of the content column. */
	get contentSize(): number {
		return this.nmeCol == null
			? this.numCol == null
				? 0
				: this.numCol.contentSize
			: this.nmeCol.contentSize;
	}

	/** Get or set the ratio of content vs header space. */
	get ratio(): number {
		return this.nmeCol == null
			? this.numCol == null
				? 0
				: this.numCol.ratio
			: this.nmeCol.ratio;
	}

	set ratio(val: number) {
		const ratio = val;
		// if (val === 1 || (val < 0 && this.autoRatio)) {
		// 	this.autoRatio = true;
		// 	ratio = this.maxHeader / (this.maxHeader + this.maxContent);
		// 	ratio = Math.min(0.8, Math.max(0.2, ratio));
		// } else if (val > 0) this.autoRatio = false;
		// if (ratio < 0 || ratio > 1) return;
		if (this.nmeCol != null) this.nmeCol.ratio = ratio;
		if (this.numCol != null) this.numCol.ratio = ratio;
	}

	/** get or set the size of the table (used with percentage property) */
	get tableSize(): number {
		const nme = this.nmeCol ? this.nmeCol.tableSize : -1;
		const num = this.numCol ? this.numCol.tableSize : -1;
		return nme === -1 && num === -1 ? 0 : Math.max(nme, num);
	}

	set tableSize(val: number) {
		/* istanbul ignore else: no else */
		if (this.nmeCol != null) this.nmeCol.tableSize = val;
		if (this.numCol != null) this.numCol.tableSize = val;
	}

	/** Get the type of alignment for the content. */
	get align(): Alignment {
		if (this.nmeCol != null && this.nmeCol.align !== Alignment.left) return this.nmeCol.align;
		if (this.numCol != null && this.numCol.align !== Alignment.left) return this.numCol.align;
		return Alignment.left;
	}

	/** Get the type of alignment for the header. */
	get headAlign(): Alignment {
		if (this.nmeCol != null && this.nmeCol.headAlign !== Alignment.left) {
			return this.nmeCol.headAlign;
		}
		if (this.numCol != null && this.numCol.headAlign !== Alignment.left) {
			return this.numCol.headAlign;
		}
		return Alignment.left;
	}
	// #endregion properties --------------------------------------------------

	constructor(nmeInfo: ColumnInfo, numInfo?: ColumnInfo) {
		super();
		if (nmeInfo == null && numInfo == null) return;
		this.addInfo(nmeInfo, numInfo);
		if (this.nmeCol && this.numCol && this.numCol.isFixed) this.size = -1;
	}

	// #region Event Handlers -------------------------------------------------
	/** monitor changes to the maximum size of the column. */
	private maxEventListener = (col: ColumnInfo): void => {
		if (this.max === this.maxSize && this.dataMax === this.maxContent) return;
		if (col.name === this.name2 && this.nmeCol) {
			this.nmeCol.setExternalMax(col.maxContent);
			return;
		}
		this.max = this.maxSize;
		// sort out max event first
		this.dataMax = this.maxContent;
		this.emit(Events.EventChangeMax, this);
		// adjust other variables
		this.changeEmpties();
	};

	/** Monitor changes to the total size of the column */
	private sizeEventListener = (col: ColumnInfo): void => {
		if (this.sze === this.size) return;
		if (col.name === this.name2 && this.nmeCol) {
			const fixedNme = this.nmeCol && this.nmeCol.isFixed;
			const fixedNum = this.numCol && this.numCol.isFixed;
			if (fixedNum && !fixedNme && this.nmeCol) this.nmeCol.size = col.size;
			return;
		}
		this.sze = this.size;
		this.changeEmpties();
		this.emit(Events.EventChangeSize, this);
	};

	// todo: the hSze did not corectly update when num content is larger.
	/** Monitor changes to the ratio being set. */
	private ratioEventListener = (col: ColumnInfo): void => {
		if (this.hSze === this.headerSize && this.cSze === this.contentSize) return;
		// if (col.name === this.name2 && this.nmeCol) return;
		this.hSze = this.headerSize;
		this.cSze = this.contentSize;
		this.changeEmpties();
		this.emit(Events.EventChangeRatio, this);
	};

	/** monitor changes to the lines for the header. */
	private linesEventListener = (col: ColumnInfo): void => {
		if (col.name === this.name2 && this.nmeCol) return;
		let changed = false;
		if (this.lnes.length !== this.lines.length) changed = true;
		else {
			for (let i = 0, len = this.lnes.length; i < len; i++) {
				/* istanbul ignore else: no else */
				if (this.lnes[i] !== this.lines[i]) {
					changed = true;
					i = len;
				}
			}
		}
		/* istanbul ignore else: no else */
		if (changed) {
			this.fillArray();
			this.emit(Events.EventChangeLines, this);
		}
	};

	/** monitor changes to the order of the column */
	private orderEventListener = (): void => {
		if (this.ordr !== this.order) {
			this.ordr = this.order;
			this.emit(Events.EventChangeOrder, this);
		}
	};
	// #endregion Event Handlers ----------------------------------------------

	// #region private functions ----------------------------------------------
	/**
	 * Fixes the lines item.
	 */
	private fillArray(): void {
		this.lnes = [];
		this.lines.forEach(line => {
			this.lnes.push(line);
		});
	}

	/**
	 * Remove a Columninfo item from this object.
	 * @param {ColumnInfo} itm The ColumnInfo item to be removed.
	 * @returns {void}
	 */
	private removeInfo(nmeObject: boolean): void {
		const unregister = (itm: ColumnInfo) => {
			// remove event listeners
			itm.removeListener(Events.EventChangeMax, this.maxEventListener);
			itm.removeListener(Events.EventChangeSize, this.sizeEventListener);
			itm.removeListener(Events.EventChangeRatio, this.ratioEventListener);
			itm.removeListener(Events.EventChangeLines, this.linesEventListener);
			itm.removeListener(Events.EventChangeOrder, this.orderEventListener);
		};

		if (nmeObject) {
			/* istanbul ignore else: no else */
			if (this.name !== this.name2) unregister(this.nmeCol);
			this.nmeCol = null;
		} else {
			/* istanbul ignore else: no else */
			if (this.name !== this.name2) unregister(this.numCol);
			this.numCol = null;
		}
	}

	/**
	 * Add items or change ColumnInfo items to this object
	 * @param {ColumnInfo} nmeInfo The name related item for the object.
	 * @param {columnInfo} numInfo the number related item for this object.
	 */
	private addInfo(nmeInfo: ColumnInfo, numInfo: ColumnInfo): void {
		const addListeners = (itm: ColumnInfo): void => {
			itm.on(Events.EventChangeMax, this.maxEventListener);
			itm.on(Events.EventChangeSize, this.sizeEventListener);
			itm.on(Events.EventChangeRatio, this.ratioEventListener);
			itm.on(Events.EventChangeLines, this.linesEventListener);
			itm.on(Events.EventChangeOrder, this.orderEventListener);
		};
		if (nmeInfo != null) {
			if (this.nmeCol !== nmeInfo) {
				if (this.nmeCol != null) {
					this.removeInfo(true);
				}
				// reset the size variable
				// nmeInfo.size = -1;
				this.nmeCol = nmeInfo;
				addListeners(this.nmeCol);
			}
		}

		if (numInfo != null) {
			if (this.numCol !== numInfo) {
				if (this.numCol != null) this.removeInfo(false);
				// numInfo.size = -1;
				this.numCol = numInfo;
				if (this.nmeCol) {
					const fixedSize =
						this.numCol && this.numCol.isFixed && !this.nmeCol.isFixed
							? this.numCol.size
							: -1;
					this.nmeCol.setExternalMax(numInfo.maxContent, fixedSize);
					if (fixedSize > -1) this.hSze = this.headerSize;
				}
				if (this.numCol !== this.nmeCol) addListeners(this.numCol);
			}
		}

		if (!this.proper) return;

		this.fixSizes();
	}

	/**
	 * Fixes the sizes to allow internal monitoring of any changes.
	 */
	private fixSizes(silent = false): void {
		let changed = false;
		// max
		if (this.max !== this.maxSize) {
			this.max = this.maxSize;
			changed = true;
			/* istanbul ignore else: no else */
			if (!silent) this.emit(Events.EventChangeMax, this);
		}
		// ratio
		if (this.hSze !== this.headerSize) {
			this.hSze = this.headerSize;
			changed = true;
			/* istanbul ignore else: no else */
			if (!silent) this.emit(Events.EventChangeRatio, this);
		}
		// lines

		if (this.lnes.length !== this.lines.length) {
			this.fillArray();
			/* istanbul ignore else: no else */
			if (!silent) this.emit(Events.EventChangeLines, this);
		} /* istanbul ignore else: no else */ else if (this.lnes.length > 0) {
			for (let i = 0, len = this.lines.length; i < len; i++) {
				// todo create test to hit these lines.
				/* istanbul ignore if: if never hit during tests */
				if (this.lnes[i] !== this.lines[i]) {
					this.fillArray();
					if (!silent) this.emit(Events.EventChangeLines, this);
					i = len;
				}
			}
		}
		// size
		if (this.sze !== this.size) {
			this.sze = this.size;
			changed = true;
			/* istanbul ignore else: no else */
			if (!silent) this.emit(Events.EventChangeSize, this);
		}
		// order
		if (this.ordr !== this.order) {
			this.ordr = this.order;
			/* istanbul ignore else: no else */
			if (!silent) this.emit(Events.EventChangeOrder, this);
		}

		// fix if needs be
		if (changed) this.changeEmpties();
		if (this.nmeCol != null) {
			if (Math.max(this.nmeCol.tableSize, 0) !== this.tableSize) {
				this.nmeCol.tableSize = this.tableSize;
			}
			if (this.nmeCol.size !== this.size) this.nmeCol.internalSizeChange(this.size);
		}
		if (this.numCol == null) return;
		if (Math.max(this.numCol.tableSize, 0) !== this.tableSize) {
			this.numCol.tableSize = this.tableSize;
		}
		if (this.numCol.size !== this.size) this.numCol.internalSizeChange(this.size);
	}

	// #endregion private function --------------------------------------------

	// #region public funcionts -----------------------------------------------
	/**
	 * Changes the empty values (The spacing used if header / content has no value)
	 */
	changeEmpties(): void {
		const hSpace = this.headerSize;
		const cSpace = this.contentSize;

		this.emptyC = fillSpace(cSpace);
		this.emptyH = fillSpace(hSpace);
	}

	/**
	 * Compare and add new info objects to this object.
	 * @param nmeInfo A potentially new name info object for this object.
	 * @param numInfo A potentially new number info object for this object.
	 */
	compare(nmeInfo: ColumnInfo, numInfo: ColumnInfo): void {
		this.addInfo(nmeInfo, numInfo);
	}

	/** reset all size values. */
	reset(): void {
		if (this.nmeCol) this.nmeCol.reset();
		if (this.numCol) this.numCol.reset();
	}

	/**
	 * Set the size of the spacing between 2 column data objects.
	 * @param padding The padding size of the column.  Default = 2.
	 * @param vBorderSpace The verticalborder size.  Default = 0.
	 */
	changeSpace(padding = 2, vBorderSpace = 0): void {
		if (this.nmeCol) this.nmeCol.changeSpace(padding, vBorderSpace);
		if (this.numCol) this.numCol.changeSpace(padding, vBorderSpace);
	}
	// #endregion public function ---------------------------------------------
}
