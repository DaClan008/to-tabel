import ansi from 'ansi-regex';
import { check } from 'prettier';
import { emojiLevel } from '../types/options';

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

export function getComplexUniArray(valStr: string, size = -1, eLevel = emojiLevel.all): string[] {
	if (!valStr || size === 0 || size < -1) return [''];
	if (size === -1) return [valStr];
	const asciiChars = valStr
		// eslint-disable-next-line no-control-regex
		.replace(/[\x00-\x7f]/g, '|')
		.split('|')
		.filter(asci => asci !== '');
	// eslint-disable-next-line no-control-regex
	const nonAscArr = eLevel === emojiLevel.none ? valStr : valStr.split(/[^\x00-\x7f]/);
	const resultStr: string[] = [];

	let run = '';
	let runSize = 0;

	const checkRun = () => {
		if (runSize >= size) {
			runSize = 0;
			if (!run) return;
			resultStr.push(run);
			run = '';
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
			checkRun();
			run += single;
			runSize++;
		});
	};

	// add a word that is longer than size
	const addWord = (val: string): void => {
		let v: string;
		if (runSize - size >= size) {
			const diff = runSize - size;
			run += val.substring(0, val.length - diff);
			v = val.substring(val.length - diff);
		} else v = val;
		while (v) {
			checkRun();
			run = v.substring(0, size);
			runSize = size;
			v = v.substring(size);
		}
	};

	// add a complex text string (no unicode)
	const addString = (val: string) => {
		val.split(' ').forEach((v, idx) => {
			checkRun();
			runSize += v === '' ? 1 : (idx > 0 && run ? 1 : 0) + v.length;
			const old = runSize - v.length;
			if (runSize <= size) {
				run += v === '' ? ' ' : (idx > 0 && run ? ' ' : '') + v;
				return;
			}
			if (v.length > size + (old > 0 ? size - old : 0)) addWord((idx > 0 ? ' ' : '') + v);
			else {
				const addition = v.substring(0, Math.max(0, size - old));
				/* istanbul ignore next: no test ran with run or addition values being '' */
				resultStr.push(run + (run && addition ? ' ' : '') + addition);
				run = v.substring(size - old);
				runSize = run.length;
			}
		});
	};

	for (let i = 0, len = nonAscArr.length; i < len; i++) {
		checkRun();
		if (nonAscArr[i] === '') {
			const uni = asciiChars.shift();
			/* istanbul ignore if: safety check */
			if (!uni) continue;
			findAllSingles(uni);
			i += uni.length - 1;
		} else {
			const diff = size - runSize;
			if (diff >= nonAscArr[i].length) {
				run += nonAscArr[i];
				runSize += nonAscArr[i].length;
			} else addString(nonAscArr[i]);
		}
	}
	/* istanbul ignore else: no else */
	if (run) resultStr.push(run);

	return resultStr;
}

export function getStringLines(str: string, size = -1, eLevel = emojiLevel.all): string[] {
	if (!str || size === 0 || size < -1) return [''];
	if (size === -1) return [str];

	const lines: string[] = [];
	let currSize = 0;
	let returnline = '';
	let curr = '';
	let currShort = '';

	const removeChar = (removeStr): string => {
		let tmp = removeStr;
		const startLen = getCleanSize(tmp, eLevel);

		while (getCleanSize(tmp, eLevel) !== startLen - 1 && tmp !== '') {
			tmp = tmp.slice(0, tmp.length - 1);
		}

		return tmp;
	};

	const endSpace = (): void => {
		const shortLen = getCleanSize(currShort, eLevel);
		if (currSize === size) {
			lines.push(curr);
			curr = '';
			currSize = 0;
			returnline = '';
		}

		/* istanbul ignore next: currSize > 0 never hit */
		if (currSize + shortLen + (curr !== '' ? 1 : 0) <= size || (size === -1 && currSize > 0)) {
			if (curr !== '') {
				curr += ' ';
				currSize++;
			}
			curr += currShort;
			currSize += shortLen;
		} else if (shortLen > size) {
			/* istanbul ignore next: empty string just for safety */
			let tmp = curr ? curr + (currShort ? ' ' : '') : '';
			tmp += currShort;
			const arr = getComplexUniArray(tmp, size, eLevel);
			/* istanbul ignore next: empty string just for safety */
			const last = arr.pop() || '';
			/* istanbul ignore else: no else */
			if (arr.length > 0) lines.push(...arr);
			curr = last;
			currSize = getCleanSize(curr);
			currShort = '';
		} else {
			lines.push(curr);
			curr = currShort;
			currSize = shortLen;
		}
		currShort = '';
	};

	for (let i = 0, len = str.length; i < len; i++) {
		const char = str.charAt(i);

		switch (char) {
			case ' ':
				endSpace();
				break;
			case '\n':
				/* istanbul ignore else: no else */
				if (currShort !== '') {
					endSpace();
					/* istanbul ignore else: no else */
					if (curr !== '') {
						lines.push(curr);
						curr = '';
					}
				} else {
					lines.push(curr);
					curr = '';
				}
				currSize = 0;
				break;
			case '\u0008':
			// break omitted
			case '\b':
				if (currShort !== '') currShort = removeChar(currShort);
				else if (curr !== '') {
					currShort = curr;
					curr = '';
					currSize = 0;
				}
				break;
			case '\r':
				returnline = curr + (curr !== '' && currShort !== '' ? ' ' : '') + currShort;
				if (getCleanSize(currShort) + currSize <= size) {
					curr = '';
					currSize = 0;
				}
				currShort = '';
				break;
			case '\f':
			// break omitted
			case '\v':
				endSpace();
				/* istanbul ignore else: no else */
				if (curr !== '') {
					currShort = fillSpace(currSize, ' ');
					if (currShort.length === size) currShort = '';
					/* istanbul ignore else: no else */
					if (curr !== '') {
						lines.push(curr);
						curr = '';
						currSize = 0;
					}
				}
				break;
			default:
				currShort += char;
				break;
		}
	}

	/* istanbul ignore else: no else */
	if (currShort !== '') {
		endSpace();
		/* istanbul ignore else: no else */
		if (curr !== '') lines.push(curr);
	}
	if (returnline) {
		const idx = lines.length - 1;
		const last = lines[idx];
		const lastlen = getCleanSize(last);
		const returnlen = getCleanSize(returnline);
		/* istanbul ignore else: no else */
		if (returnlen > lastlen) lines[idx] += returnline.substr(lastlen);
	}
	return lines;
}

export function isNum(val: unknown): boolean {
	if (val == null) return false;
	const v = val.toString();
	if (/-{0,1}\d+(\.\d+)?/.test(v)) return true;
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
