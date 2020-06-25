import ansi from 'ansi-regex';
import { Options, columnSize } from '../types/options';

const ansiRegex = ansi();
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
export function getCleanSize(val: string): number {
	// strip ansi
	const v = val.replace(ansiRegex, '');

	// strip some emoji characters
	const join = '\u{200D}';
	const strSplit = v.split(join);
	let cnt = 0;

	strSplit.forEach(section => {
		const num = Array.from(section.split(/[\ufe00-\ufe0f]/).join('')).length;
		cnt += num;
	});
	return cnt / strSplit.length;
}

/**
 * Returns a size object with largest and smallest value for current value.
 * @param {string} val the value of the string to get a size of.
 * @param {number} tabSize A number representing the spaces of a tab character.  Default = 2
 */
export function getStringSize(val: string | boolean | number, tabSize = 2): stringSize {
	const result: stringSize = {
		maxSize: 0,
		minSize: 0,
		val: '',
	};
	if (!val) return result;
	// eslint-disable-next-line prettier/prettier
	result.val = val.toString().trim().replace(/\t/g, fillSpace(tabSize));
	const splt = result.val.replace(/\r?[\n\r]\r?/g, '|<S>|').split('|<S>|');

	const sizer = (str): void => {
		// eslint-disable-next-line no-control-regex
		const s = str.replace(/.\u0008/g, '').replace(/\v\f/g, '');
		result.maxSize = Math.max(result.maxSize, getCleanSize(s));
	};

	splt.forEach(str => sizer(str));
	return result;
}

export function getStringLines(str: string, size = -1): string[] {
	const lines: string[] = [];
	if (size === 0) return lines;

	let currSize = 0;
	let curr = '';
	let currShort = '';

	const removeChar = (removeStr): string => {
		let tmp = removeStr;
		const startLen = getCleanSize(tmp);
		if (startLen <= 1) return '';

		while (getCleanSize(tmp) !== startLen - 1 && tmp !== '') tmp = tmp.slice(0, tmp.length);

		return tmp;
	};

	// testing 8 chars ahead for special unicode combinations.
	const cleanChar = (testStr: string, start = 0): number => {
		let answer = 0;
		let tmp = '';
		const end = Math.min(testStr.length, start + 8);
		const char8 = testStr + str.slice(start + 1, end);
		const cleanSz = getCleanSize(char8);
		if (cleanSz === end - start) return start;
		// return the last
		for (let i = start; i < end; i++) {
			tmp += str[i];
			if (getCleanSize(tmp) === 1) answer = i;
		}
		return answer;
	};

	const endSpace = (): void => {
		const shortLen = getCleanSize(currShort);
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
			let complex = currShort.length !== getCleanSize(currShort);
			curr = '';
			tmp += tmp === '' ? '' : ' ';

			for (let i = 0, len = currShort.length; i < len; i++) {
				if (getCleanSize(tmp) === size) {
					lines.push(tmp);
					tmp = '';
					const newCurr = currShort.slice(i);
					complex = newCurr.length !== getCleanSize(newCurr);
				}
				const to = complex ? cleanChar(currShort, i) : i;
				if (to !== i) {
					tmp += currShort.slice(i, to - i + 1);
					i = to;
				} else tmp += currShort[i];
			}
			if (getCleanSize(tmp) === size) {
				lines.push(tmp);
				curr = '';
			} else curr = tmp;
			currSize = getCleanSize(curr);
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
					currSize = getCleanSize(curr);
				}
				break;
			case '\r':
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
	return lines;
}

export function isNum(val: unknown): boolean {
	const v = val.toString();
	if (/-{0,1}\d+(\.\d+)?/.test(v)) return true;
	return false;
}

export type stringSize = {
	minSize: number;
	maxSize: number;
	val: string;
};
