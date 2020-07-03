import { ColumnData } from '../src/lib/columnData';
import * as Events from '../src/lib/events';

describe('some test', () => {
	test('creating Column Data objects', () => {
		const obj = new ColumnData('col1', 'in column1', 2, 1);
		expect(obj).toMatchObject({
			key: 'col1',
			row: 1,
			sze: -1,
			val: 'in column1',
			eLevel: 1,
			lines: ['in column1'],
			max: 10,
			prevSize: -1,
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
			val: '',
			eLevel: 1,
			lines: [''],
			max: 0,
			prevSize: -1,
		});
	});

	test('change size', () => {
		const obj = new ColumnData('col1', 'in column1', 2, 1);
		expect.assertions(6);

		obj.on(Events.EventDataChanged, o => {
			expect(o.size).toBe(5);
			expect(o.setSize).toBe(5);
			expect(obj.value).toBe('in column1');
			expect(obj.maxData).toBe('in column1'.length);
			expect(obj.lineCount).toBe(2);
			expect(obj.lines).toMatchObject(['in co', 'lumn1']);
		});
		obj.size = 5;
	});

	test('change size and then to 0', () => {
		const obj = new ColumnData('col1', 'in column1', 2, 1);
		expect.assertions(6);
		let counter = 0;

		obj.on(Events.EventDataChanged, o => {
			if (counter++ === 0) return;
			expect(o.size).toBe(0);
			expect(o.setSize).toBe(0);
			expect(obj.value).toBe('in column1');
			expect(obj.maxData).toBe('in column1'.length);
			expect(obj.lineCount).toBe(0);
			expect(obj.lines).toMatchObject([]);
		});
		obj.size = 5;
		obj.size = 0;
	});

	test('execute event only if necessary', () => {
		const obj = new ColumnData('col1', 'in column1', 2, 1);
		let counter = 0;

		obj.on(Events.EventDataChanged, o => {
			counter++;
		});
		obj.size = 5;
		obj.size = 5;
		obj.buildLines();
		expect(counter).toBe(1);

		const obj2 = new ColumnData('col', 'data in column1', 2, 1);
		counter = 0;
		obj2.on(Events.EventDataChanged, o => {
			counter++;
		});
		obj2.size = 7;
		obj2.size = 8;
		expect(counter).toBe(1);
	});
});
