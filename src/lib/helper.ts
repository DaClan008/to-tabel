/* eslint-disable no-control-regex */
import ansi from 'ansi-regex';
import { emojiLevel, Alignment } from '../types/options';
import { IColumnSize } from './interfaces';

const ansiRegex = ansi();

const specialEmo = [];

/**
 * get a spaced string.
 * @param {number} size The size of the space to fill.
 * @param {string} [char] An optional character to fill the space with.  Default is space.
 * @returns {string}
 */
export function fillSpace(size = 1, char = ' '): string {
	if (size < 1) return '';
	let result = '';
	for (let i = 0; i < size; i++) result += char;
	return result;
}

/**
 * Attempt to get a correct size ignoring emojis and some unicode characters.
 */
export function getCleanSize(val: string, eLevel = emojiLevel.all): number {
	// strip ansi
	let v = val.replace(ansiRegex, '');
	// eslint-disable-next-line no-control-regex
	if (eLevel === emojiLevel.none || !/[^\x00-\x7f]/.test(v)) {
		return v.length;
	}
	const specials = new RegExp(`(${specialEmo.join('|')})`);
	let len = 0;

	if (eLevel === emojiLevel.all && specialEmo.length > 0) {
		while (specials.test(v)) {
			v = v.replace(specials, '');
			len++;
		}
	}
	// eslint-disable-next-line no-control-regex
	const Ascii = v.replace(/[\x00-\x7f]/g, '|');
	// eslint-disable-next-line no-control-regex
	const nonAscii = v.replace(/[^\x00-\x7f]/g, '');

	// strip some emoji characters
	const join = '\u{200D}';

	const asciiCalc = (tot: number, str: string): number => {
		if (!str) {
			return 0;
		}
		let cnt = 0;

		const strSplit = str.split(join);

		strSplit.forEach(section => {
			switch (eLevel) {
				case emojiLevel.med:
					cnt += [...section.replace(/[\ufe00-\ufe0f]/, '')].length;
					break;
				case emojiLevel.low:
					cnt += [...section].length;
					break;
				default:
					cnt += Array.from(section.split(/[\ufe00-\ufe0f]/).join('')).length;
					break;
			}
		});
		if (eLevel === emojiLevel.all) {
			const frac = Math.ceil(cnt / strSplit.length);
			const mod = cnt % strSplit.length;
			return mod > 0 ? tot + frac - 1 : tot + frac;
		}
		return tot + cnt;
	};
	len += Ascii.split('|').reduce(asciiCalc, 0);

	return len + nonAscii.length;
}

/**
 * Returns a size object with largest and smallest value for current value.
 * @param {string} val the value of the string to get a size of.
 * @param {number} tabSize A number representing the spaces of a tab character.  Default = 2
 */
export function getStringSize(
	val: string | boolean | number,
	tabSize = 2,
	eLevel = emojiLevel.all,
): stringSize {
	const result: stringSize = {
		size: 0,
		val: '',
	};
	if (!val.toString()) return result;
	result.val = val
		.toString()
		// eslint-disable-next-line prettier/prettier, no-control-regex
		.replace(/.?[\u0008\b]/g, '')
		.replace(/\t/g, fillSpace(tabSize));
	const splt = result.val.replace(/\r?[\n\r]\r?/g, '|<S>|').split('|<S>|');

	const sizer = (str): void => {
		const s = str.replace(/[\v\f]/g, '');
		result.size = Math.max(result.size, getCleanSize(s, eLevel));
	};

	splt.forEach(str => sizer(str));
	return result;
}

export function getStringLines(valStr: string, size = -1, eLevel = emojiLevel.all): string[] {
	if (!valStr || size === 0 || size < -1) return [''];
	if (size === -1) return [valStr];
	const resultStr: string[] = [];

	// fix return lines
	if (valStr.indexOf('\r') > -1) {
		const returns = valStr.split('\r');
		returns.forEach(ret => {
			const result = getStringLines(ret, size, eLevel);
			const last = resultStr.pop();
			if (last == null || last.length === size) {
				if (last) resultStr.push(last);
				resultStr.push(...result);
				return;
			}
			if (result.length > 1) resultStr.push(...result);
			else {
				const first = result.pop(); // there should only be 1
				resultStr.push(first + last.substring(first.length));
			}
		});
		return resultStr;
	}

	const asciiChars = valStr
		.replace(/[\x00-\x7f]/g, '|')
		.split('|')
		.filter(asci => asci !== '');
	const nonAscArr = eLevel === emojiLevel.none ? [valStr] : valStr.split(/[^\x00-\x7f]/);
	let run = '';
	let runSize = 0;
	let lastSingle = '';
	let removed = '';

	const cleanRun = (add = true) => {
		runSize = 0;
		lastSingle = '';
		if (!run) return;
		/* istanbul ignore else: no else */
		if (add) resultStr.push(run);
		run = '';
	};

	const removeLastChar = () => {
		if (removed) {
			/* istanbul ignore else: no else */
			if (removed !== '\b') run += removed;
			removed = '\b';
		} else {
			const removeLen = runSize < 1 ? 0 : lastSingle ? lastSingle.length : 1;
			removed = run.substring(run.length - removeLen);
			run = run.substring(0, run.length - removeLen);
		}
	};

	// find a single emoji character from multiple unicode chars
	const findSingle = (val: string): string => {
		let single = '';
		let prev = '';
		let running = '';
		let sze = 0;
		for (let i = 0, len = val.length; i < len; i++) {
			running += val[i];
			sze = getCleanSize(running, eLevel);
			if (sze > 1 && single === '') single = prev;
			else if (sze === 1) single = '';
			prev = running;
		}
		if (sze === 1 && single === '') single = running;
		return single;
	};

	// find all single emoji chars from multiple unicode chars
	const findAllSingles = (val: string): void => {
		const list = [];
		let v = val;
		while (v.length) {
			list.push(findSingle(v));
			v = v.substring(list[list.length - 1].length);
		}
		list.forEach(single => {
			if (runSize >= size) cleanRun();
			run += single;
			lastSingle = single;
			runSize++;
		});
	};

	// add a complex text string (no unicode)
	const addString = (val: string) => {
		// fix starting spaces.
		const skip = val.charAt(0) === ' ' ? (run ? 1 : val.length - val.trimLeft().length) : 0;
		val.split(' ').forEach((v, idx) => {
			if (skip > idx) return;
			// remove erased chars
			const v2 = v.replace(/[\n\f\v][\b\u0008]/g, '');
			const len = v2.length;
			const nIdx = v2.indexOf('\n');
			const backSpace =
				Math.max(0, (v2.match(/[\b\u0008]/g) || []).length) + nIdx > -1 ? len - nIdx : 0;
			const space = run && (len === 0 || idx > 0);
			// fix start position
			if (
				runSize + len + (space ? 1 : 0) - backSpace > size &&
				(len - backSpace <= size || runSize + (space ? 1 : 0) === size)
			) {
				cleanRun();
			} else if (space) {
				run += ' ';
				runSize++;
			}
			let spacer = 0;
			for (let i = 0; i < len; i++) {
				const char = v2[i];
				switch (char) {
					case '\u0008':
					// break omitted
					case '\b':
						removeLastChar();
						break;
					case '\v':
					// break omitted
					case '\f':
						spacer = runSize;
					// break omitted
					case '\n':
						cleanRun();
						if (spacer) {
							run = fillSpace(spacer);
							runSize = spacer;
							spacer = 0;
						}
						break;
					default:
						lastSingle = '';
						run += char;
						runSize++;
						break;
				}
				if (runSize >= size) cleanRun();
			}
		});
	};

	for (let i = 0, len = nonAscArr.length; i < len; i++) {
		if (runSize >= size) cleanRun();
		if (nonAscArr[i] === '') {
			const uni = asciiChars.shift();
			/* istanbul ignore if: safety check */
			if (!uni) continue;
			findAllSingles(uni);
			const old = i;
			i += Math.max(0, uni.length - 1);
			/* istanbul ignore else: no else */
			if (nonAscArr[i] && /[\x00-\x7f]/.test(nonAscArr[i])) {
				while (/[\x00-\x7f]/.test(nonAscArr[i]) && i > old) i--;
			}
		} else addString(nonAscArr[i]);
	}
	/* istanbul ignore else: no else */
	if (run) resultStr.push(run);

	return resultStr;
}
/**
 * Convert an array of strings to match the correct size per string.
 * @param {string[]} data The data to correct if needs be.
 * @param {IColumnSize} colSize A columnInfo object to establish the correct sizes with.
 * @param {boolean} header If true, the info relate to the header component
 * (applicable if table is not flat).  Else the data relate to the content.
 * @returns {string[]}
 */
export function fillLine(data: string[], colSize: IColumnSize, header = false): string[] {
	if (!data || data.length === 0 || colSize == null) return [];
	const result: string[] = [];
	const workSize = colSize.ratio
		? header
			? colSize.headerSize
			: colSize.contentSize
		: colSize.size;
	const align = header ? colSize.headAlign : colSize.align;

	const split = (diff: number, lne: string): string => {
		const left = Math.floor(diff / 2);
		return `${fillSpace(left)}${lne}${fillSpace(diff - left)}`;
	};

	data.forEach(line => {
		let size = getStringSize(line, colSize.tabSize, colSize.eLevel);
		let current = line;
		if (size.size === workSize) current = line;
		else if (size.size < workSize) {
			const diff = workSize - size.size;
			switch (align) {
				case Alignment.center:
					current = split(diff, current);
					break;
				case Alignment.right:
					current = fillSpace(diff) + current;
					break;
				default:
					current += fillSpace(diff);
					break;
			}
		} else {
			size = getStringSize(line.slice(0, -1), colSize.tabSize, colSize.eLevel);
			while (size.size < workSize) {
				size = getStringSize(size.val.slice(0, -1), colSize.tabSize, colSize.eLevel);
			}
			current = size.val;
		}
		if (current.trim()) result.push(current);
	});

	return result;
}

export function isNum(val: unknown): boolean {
	if (val == null) return false;
	const v = val.toString();
	if (/^-{0,1}\d+(\.\d+)?$/.test(v)) return true;
	return false;
}

export function addSpecialEmo(emo: string | string[]): void {
	if (Array.isArray(emo)) specialEmo.push(...emo);
	else specialEmo.push(emo);
}

export type stringSize = {
	size: number;
	val: string;
};
