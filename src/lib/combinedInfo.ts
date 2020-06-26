/* eslint-disable no-param-reassign */
import { EventEmitter } from 'events';
import * as Events from './events';
import { ColumnInfo } from './columnInfo';
import { Alignment, emojiLevel } from '../types/options';
import { fillSpace, getStringSize } from './helper';

export class CombinedInfo extends EventEmitter {
	// #region private variables ----------------------------------------------
	private max = 0;

	private sze = 0;

	private hSze = 0;

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
		return this.nmeCol != null && this.numCol != null;
	}

	/** Returns the percentage in terms of table size vs column size */
	get percentage(): boolean {
		return this.nmeCol.percentage || this.numCol.percentage;
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
		if (this.nmeCol == null) return [];
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

	/** Get or Set the order number of this object. */
	get order(): number {
		const nme = this.nmeCol ? this.nmeCol.order : 0;
		const num = this.numCol ? this.numCol.order : 0;
		return Math.max(num, nme, 0);
	}

	set order(val: number) {
		if (this.nmeCol.order > 0 || this.numCol.order === 0) this.nmeCol.order = val;
		else this.numCol.order = val;
	}

	/** Get the maximum size of the data. */
	get maxSize(): number {
		const nme =
			this.nmeCol == null ? 0 : this.ratio ? this.nmeCol.maxContent : this.nmeCol.maxSize;
		const num =
			this.numCol == null ? 0 : this.ratio ? this.numCol.maxContent : this.numCol.maxSize;
		if (this.ratio > 0) {
			let content = Math.max(nme, num, 0);
			const header = this.maxHeader;
			const spacer =
				this.nmeCol == null
					? this.numCol == null
						? 0
						: this.numCol.spacer
					: this.nmeCol.spacer;
			if (content === 0) {
				content = Math.max(0, Math.floor(header / this.ratio) - header);
			}
			return header + spacer + content;
		}
		return Math.max(nme, num);
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
		if (this.nmeCol != null && this.nmeCol.fixed) sze = this.nmeCol.size;
		else if (this.numCol != null && this.numCol.fixed) sze = this.numCol.size;
		else {
			const nme = this.nmeCol != null ? this.nmeCol.size : 0;
			const num = this.numCol != null ? this.numCol.size : 0;
			sze = Math.max(nme, num);
		}
		return sze >= this.minSize ? sze : 0;
	}

	set size(val: number) {
		if (this.nmeCol != null) this.nmeCol.size = val;
		if (this.nmeCol !== this.numCol && this.numCol != null) this.numCol.size = val;
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
		if (this.nmeCol != null) this.nmeCol.ratio = val;
		if (this.numCol != null) this.numCol.ratio = val;
	}

	/** get or set the size of the table (used with percentage property) */
	get tableSize(): number {
		return this.nmeCol == null
			? this.numCol == null
				? 0
				: this.numCol.tableSize
			: this.nmeCol.tableSize;
	}

	set tableSize(val: number) {
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

	/** Returns true if the size of the column could be changed, else false. */
	get fixed(): boolean {
		let val = this.nmeCol == null ? false : this.nmeCol.fixed;
		if (!val) val = this.numCol == null ? false : this.numCol.fixed;
		return val;
	}
	// #endregion properties --------------------------------------------------

	constructor(nmeInfo: ColumnInfo, numInfo?: ColumnInfo) {
		super();
		if (nmeInfo == null && numInfo == null) return;
		this.compare(nmeInfo || numInfo, numInfo || nmeInfo);
		if (this.nmeCol.tableSize !== this.tableSize) this.nmeCol.tableSize = this.tableSize;
		if (this.numCol.tableSize !== this.tableSize) this.numCol.tableSize = this.tableSize;
	}

	// #region Event Handlers -------------------------------------------------
	/** monitor changes to the maximum size of the column. */
	private maxEventListener = (): void => {
		if (this.max !== this.maxSize) {
			this.max = this.maxSize;
			this.changeEmpties();
			this.emit(Events.EventChangeMax, this);
		}
	};

	/** Monitor changes to the total size of the column */
	private sizeEventListener = (): void => {
		if (this.sze !== this.size) {
			this.sze = this.size;
			this.changeEmpties();
			this.emit(Events.EventChangeSize, this);
		}
	};

	/** Monitor changes to the ratio being set. */
	private ratioEventListener = (): void => {
		if (this.hSze !== this.headerSize) {
			this.hSze = this.headerSize;
			this.changeEmpties();
			this.emit(Events.EventChangeRatio, this);
		}
	};

	/** monitor changes to the lines for the header. */
	private linesEventListener = (): void => {
		let changed = false;
		if (this.lnes.length !== this.lines.length) changed = true;
		else {
			for (let i = 0, len = this.lnes.length; i < len; i++) {
				if (this.lnes[i] !== this.lines[i]) {
					changed = true;
					i = len;
				}
			}
		}
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
	 * @param {boolean} fix If true, the sizes will be adjusted afterwards.  Default = true.
	 * @returns {void}
	 */
	private removeInfo(nmeObject = true, fix = true): void {
		const unregister = (itm: ColumnInfo) => {
			// remove event listeners
			itm.removeListener(Events.EventChangeMax, this.maxEventListener);
			itm.removeListener(Events.EventChangeSize, this.sizeEventListener);
			itm.removeListener(Events.EventChangeRatio, this.ratioEventListener);
			itm.removeListener(Events.EventChangeLines, this.linesEventListener);
			itm.removeListener(Events.EventChangeOrder, this.orderEventListener);
		};

		if (nmeObject) {
			if (this.name !== this.name2) unregister(this.nmeCol);
			this.nmeCol = null;
		} else {
			if (this.name !== this.name2) unregister(this.numCol);
			this.numCol = null;
		}

		if (fix) this.fixSizes();
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
					this.removeInfo(true, false);
				}
				this.nmeCol = nmeInfo;
				addListeners(this.nmeCol);
			}
		}

		if (numInfo != null) {
			if (this.numCol !== numInfo) {
				if (this.numCol != null) {
					this.removeInfo(false, false);
				}
				this.numCol = numInfo;
				if (this.numCol !== this.nmeCol) addListeners(this.numCol);
			}
		}

		if (!this.proper) return;

		this.fixSizes();
	}

	/**
	 * Fixes the sizes to allow internal monitoring of any changes.
	 */
	private fixSizes(): void {
		let changed = false;
		if (this.max !== this.maxSize) {
			this.max = this.maxSize;
			changed = true;
			this.emit(Events.EventChangeMax, this);
		}
		if (this.sze !== this.size) {
			this.sze = this.size;
			changed = true;
			this.emit(Events.EventChangeSize, this);
		}
		if (this.hSze !== this.headerSize) {
			this.hSze = this.headerSize;
			changed = true;
			this.emit(Events.EventChangeRatio, this);
		}
		if (this.ordr !== this.order) {
			this.ordr = this.order;
			this.emit(Events.EventChangeOrder, this);
		}
		if (this.lnes.length !== this.lines.length) {
			this.fillArray();
			this.emit(Events.EventChangeLines, this);
		} else {
			for (let i = 0, len = this.lines.length; i < len; i++) {
				if (this.lnes[i] !== this.lines[i]) {
					this.fillArray();
					this.emit(Events.EventChangeLines, this);
					i = len;
				}
			}
		}
		if (changed) this.changeEmpties();
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
		const nme = nmeInfo || numInfo;
		const num = numInfo || nmeInfo;
		this.addInfo(nme, num);
	}

	/** reset all size values. */
	reset(): void {
		this.nmeCol.reset();
		this.numCol.reset();
	}

	/**
	 * Return a string array to ensure proper alignement of content (header or data).
	 * @param {string[]} data The data to correctly align.
	 * @param {boolean} header Set as ture if dealing with header column.  Default is false.
	 * @returns {string[]} a properly aligned array of data.
	 */
	fillLine(data: string[], header = false): string[] {
		const result: string[] = [];
		const workSize = this.ratio ? (header ? this.headerSize : this.contentSize) : this.size;
		const align = header ? this.headAlign : this.align;

		for (let i = 0, len = data.length; i < len; i++) {
			let size = getStringSize(data[i], this.tabSize, this.eLevel);
			let line = data[i];
			if (size.maxSize < workSize) {
				const diff = workSize - size.maxSize;
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
			} else if (size.maxSize > workSize) {
				if (workSize <= 0) {
					result.push('');
					continue;
				}
				for (let x = line.length - 1; x >= 0; x--) {
					let tmp = line.slice(0, x);
					size = getStringSize(tmp, this.tabSize, this.eLevel);
					if (size.maxSize <= workSize) {
						const diff = workSize - size.maxSize;
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
						x = 0;
					}
				}
			} else result.push(line);
		}
		return result.length === 0 ? [''] : result;
	}

	/**
	 * Set the size of the spacing between 2 column data objects.
	 * @param padding The padding size of the column.  Default = 2.
	 * @param vBorderSpace The verticalborder size.  Default = 0.
	 */
	changeSpace(padding = 2, vBorderSpace = 0): void {
		this.nmeCol.changeSpace(padding, vBorderSpace);
		this.numCol.changeSpace(padding, vBorderSpace);
	}
	// #endregion public function ---------------------------------------------
}
