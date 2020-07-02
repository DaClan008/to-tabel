import {
	fillSpace,
	addSpecialEmo,
	getCleanSize,
	getStringSize,
	getStringLines,
	isNum,
	getComplexUniArray,
} from '../src/lib/helper';
import { emojiLevel } from '../src/types/options';

describe('testing isNum function', () => {
	test('must return true if text is a number', () => {
		expect(isNum('0')).toBe(true);
		expect(isNum(1)).toBe(true);
	});
	test('must return false if text is not a number', () => {
		expect(isNum(' ')).toBe(false);
		expect(isNum(null)).toBe(false);
		expect(isNum(undefined)).toBe(false);
		expect(isNum(false)).toBe(false);
	});
});

describe('testing size calculation', () => {
	test('must return a normal string size', () => {
		const someStr = 'This is some string.';
		expect(getCleanSize(someStr, emojiLevel.none)).toEqual(someStr.length);
		expect(getCleanSize(someStr, emojiLevel.all)).toEqual(someStr.length);
		expect(getCleanSize(someStr, emojiLevel.med)).toEqual(someStr.length);
		expect(getCleanSize(someStr, emojiLevel.low)).toEqual(someStr.length);
		expect(getCleanSize(someStr)).toEqual(someStr.length);
	});

	test('must be able to return the size of a 1 character emoji', () => {
		const someStr = 'this = \u2592';
		expect(getCleanSize(someStr, emojiLevel.none)).toEqual(8);
		expect(getCleanSize(someStr, emojiLevel.all)).toEqual(8);
		expect(getCleanSize(someStr, emojiLevel.med)).toEqual(8);
		expect(getCleanSize(someStr, emojiLevel.low)).toEqual(8);
		expect(getCleanSize(someStr)).toEqual(8);
	});
	test('must be able to return size of 2 character emojis', () => {
		const someStr = 'this = 😀';
		expect(getCleanSize(someStr, emojiLevel.none)).toEqual(9);
		expect(getCleanSize(someStr, emojiLevel.all)).toEqual(8);
		expect(getCleanSize(someStr, emojiLevel.med)).toEqual(8);
		expect(getCleanSize(someStr, emojiLevel.low)).toEqual(8);
		expect(getCleanSize(someStr)).toEqual(8);
	});

	test('must be able to return the size of a 4 character emoji', () => {
		const someStr = 'this = 👋🏻';
		expect(getCleanSize(someStr, emojiLevel.none)).toEqual(11);
		expect(getCleanSize(someStr, emojiLevel.all)).toEqual(9);
		expect(getCleanSize(someStr, emojiLevel.med)).toEqual(9);
		expect(getCleanSize(someStr, emojiLevel.low)).toEqual(9);
		expect(getCleanSize(someStr)).toEqual(9);
	});

	test('must be able to return the size of a 4 character specially added emojis', () => {
		const someStr = 'this = 👋🏻';
		addSpecialEmo('👋🏻');
		expect(getCleanSize(someStr, emojiLevel.none)).toEqual(11);
		expect(getCleanSize(someStr, emojiLevel.all)).toEqual(8);
		expect(getCleanSize(someStr, emojiLevel.med)).toEqual(9);
		expect(getCleanSize(someStr, emojiLevel.low)).toEqual(9);
		expect(getCleanSize(someStr)).toEqual(8);
	});

	test('must be able to return the size of a 4 character specially added [emojis]', () => {
		const someStr = 'this = 🤏🏼';
		addSpecialEmo(['🤏🏼']);
		expect(getCleanSize(someStr, emojiLevel.none)).toEqual(11);
		expect(getCleanSize(someStr, emojiLevel.all)).toEqual(8);
		expect(getCleanSize(someStr, emojiLevel.med)).toEqual(9);
		expect(getCleanSize(someStr, emojiLevel.low)).toEqual(9);
		expect(getCleanSize(someStr)).toEqual(8);
	});

	test('must be able to return the size of a 7 character emoji', () => {
		const someStr = 'this = 👁️‍🗨️';
		expect(getCleanSize(someStr, emojiLevel.none)).toEqual(14);
		expect(getCleanSize(someStr, emojiLevel.all)).toEqual(8);
		expect(getCleanSize(someStr, emojiLevel.med)).toEqual(9);
		expect(getCleanSize(someStr, emojiLevel.low)).toEqual(11);
		expect(getCleanSize(someStr)).toEqual(8);
	});

	test('must be able to return the size of a 7 character emoji', () => {
		const someStr = 'this = 👨🏻‍🦰';
		expect(getCleanSize(someStr, emojiLevel.none)).toEqual(14);
		expect(getCleanSize(someStr, emojiLevel.all)).toEqual(8);
		expect(getCleanSize(someStr, emojiLevel.med)).toEqual(10);
		expect(getCleanSize(someStr, emojiLevel.low)).toEqual(10);
		expect(getCleanSize(someStr)).toEqual(8);
	});

	test('must be able to return the size of a 8 character complex emoji', () => {
		const someStr = 'this = 👩‍❤️‍👩';
		expect(getCleanSize(someStr, emojiLevel.none)).toEqual(15);
		expect(getCleanSize(someStr, emojiLevel.all)).toEqual(8);
		expect(getCleanSize(someStr, emojiLevel.med)).toEqual(10);
		expect(getCleanSize(someStr, emojiLevel.low)).toEqual(11);
		expect(getCleanSize(someStr)).toEqual(8);
	});
});

describe('testing fillSpace', () => {
	test('should fill with spaces', () => {
		const str = fillSpace(4);
		expect(str).toBe('    ');
	});

	test('should fill with any character', () => {
		const str = fillSpace(4, '-');
		expect(str).toBe('----');
	});

	test('should return single spaced string', () => {
		const str = fillSpace();
		expect(str).toBe(' ');
	});

	test('should return empty string', () => {
		let str = fillSpace(0);
		expect(str).toBe('');
		str = fillSpace(-4);
		expect(str).toBe('');
	});
});

describe('testing stringSize (more complex)', () => {
	test('calculating string size reciving odd inputs', () => {
		expect(getStringSize('')).toMatchObject({
			size: 0,
			val: '',
		});
		expect(getStringSize(true)).toMatchObject({
			size: 4,
			val: 'true',
		});
		expect(getStringSize(false)).toMatchObject({
			size: 5,
			val: 'false',
		});
		expect(getStringSize(0)).toMatchObject({
			size: 1,
			val: '0',
		});

		expect(getStringSize(-1)).toMatchObject({
			size: 2,
			val: '-1',
		});
	});

	test('should calculate string size', () => {
		const str = 'test str';
		const result = getStringSize(str);
		expect(result).toMatchObject({
			size: 8,
			val: 'test str',
		});
	});

	test('should calculate string size when using return lines', () => {
		const str = 'test\rstr';
		const result = getStringSize(str);
		expect(result).toMatchObject({
			size: 4,
			val: 'test\rstr',
		});
	});

	test('should calculate string size when using backspace', () => {
		let str = 'test\u0008str';
		const result = getStringSize(str);
		expect(result.size).toEqual(6);
		expect(result.val).toEqual('tesstr');

		str = '\u0008str';
		expect(getStringSize(str)).toMatchObject({
			size: 3,
			val: 'str',
		});
	});

	test('should calculate string size when using new line values', () => {
		let str = 'test\nstr';
		let result = getStringSize(str);
		expect(result).toMatchObject({
			size: 4,
			val: 'test\nstr',
		});

		str = 'test\r\nstr';
		result = getStringSize(str);
		expect(result).toMatchObject({
			size: 4,
			val: 'test\r\nstr',
		});

		str = 'test\n\rstr';
		result = getStringSize(str);
		expect(result).toMatchObject({
			size: 4,
			val: 'test\n\rstr',
		});

		str = 'test\vstr';
		result = getStringSize(str);
		expect(result).toMatchObject({
			size: 7,
			val: 'test\vstr',
		});

		str = 'test\fstr';
		result = getStringSize(str);
		expect(result).toMatchObject({
			size: 7,
			val: 'test\fstr',
		});
	});

	test('calculate string size with tabs', () => {
		let str = '\t';
		let result = getStringSize(str);
		expect(result).toMatchObject({
			size: 2,
			val: '  ',
		});

		str = 'a\tb';
		result = getStringSize(str, 4);
		expect(result).toMatchObject({
			size: 6,
			val: 'a    b',
		});

		str = 'a\t\b';
		result = getStringSize(str, 4);
		expect(result).toMatchObject({
			size: 1,
			val: 'a',
		});
	});
});

describe('testing string lines', () => {
	test('should return multiple lines if size is smaller than text size', () => {
		const str = 'This is a testing str';
		expect(getStringLines(str, 5, emojiLevel.all)).toEqual([
			'This',
			'is a ',
			'testi',
			'ng',
			'str',
		]);

		expect(getStringLines(str, 4, emojiLevel.all)).toEqual([
			'This',
			'is a',
			'test',
			'ing',
			'str',
		]);
	});

	test('should return multiple lines for new line char', () => {
		let str = 'This is\na testing str';
		expect(getStringLines(str, 4)).toEqual(['This', 'is', 'a te', 'stin', 'g', 'str']);
		expect(getStringLines(str, 7)).toEqual(['This is', 'a', 'testing', 'str']);
		str = '\nThis is a testing str';
		expect(getStringLines(str, 7)).toMatchObject(['', 'This is', 'a', 'testing', 'str']);
	});

	// NOTE - this should not be applicable in table anymore!!
	// this is dealt with in getStringSize function.
	test('should return multiple lines which use backspace char', () => {
		let str = 'This is\b a testing str';
		expect(getStringLines(str, 4)).toEqual(['This', 'i a ', 'test', 'ing', 'str']);
		expect(getStringLines(str, 7)).toEqual(['This i', 'a', 'testing', 'str']);
		str = '\u0008This is a testing str';
		expect(getStringLines(str, 7)).toMatchObject(['This is', 'a', 'testing', 'str']);
		str = 'This \u0008is a testing str';
		expect(getStringLines(str, 7)).toMatchObject(['Thisis', 'a', 'testing', 'str']);
	});

	test('should return lines if a return line char is used', () => {
		let str = 'This is\r a testing str';
		expect(getStringLines(str, 4)).toEqual(['This', 'a te', 'stin', 'g', 'str']);

		str = 'This\r is a testing str';
		expect(getStringLines(str, 4)).toEqual(['is a', 'test', 'ing', 'str']);
		str = 'This \ris a testing str';
		expect(getStringLines(str, 4)).toEqual(['is a', 'test', 'ing', 'str']);

		str = 'This is a te\rsting str';
		expect(getStringLines(str, 12)).toEqual(['sting str te']);
	});

	test('should deal with \\f and \\v special characters', () => {
		let str = 'This is\f a testing str';
		expect(getStringLines(str, 4)).toEqual(['This', 'is', '   a', 'test', 'ing', 'str']);

		str = '\vThis is a testing str';
		expect(getStringLines(str, 4)).toEqual(['This', 'is a', 'test', 'ing', 'str']);

		str = 'This\v is a testing str';
		expect(getStringLines(str, 4)).toEqual(['This', 'is a', 'test', 'ing', 'str']);

		str = 'This \vis a testing str';
		expect(getStringLines(str, 4)).toEqual(['This', 'is a', 'test', 'ing', 'str']);
	});

	test('should return multiple lines if emojis is used', () => {
		let str = 'This is 😀 a testing str';
		expect(getStringLines(str, 4)).toEqual(['This', 'is 😀', 'a te', 'stin', 'g', 'str']);

		str = 'This👁️‍🗨️ is a testing str';
		expect(getStringLines(str, 5, emojiLevel.med)).toEqual([
			'This\uD83D\uDC41\uFE0F\u200D',
			'\uD83D\uDDE8\uFE0F is',
			'a tes',
			'ting',
			'str',
		]);
	});

	test('should return on strange string', () => {
		let str = 'This  is  🤏🏼  a testing str';
		expect(getStringLines(str, 15, emojiLevel.med)).toEqual(['This  is  🤏🏼  a', 'testing str']);
	});

	test('odd size variables', () => {
		const str = 'This is a testing str';
		expect(getStringLines(str)).toEqual(['This is a testing str']);
		expect(getStringLines(str, 0)).toEqual(['']);
	});

	test('odd emojiLevels', () => {
		let str = 'This is a testing str';
		expect(getStringLines(str, -1, emojiLevel.none)).toEqual(['This is a testing str']);
		str = 'This 😀 is a testing str';
		expect(getStringLines(str, 5, emojiLevel.none)).toEqual([
			'This',
			'😀 is',
			'a tes',
			'ting',
			'str',
		]);
	});
});

describe('Testing getComplexuniArray', () => {
	test('should take in odd size', () => {
		const str = 'This is a testing str';
		expect(getComplexUniArray(str)).toEqual(['This is a testing str']);
		expect(getComplexUniArray(str, 0)).toEqual(['']);
	});

	test('should take in odd emojilevels', () => {
		const str = 'This 😀is a testing str';
		expect(getComplexUniArray(str, 6, emojiLevel.none)).toEqual([
			'This \uD83D',
			'\uDE00is a ',
			'testin',
			'g str',
		]);
	});

	test('should return on strange string', () => {
		let str = 'This  is  a testing str';
		expect(getComplexUniArray(str, 11, emojiLevel.med)).toEqual(['This  is  a', 'testing str']);
	});
});
