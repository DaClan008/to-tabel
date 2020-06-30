import {
	fillSpace,
	addSpecialEmo,
	getCleanSize,
	getStringSize,
	getStringLines,
	isNum,
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

describe('testing string lines', () => {});
