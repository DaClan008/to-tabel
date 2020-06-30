import ansi from 'ansi-regex';
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
	if (eLevel === emojiLevel.none) return v.length;
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
		if (!str) return 0;
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

export function getStringLines(str: string, size = -1, eLevel = emojiLevel.all): string[] {
	const lines: string[] = [];
	if (size === 0) return lines;

	let currSize = 0;
	let returnline = '';
	let curr = '';
	let currShort = '';

	const removeChar = (removeStr): string => {
		let tmp = removeStr;
		const startLen = getCleanSize(tmp, eLevel);
		if (startLen <= 1) return '';

		while (getCleanSize(tmp, eLevel) !== startLen - 1 && tmp !== '') {
			tmp = tmp.slice(0, tmp.length);
		}

		return tmp;
	};

	// testing 8 chars ahead for special unicode combinations.
	const cleanChar = (testStr: string, start = 0): number => {
		let answer = 0;
		let tmp = '';
		const end = Math.min(testStr.length, start + 8);
		const char8 = testStr + str.slice(start + 1, end);
		const cleanSz = getCleanSize(char8, eLevel);
		if (cleanSz === end - start) return start;
		// return the last
		for (let i = start; i < end; i++) {
			tmp += str[i];
			if (getCleanSize(tmp, eLevel) === 1) answer = i;
		}
		return answer;
	};

	const endSpace = (): void => {
		const shortLen = getCleanSize(currShort, eLevel);
		if (currSize === size) {
			lines.push(curr);
			curr = '';
			currSize = 0;
		}

		if (currSize + shortLen + (curr !== '' ? 1 : 0) <= size || (size === -1 && currSize > 0)) {
			if (curr !== '') {
				curr += ' ';
				currSize++;
			}
			curr += currShort;
			currSize += shortLen;
		} else if (shortLen > size) {
			// we need to split up shortLen
			let tmp = curr;
			let complex = currShort.length !== getCleanSize(currShort, eLevel);
			curr = '';
			tmp += tmp === '' ? '' : ' ';

			for (let i = 0, len = currShort.length; i < len; i++) {
				if (getCleanSize(tmp, eLevel) === size) {
					lines.push(tmp);
					tmp = '';
					const newCurr = currShort.slice(i);
					complex = newCurr.length !== getCleanSize(newCurr, eLevel);
				}
				const to = complex ? cleanChar(currShort, i) : i;
				if (to !== i) {
					tmp += currShort.slice(i, to - i + 1);
					i = to;
				} else tmp += currShort[i];
			}
			if (getCleanSize(tmp, eLevel) === size) {
				lines.push(tmp);
				curr = '';
				returnline = '';
			} else curr = tmp;
			currSize = getCleanSize(curr, eLevel);
		} else {
			lines.push(curr);
			curr = currShort;
			currSize = shortLen;
		}
		currShort = '';
	};

	for (let i = 0, len = str.length; i < len; i++) {
		const char = str[i];

		switch (char) {
			case ' ':
				endSpace();
				break;
			case '\n':
				if (currShort !== '') {
					endSpace();
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
					curr = removeChar(curr);
					currSize = getCleanSize(curr, eLevel);
				}
				break;
			case '\r':
				returnline = curr + (curr !== '' && currShort !== '' ? ' ' : '') + currShort;
				curr = '';
				currShort = '';
				currSize = 0;
				break;
			case '\f':
			// break omitted
			case '\v':
				endSpace();
				if (curr !== '') {
					lines.push(curr);
					curr = fillSpace(curr.length, ' ');
				}
				break;
			default:
				currShort += char;
				break;
		}
	}

	if (currShort !== '') {
		endSpace();
		if (curr !== '') lines.push(curr);
	}
	if (returnline) {
		const idx = lines.length - 1;
		const last = lines[idx];
		const lastlen = getCleanSize(last);
		const returnlen = getCleanSize(returnline);
		if (returnlen > lastlen) {
			lines[idx] += returnline.substr(lastlen);
		}
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
