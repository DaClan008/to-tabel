/* eslint-disable no-param-reassign */
import { EventEmitter } from 'events';
import { kMaxLength } from 'buffer';
import * as Events from './events';
import { ColumnInfo } from './columnInfo';
import { Alignment, emojiLevel } from '../types/options';
import { fillSpace, arrayMatch } from './helper';
import { IColumnSize } from './interfaces';

export class CombinedInfo extends EventEmitter implements IColumnSize {
	// #region private variables
	// GENERAL VARIABLES ======================================================
	/**
	 * A variable of spaces which equal the length of the content in the column.
	 * This is used to put in place of an empty row (no data).
	 */
	private emptyC = '';

	/**
	 * A variable of spaces which equal the length of the header size in the column.
	 * This is used to put in place of an empty header space (if needed).
	 */
	private emptyH = '';

	/**
	 * Holder of the last verified lines for the header.
	 * Is used to confirm against current line values and if change, trigger a change event.
	 */
	private lnes: string[] = [];

	/**
	 * A placeholder variable for the Name based column object.
	 * Makes up the column information together with any number based column if any.
	 */
	private nmeCol: ColumnInfo;

	/**
	 * A placeholder variable for the Number based column object.
	 * Makes up the column information together with any name based column if any.
	 */
	private numCol: ColumnInfo;

	/**
	 * A variable that if true will change the sizes of the column without emitting
	 * any event change events.
	 * @default false
	 */
	private silent = false;

	// SIZE CONFIRMING VARIABLES ==============================================

	/**
	 * A variable holding the last verified content size.
	 * Is used to confirm if there were any changes to the current content size.
	 */
	private cSze = 0;

	/**
	 * A variable holding the last verified maximum content size for the column.
	 * Is used to confirm if there were any changes to the current maximum content size.
	 */
	private dataMax = -1;

	/**
	 * A variable holder the last verified header size for the column.
	 * Is used to confirm if there were any changes to the current header size.
	 */
	private hSze = 0;

	/**
	 * A variable holding the last verified maximum size for the column.
	 * Is used to confirm if there were any changes to the current maximum size.
	 */
	private max = 0;

	/**
	 * Variable holding the last verified size for the column.
	 * Is used to confirm if there were any changes to the current size.
	 */
	private sze = 0;

	// #endregion private variables

	// #region properties
	// STATE PROPERTIES =======================================================
	/**
	 * Get the type of alignment used for the for the column content.
	 */
	get align(): Alignment {
		const { numCol, nmeCol } = this;
		if (nmeCol != null && nmeCol.align !== Alignment.left) return nmeCol.align;
		if (numCol != null && numCol.align !== Alignment.left) return numCol.align;
		return Alignment.left;
	}

	/**
	 * Get the emoji level to use when calculating the string size for the column.
	 * The named Column property is prefered.
	 */
	get eLevel(): emojiLevel {
		if (this.nmeCol) return this.nmeCol.eLevel;
		if (this.numCol) return this.numCol.eLevel;
		return emojiLevel.all;
	}

	/**
	 * Get a boolean that is true if the current column has content rows, else false.
	 */
	get hasContent(): boolean {
		const { numCol, nmeCol } = this;
		return (nmeCol && nmeCol.hasContent) || (numCol && numCol.hasContent);
	}

	/**
	 * Get the type of alignment used for the column header.
	 */
	get headAlign(): Alignment {
		const { numCol, nmeCol } = this;
		if (nmeCol != null && nmeCol.headAlign !== Alignment.left) return nmeCol.headAlign;
		if (numCol != null && numCol.headAlign !== Alignment.left) return numCol.headAlign;
		return Alignment.left;
	}

	/**
	 * Get a boolean value which is true if the size of the column pair is fixed.
	 */
	get isFixed(): boolean {
		const nme = this.nmeCol ? this.nmeCol.isFixed : false;
		const num = this.numCol ? this.numCol.isFixed : false;
		return nme || num;
	}

	/**
	 * Get a boolean value which is true if the setSize is a decimal value, else false.
	 */
	get isPercent(): boolean {
		const nme = this.nmeCol ? this.nmeCol.isPercent : false;
		const num = this.numCol ? this.numCol.isPercent : false;
		return nme || num;
	}

	/**
	 * Get a boolean which is true if any of the columns in this pair has a fixed maximum size.
	 */
	get maxFix(): boolean {
		return (this.nmeCol && this.nmeCol.maxFix) || (this.numCol && this.numCol.maxFix);
	}

	/**
	 * Get a number representing the order of this column pair vs other column pairs.
	 * If both pairs has different order numbers, the lesser order number is preferred.
	 */
	get order(): number {
		const { nmeCol, numCol } = this;
		let order = 0;
		if (nmeCol && nmeCol.order > 0) order = nmeCol.order;
		if (numCol && numCol.order > 0) {
			order = order === 0 ? numCol.order : Math.min(order, numCol.order);
		}
		return order;
	}

	/**
	 * Get a boolean to confirm if the column objects was correctly added.
	 * The CombinedInfo object will not function properly if proper is false.
	 */
	get proper(): boolean {
		return this.nmeCol != null || this.numCol != null;
	}

	// SIZE PROPERTIES ========================================================
	/**
	 * Get the actual size that the content needs to display as.
	 */
	get contentSize(): number {
		const { numCol, nmeCol } = this;
		return nmeCol == null ? (numCol == null ? 0 : numCol.contentSize) : nmeCol.contentSize;
	}

	/**
	 * Set the size of the other headers in the table.
	 * This is used when headers are stacked Vertically below each other in a table.
	 */
	set headerExternal(val: number) {
		const { numCol, nmeCol } = this;
		if (numCol) numCol.headerExternal = val;
		if (nmeCol) nmeCol.headerExternal = val;
	}

	/**
	 * Get the actual size that the header needs to display.
	 */
	get headerSize(): number {
		return this.nmeCol == null
			? this.numCol == null
				? 0
				: this.numCol.headerSize
			: this.nmeCol.headerSize;
	}

	/**
	 * Get the maximum 'data' size for the content component (rows)
	 */
	get maxContent(): number {
		const nme = this.nmeCol == null ? 0 : this.nmeCol.maxContent;
		const num = this.numCol == null ? 0 : this.numCol.maxContent;
		return Math.max(nme, num, 0);
	}

	/**
	 * Get the maximum 'data' size for the header component.
	 */
	get maxHeader(): number {
		return this.nmeCol == null
			? this.numCol == null
				? 0
				: this.numCol.maxHeader
			: this.nmeCol.maxHeader;
	}

	/** Get the maximum size for the column pair */
	get maxSize(): number {
		const { nmeCol, numCol, ratio } = this;
		const nme = nmeCol == null ? 0 : ratio ? nmeCol.maxContent : nmeCol.maxSize;
		const num =
			numCol != null
				? ratio || nmeCol
					? numCol.maxContent || numCol.maxSize
					: numCol.maxSize
				: 0;
		const nmeFixed = nmeCol && (nmeCol.maxFix || nmeCol.isFixed);
		const numFixed = numCol && (numCol.maxFix || numCol.isFixed);
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

	/** Get the minimum size for the column pair */
	get minSize(): number {
		const nme = this.nmeCol == null ? 0 : this.nmeCol.minSize;
		const num = this.numCol == null ? 0 : this.numCol.minSize;
		return Math.max(nme, num, 0);
	}

	/**
	 * Get or set the ratio of the column.
	 * The ratio is (headersize / (content + headersize)).
	 * Is used to determine how much space the header should take up vs content
	 * If the header and content aligns horizontally next to each other.
	 */
	get ratio(): number {
		const { numCol, nmeCol } = this;
		return nmeCol == null ? (numCol == null ? 0 : numCol.ratio) : nmeCol.ratio;
	}

	set ratio(val: number) {
		const { numCol, nmeCol } = this;
		if (val < 0 || val > 1) return;
		if (nmeCol != null) nmeCol.ratio = val;
		else if (numCol != null) numCol.ratio = val;
	}

	/**
	 * Get the size that was set for the column pair.
	 * The named column set size will always take preference over a numbered column.
	 * @default -1
	 */
	get setsize(): number {
		let val = -1;
		const { nmeCol, numCol } = this;
		if (nmeCol) {
			val = nmeCol.setsize;
			if (val >= 0) return val;
		}
		if (numCol) return numCol.setsize;
		return -1;
	}

	/**
	 * Get and set the actual size for the column.
	 */
	get size(): number {
		let sze = 0;
		const { nmeCol, numCol, maxFix, maxSize, minSize } = this;
		const fixedNme = nmeCol && nmeCol.isFixed;
		const fixedNum = numCol && numCol.isFixed;
		if (fixedNme) sze = nmeCol.size;
		else if (fixedNum) sze = numCol.size;
		else if (nmeCol) sze = nmeCol.size;
		else sze = numCol != null ? numCol.size : 0;
		sze = maxFix && maxSize > 0 ? Math.min(sze, maxSize) : sze;
		return sze >= minSize ? sze : 0;
	}

	set size(val: number) {
		const { maxFix, maxSize, minSize, nmeCol, numCol } = this;
		let sze = maxFix && maxSize > 0 ? Math.min(val, maxSize) : val;
		if (sze > -1 && sze < minSize) sze = 0;
		if (sze <= 0) {
			const fixedNme = nmeCol && nmeCol.isFixed;
			const fixedNum = numCol && numCol.isFixed;
			if (fixedNme) {
				if (sze === -1) nmeCol.size = -1;
				sze = nmeCol.size > sze && sze > -1 ? 0 : nmeCol.size;
			} else if (fixedNum) {
				if (sze === -1) numCol.size = -1;
				sze = nmeCol.size > sze && sze > -1 ? 0 : numCol.maxSize;
			}
		}
		if (nmeCol != null) nmeCol.size = sze;
		if (numCol != null) numCol.size = sze;
	}

	/**
	 * Get the spacer size for the column.  The spacer is the space between
	 * the header component and content component if header and content aligns horizontally.
	 */
	get spacer(): number {
		const { nmeCol, numCol } = this;
		return nmeCol == null ? (numCol == null ? 0 : numCol.spacer) : nmeCol.spacer;
	}

	/**
	 * Get the space that the data in the column takes up.  (size - spacer)
	 * This is same as size, unless ratio is used (header and content is horizontal).
	 */
	get spaceSize(): number {
		const { nmeCol, numCol } = this;
		return nmeCol == null ? (numCol == null ? 0 : numCol.spaceSize) : nmeCol.spaceSize;
	}

	/**
	 * Get or set the size of the table (used with percentage property)
	 */
	get tableSize(): number {
		const { numCol, nmeCol } = this;
		const nme = nmeCol ? nmeCol.tableSize : -1;
		const num = numCol ? numCol.tableSize : -1;
		return nme === -1 && num === -1 ? 0 : Math.max(nme, num);
	}

	set tableSize(val: number) {
		const { numCol, nmeCol } = this;
		/* istanbul ignore else: no else */
		if (nmeCol != null) nmeCol.tableSize = val;
		if (numCol != null) numCol.tableSize = val;
	}

	/**
	 * Get the tab sizing to use (spacing for tab characters) for this column.
	 * A named column tabSizing takes preference.
	 */
	get tabSize(): number {
		const { nmeCol, numCol } = this;
		if (nmeCol) return nmeCol.tabSize;
		if (numCol) return numCol.tabSize;
		return 2;
	}

	// STRING PROPERTIES ======================================================
	/**
	 * Get a space filled string value equal in length as content size of the column
	 * Used when an empty content space is needed.
	 */
	get emptyContent(): string {
		return this.emptyC;
	}

	/**
	 * Get a of space filled string value equal in length as header size of the column.
	 * Used when an empty header space is needed.
	 */
	get emptyHeader(): string {
		return this.emptyH;
	}

	/**
	 * Get a string array with the lines of the header component (excluding padding etc).
	 */
	get lines(): string[] {
		if (this.nmeCol == null) {
			if (this.numCol == null) return [];
			return this.numCol.lines;
		}
		return this.nmeCol.lines;
	}

	/**
	 * Get the name of the named column in this column pair.
	 * If no named column exists returns an empty string.
	 */
	get name(): string {
		return this.nmeCol == null ? '' : this.nmeCol.name;
	}

	/**
	 * Get the name of the numbered column in this column pair.
	 * If no numbered column exists returns an empty string.
	 */
	get name2(): string {
		return this.numCol == null ? '' : this.numCol.name;
	}

	// #endregion properties --------------------------------------------------

	constructor(nmeInfo: ColumnInfo, numInfo?: ColumnInfo) {
		super();
		if (nmeInfo == null && numInfo == null) return;
		this.addCol(nmeInfo, numInfo);
		if (this.nmeCol && this.numCol && this.numCol.isFixed) this.size = -1;
	}

	// #region Event Handlers -------------------------------------------------
	/**
	 * Is called when the maximum size change of one of the column pairs
	 * affects the layout of the column.
	 */
	private maxEventListener = (col: ColumnInfo): void => {
		const { max, maxSize, dataMax, maxContent, name2, silent, nmeCol } = this;
		if ((max === maxSize && dataMax === maxContent) || silent) return;
		if (col.name === name2 && nmeCol) {
			nmeCol.setExternalMax(col.maxContent);
			return;
		}
		this.max = maxSize;
		// sort out max event first
		this.dataMax = maxContent;
		this.emit(Events.EventChangeMax, this);
		// adjust other variables
		this.changeEmpties();
	};

	/**
	 * Is called when a size change on one of the column pairs
	 * affects the layout of the column.
	 */
	private sizeEventListener = (col: ColumnInfo): void => {
		const { sze, size, silent, name2, nmeCol, numCol } = this;
		if (sze === size || silent) return;

		if (col.name === name2 && nmeCol) {
			const fixedNme = nmeCol && nmeCol.isFixed;
			const fixedNum = numCol && numCol.isFixed;
			/* istanbul ignore else: no else in test */
			if (fixedNum && !fixedNme && nmeCol != null) nmeCol.size = col.size;
			return;
		}
		this.sze = size;
		if (numCol) numCol.size = size;
		this.changeEmpties();
		this.emit(Events.EventChangeSize, this);
	};

	/**
	 * Is called when the ratio change of one of the column pairs
	 * affects the layout of the column
	 */
	private ratioEventListener = (col: ColumnInfo): void => {
		const { hSze, headerSize, cSze, contentSize, silent } = this;
		if ((hSze === headerSize && cSze === contentSize) || silent) return;
		// if (col.name === this.name2 && this.nmeCol) return;
		this.hSze = headerSize;
		this.cSze = contentSize;
		this.changeEmpties();
		this.emit(Events.EventChangeRatio, this);
	};

	/**
	 * Is called when the lines of one of the column pairs has changed.
	 */
	private linesEventListener = (col: ColumnInfo): void => {
		const { nmeCol, name2, lnes, lines, silent } = this;
		if ((col.name === name2 && nmeCol) || silent) return;

		/* istanbul ignore else: no else */
		if (!arrayMatch(lines, lnes)) {
			this.fillArray();
			this.emit(Events.EventChangeLines, this);
		}
	};

	// #endregion Event Handlers ----------------------------------------------

	// #region private functions ----------------------------------------------
	/**
	 * Copy the values of the lnes array to the lines array.
	 */
	private fillArray(): void {
		this.lnes = this.lines.map(line => line, []);
	}

	/**
	 * Fixes the locally stored size variables to allow internal monitoring of any changes.
	 * @param silent If set to true, will not emit any events on any changes made.  Default = false
	 */
	private fixSizes(silent = false): void {
		let changed = false;
		// max
		const { max, maxSize } = this;
		if (max !== maxSize) {
			this.max = maxSize;
			changed = true;
			/* istanbul ignore else: no else */
			if (!silent) this.emit(Events.EventChangeMax, this);
		}
		// ratio
		const { hSze, headerSize } = this;
		if (hSze !== headerSize) {
			this.hSze = headerSize;
			changed = true;
			/* istanbul ignore else: no else */
			if (!silent) this.emit(Events.EventChangeRatio, this);
		}
		// lines
		const { lnes, lines } = this;
		if (!arrayMatch(lnes, lines)) {
			this.fillArray();
			changed = true;
			/* istanbul ignore else: else never ran - safety */
			if (!silent) this.emit(Events.EventChangeLines, this);
		}

		// size
		const { sze, size } = this;
		if (sze !== size) {
			this.sze = size;
			changed = true;
			/* istanbul ignore else: no else */
			if (!silent) this.emit(Events.EventChangeSize, this);
		}

		// fix if needs be
		if (changed) this.changeEmpties();
		const { nmeCol, numCol, tableSize, size: size2 } = this;
		// fix nmeCol tableSize and size
		if (nmeCol != null) {
			if (Math.max(nmeCol.tableSize, 0) !== tableSize) this.nmeCol.tableSize = tableSize;
			if (nmeCol.size !== size2) this.nmeCol.internalSizeChange(size2);
		}
		if (numCol == null) return;
		// fix numCol tableSize and size
		if (Math.max(numCol.tableSize, 0) !== tableSize) this.numCol.tableSize = tableSize;
		if (numCol.size !== size2) this.numCol.internalSizeChange(size2);
	}

	// #endregion private function --------------------------------------------

	// #region public funcionts -----------------------------------------------
	/**
	 * Compare and add new info objects to this object.
	 * @param nmeInfo A potentially new name info object for this object.
	 * @param numInfo A potentially new number info object for this object.
	 */
	addCol(nmeInfo: ColumnInfo, numInfo: ColumnInfo): boolean {
		const addListeners = (itm: ColumnInfo): void => {
			itm.on(Events.EventChangeMax, this.maxEventListener);
			itm.on(Events.EventChangeSize, this.sizeEventListener);
			itm.on(Events.EventChangeRatio, this.ratioEventListener);
			itm.on(Events.EventChangeLines, this.linesEventListener);
		};

		if ((nmeInfo == null && numInfo == null) || (this.nmeCol != null && this.numCol != null)) {
			return false;
		}
		let order = 0;
		let change = false;
		// add columns if needed
		if (nmeInfo != null && this.nmeCol == null) {
			this.nmeCol = nmeInfo;
			order = nmeInfo.order;
			change = true;
		}

		if (numInfo != null && this.numCol == null) {
			this.numCol = numInfo;
			change = true;
			if (numInfo.order && order === 0) order = numInfo.order;
		}
		// sort out table sizes
		if (!change || !this.proper) return false;

		const { tableSize } = nmeInfo || numInfo;
		if (tableSize > 0 && this.tableSize !== tableSize) this.tableSize = tableSize;
		// merge values
		let size = -1;
		let maxContent = -1;
		this.silent = true;
		if (this.numCol != null) {
			this.numCol.reset();
			size = this.numCol.isFixed ? this.numCol.size : -1;
			maxContent = size > 0 ? size : this.numCol.maxContent;
		}
		if (this.nmeCol != null) {
			this.nmeCol.reset();
			size = this.nmeCol.isFixed ? this.nmeCol.size : -1;
			if (maxContent > 0) this.nmeCol.setExternalMax(maxContent, size);
			if (size > -1) this.hSze = this.headerSize;
		}
		this.silent = false;
		this.fixSizes();

		if (this.nmeCol != null && !this.nmeCol.listening) {
			addListeners(this.nmeCol);
			this.nmeCol.listening = true;
		}

		if (this.numCol != null && !this.numCol.listening) {
			addListeners(this.numCol);
			this.numCol.listening = true;
		}

		return true;
	}

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
	 * Set the size of the spacing used between 2 column data objects.
	 * @param padding The padding size of the column.  Default = 2.
	 * @param vBorderSpace The verticalborder size.  Default = 0.
	 */
	changeSpace(padding = 2, vBorderSpace = 0): void {
		if (this.nmeCol) this.nmeCol.changeSpace(padding, vBorderSpace);
		if (this.numCol) this.numCol.changeSpace(padding, vBorderSpace);
	}

	/**
	 * Resets the internal maxContent value.
	 */
	resetContent(): void {
		if (this.numCol != null) this.numCol.resetContent();
		if (this.nmeCol != null) this.nmeCol.resetContent();
	}
	// #endregion public function ---------------------------------------------
}
