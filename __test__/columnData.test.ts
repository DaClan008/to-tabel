import { ColumnData } from '../src/lib/columnData';
import * as Events from '../src/lib/events';

describe('Testing ColumnDta object', () => {
	test('creating Column Data objects', () => {
		const obj = new ColumnData('col1', 'in column1', 2, 1);
		expect(obj).toMatchObject({
			key: 'col1',
			row: 1,
			sze: -1,
			maxsize: -1,
			val: 'in column1',
			eLevel: 1,
			lines: ['in column1'],
			max: 10,
			setContentSize: 10,
		});
		expect(obj.isRawData).toBeTruthy();
		expect(obj.value).toBe('in column1');
		expect(obj.maxData).toBe('in column1'.length);
		expect(obj.lineCount).toBe(1);
		expect(obj.setSize).toBe(-1);
		expect(obj.size).toBe('in column1'.length);
	});

	test('creating Column Data objects from odd variables', () => {
		const obj = new ColumnData(null, null, null, null);
		expect(obj).toMatchObject({
			key: null,
			row: null,
			sze: -1,
			maxsize: -1,
			val: '',
			eLevel: 1,
			lines: [],
			max: 0,
			setContentSize: 0,
		});
	});

	test('change size', () => {
		const obj = new ColumnData('col1', 'in column1', 2, 1);
		expect.assertions(6);

		obj.size = 5;
		expect(obj.size).toBe(5);
		expect(obj.setSize).toBe(5);
		expect(obj.value).toBe('in column1');
		expect(obj.maxData).toBe('in column1'.length);
		expect(obj.lineCount).toBe(2);
		expect(obj.lines).toMatchObject(['in co', 'lumn1']);
	});

	test('change size and then to 0', () => {
		const obj = new ColumnData('col1', 'in column1', 2, 1);
		obj.size = 5;
		expect(obj.size).toBe(5);
		expect(obj.setSize).toBe(5);
		expect(obj.value).toBe('in column1');
		expect(obj.maxData).toBe('in column1'.length);
		expect(obj.lineCount).toBe(2);
		expect(obj.lines).toMatchObject(['in co', 'lumn1']);
		obj.size = 0;
		expect(obj.size).toBe(0);
		expect(obj.setSize).toBe(0);
		expect(obj.value).toBe('in column1');
		expect(obj.maxData).toBe('in column1'.length);
		expect(obj.lineCount).toBe(0);
		expect(obj.lines).toMatchObject([]);
	});
});
