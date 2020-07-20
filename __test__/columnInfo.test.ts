import { ColumnInfo, colOptions } from '../src/lib/columnInfo';
import { Alignment } from '../src/types/options';
import * as Events from '../src/lib/events';

describe('testing ColumnInfo Object construct', () => {
	test('creating a ColumnInfo Object', () => {
		const options: colOptions = {
			name: 'col1',
		};
		let obj = new ColumnInfo(options);
		expect(obj).toMatchObject({
			lnes: ['col1'],
			setSize: -1,
			prevSize: 4,
			setMaxSize: -1,
			table: -1,
			real: 4,
			autoData: true,
			dataMaxSize: -1,
			headerMaxSize: 4,
			rat: 0,
			intRat: 0.5,
			nme: 'col1',
			space: 4,
			tabSize: 2,
			eLevel: 1,
			align: 'left',
			headAlign: 'left',
			pattern: 'col-~D',
			prntName: 'col1',
			setMinSize: 0,
		});
		const cnt = obj.lines;
		expect(cnt).toMatchObject(['col1']);
		// alignment
		options.align = Alignment.right;
		options.headAlign = Alignment.center;
		options.size = 6;
		obj = new ColumnInfo(options);
		expect(obj.headAlign).toBe(Alignment.center);
		expect(obj.lines).toMatchObject([' col1 ']);
		expect(obj.align).toBe(Alignment.right);
	});

	test('create colInfo with faulty options object', () => {
		expect.assertions(2);
		try {
			new ColumnInfo({ name: null });
		} catch (error) {
			expect(error.message).toBe('options must include a valid name variable');
		}
		try {
			new ColumnInfo({ name: '' });
		} catch (error) {
			expect(error.message).toBe('options must include a valid name variable');
		}
	});
});

class EventReg {
	constructor(public colInfo: ColumnInfo) {
		colInfo.on(Events.EventChangeMax, (o: ColumnInfo) => {
			this.max = o.maxSize;
			this.list.push('max');
		});
		colInfo.on(Events.EventChangeRatio, (o: ColumnInfo) => {
			this.rate = o.ratio;
			this.list.push('ratio');
		});
		colInfo.on(Events.EventChangeSize, (o: ColumnInfo) => {
			this.size = o.size;
			this.list.push('size');
		});

		colInfo.on(Events.EventChangeLines, (o: ColumnInfo) => {
			this.lines = o.lines;
			this.list.push('lines');
		});

		colInfo.on(Events.EventChangeOrder, (o: ColumnInfo) => {
			this.order = o.order;
			this.list.push('order');
		});
		colInfo.on(Events.EventDataChanged, (o: ColumnInfo) => {
			// this.data = o.lines;
			this.list.push('data');
		});
	}
	public rate = -1;
	public max = -1;
	public size = -1;
	public lines: string[] = [];
	public order = 0;

	public data: string[] = [];
	public list: string[] = [];

	reset() {
		this.rate = -1;
		this.max = -1;
		this.size = -1;
		this.lines = [];
		this.order = 0;
		this.data = [];
		this.list = [];
	}
}

describe('testing printName option', () => {
	test('printName property', () => {
		const options: colOptions = {
			name: 'col1',
			printName: 'myName',
		};
		let obj = new ColumnInfo(options);

		expect(obj.printName).toBe('myName');
		expect(obj.lines).toMatchObject(['myName']);
	});

	test('printName property with pattern set (~D)', () => {
		const options: colOptions = {
			pattern: 'B~D',
			name: '1',
		};
		const obj = new ColumnInfo(options);
		expect(obj.printName).toBe('B1');
		options.pattern = '~D - SomeCol';
	});

	test('printName property with different pattern set (~D)', () => {
		const options: colOptions = {
			pattern: '~D - SomeCol',
			name: '1',
		};
		const obj = new ColumnInfo(options);
		expect(obj.printName).toBe('1 - SomeCol');
		expect(obj.name).toBe('1');
	});

	test('printName property with simple pattern set (only ~D)', () => {
		const options: colOptions = {
			pattern: '~D',
			name: '1',
		};
		const obj = new ColumnInfo(options);
		expect(obj.printName).toBe('1');
		expect(obj.name).toBe('1');
	});

	test('set printName later with simple events', () => {
		const options: colOptions = {
			name: '1',
		};
		const obj = new EventReg(new ColumnInfo(options));
		obj.colInfo.printName = 'newPrint';

		expect(obj.max).toBe(8);
		expect(obj.lines).toMatchObject(['newPrint']);
		expect(obj.list).toMatchObject(['lines', 'size', 'max']);

		obj.reset();
		obj.colInfo.printName = 'newPrint';
		// no event should fire off if printName is set to same value as current printName
		expect(obj.list).toMatchObject([]);
	});

	test('set printName smaller than maxSize', () => {
		const options: colOptions = {
			name: 'col1',
		};
		const colinfo = new ColumnInfo(options);
		colinfo.maxContent = 5;
		const obj = new EventReg(colinfo);
		colinfo.printName = 'col';

		expect(obj.max).toBe(-1);
		expect(obj.lines).toMatchObject(['col  ']);
		expect(obj.list).toMatchObject(['lines']);
	});
});

describe('testing size property', () => {
	test('size property in options', () => {
		// if Options has size value.  Fixed is automatically set to true.
		// fixed means value will always be = options.size
		// if size is set to val >=0 && val < options.size size will always be 0
		// if size of obj is set to -1 (<0), obj.size will be reset to options.size.
		const options: colOptions = {
			name: 'col1',
			size: 3,
		};
		const obj = new ColumnInfo(options);
		const evnt = new EventReg(obj);

		expect(obj.size).toBe(3);
		expect(obj.headerSize).toBe(3);
		expect(obj.lines).toMatchObject(['col', '1  ']);
		expect(obj.isFixed).toBeTruthy();

		// setting a size bigger than options.size will have no effect
		obj.size = 5;
		expect(obj.size).toBe(3);
		expect(evnt.list).toMatchObject([]);
		expect(obj.lines).toMatchObject(['col', '1  ']);
		// setting a size to -1 (<0) will reset obj.size to options.size.
		obj.size = -1;
		expect(obj.size).toBe(3);
		expect(evnt.list).toMatchObject([]);
		// setting tableSize will have no effect
		obj.tableSize = 10;
		expect(obj.size).toBe(3);
		expect(evnt.list).toMatchObject([]);
		// obj.size = 0 will always change value of size to 0
		obj.size = 0;
		expect(obj.size).toBe(0);
		expect(evnt.list).toMatchObject(['lines', 'size']);
		evnt.reset();
		// any value below options.size, will result in obj.size to go to 0
		obj.size = 2;
		expect(obj.size).toBe(0);
		expect(evnt.list).toMatchObject([]);
		// setting any size to value >= options.size, will result in obj.size being options.size
		obj.size = 5;
		expect(obj.size).toBe(3);
		expect(evnt.list).toMatchObject(['lines', 'size']);
		evnt.reset();
		// should go back to 0
		obj.size = 1;
		expect(obj.size).toBe(0);
		expect(evnt.list).toMatchObject(['lines', 'size']);
	});

	test('size in options with fixed set to false', () => {
		// main feature: if size is set to <0 (-1) => size will reset to options.size
		// otherwise it reacts if no fixed value was supplied...
		// any number biger than 0 can be supplied to size value.
		const options: colOptions = {
			name: 'col1',
			size: 3,
			fixed: false,
		};
		const obj = new ColumnInfo(options);
		const evnt = new EventReg(obj);

		expect(obj.size).toBe(3);
		expect(obj.lines).toMatchObject(['col', '1  ']);
		expect(obj.isFixed).toBeFalsy();

		// setting size to any value > 0 will have an effect
		obj.size = 5;
		expect(obj.size).toBe(5); // size will change if fixed is false
		expect(evnt.list).toMatchObject(['lines', 'size']);
		expect(obj.lines).toMatchObject(['col1 ']);
		expect(obj.contentSize).toBe(5);
		expect(obj.headerSize).toBe(5);
		evnt.reset();
		// setting value to -1 (<0) will reset obj.size to options.size
		obj.size = -10;
		expect(obj.size).toBe(3); // a negative size value will reset the size.
		expect(evnt.list).toMatchObject(['lines', 'size']);
		evnt.reset();
		// 0 will always set obj.size to 0
		obj.size = 0;
		expect(obj.size).toBe(0);
		expect(evnt.list).toMatchObject(['lines', 'size']);
		evnt.reset();
		// any value can be set if fixed is false.
		obj.size = 2;
		expect(obj.size).toBe(2);
		expect(evnt.list).toMatchObject(['lines', 'size']);
		evnt.reset();
		// nothing should happen to size if table is set.
		obj.tableSize = 10;
		expect(evnt.lines).toMatchObject([]);
	});

	test('size as decimal in options object', () => {
		// setting size without fixed will automatically set fixed to true!!
		// only change decimal if table size changes
		// size will initially be set to maxSize equivalent if no table value.
		// once table is provided size will alter between 0 and table x decimal.
		// -- 0 when amount of size is below table x decimal
		// -- decimal x table when size >= decimal x table.
		const options: colOptions = {
			name: 'col1',
			size: 0.5,
		};
		// size initialized without table size will inherit the size of printName
		const obj = new ColumnInfo(options);
		expect(obj.size).toBe(4);
		expect(obj.lines).toMatchObject(['col1']);

		// if table is not set, obj.size could be changed
		obj.size = 3;
		expect(obj.size).toBe(3);
		expect(obj.lines).toMatchObject(['col', '1  ']);
		const evnt = new EventReg(obj);

		obj.size = 0;
		expect(obj.size).toBe(0);
		evnt.reset();
		// setting a negative value to size will resutl in size being reset to printSize val.
		obj.size = -1;
		expect(obj.size).toBe(4);
		expect(evnt.list).toMatchObject(['lines', 'size']);
		evnt.reset();

		// set tableSize will make obj.size react like fixed value.
		obj.tableSize = 10;
		expect(obj.size).toBe(5);
		expect(obj.lines).toMatchObject(['col1 ']);
		expect(evnt.list).toMatchObject(['lines', 'size']);
		evnt.reset();
		// set larger size and size will remain fixed
		obj.size = 20;
		expect(obj.size).toBe(5);
		expect(obj.tableSize).toBe(10);
		expect(evnt.list).toMatchObject([]); // size should not change
		// set lower size and size will revert to 0
		obj.size = 4;
		expect(obj.size).toBe(0);
		expect(evnt.list).toMatchObject(['lines', 'size']); // size should change to 0;
		evnt.reset();
		// set size of 5 (table * setSize) and larger will keep value fixed at table * setSize
		obj.size = 6;
		expect(obj.size).toBe(5);
		expect(evnt.list).toMatchObject(['lines', 'size']); // size is limited to table * size
		// set size to 0 will always change obj.size to 0
		evnt.reset();
		obj.size = 0;
		expect(obj.size).toBe(0);
		// obj.tableSize should never change if size change
		expect(obj.tableSize).toBe(10);
		expect(evnt.list).toMatchObject(['lines', 'size']);
		// set size to below 5 (table * setSize) but above 0 should keep size at 0
		evnt.reset();
		obj.size = 4;
		expect(obj.size).toBe(0);
		expect(evnt.list).toMatchObject([]);

		// set table to an amount which will be a fraction (i.e. 0.5 * 7 = 3.5)
		// will always round up
		obj.tableSize = 7;
		expect(obj.size).toBe(4);
	});

	test('size as decimal in options object with fixed as false', () => {
		// only change decimal if table size changes
		// size ignore percentages until reset by setting size to -1
		const options: colOptions = {
			name: 'col1',
			size: 0.5,
			fixed: false,
		};
		const obj = new ColumnInfo(options);
		// if no tablesize is provided the default value is the size of the printName prop
		expect(obj.size).toBe(4);
		expect(obj.lines).toMatchObject(['col1']);
		const evnt = new EventReg(obj);

		// setting size to any value will change the size of the object (fixed = false)
		obj.size = 3;
		expect(obj.size).toBe(3);
		expect(obj.lines).toMatchObject(['col', '1  ']);
		expect(evnt.list).toMatchObject(['lines', 'size']);
		evnt.reset();

		// set tableSize will set size to tableSize * options.size
		obj.tableSize = 10;
		expect(obj.size).toBe(5);
		expect(obj.lines).toMatchObject(['col1 ']);
		expect(evnt.list).toMatchObject(['lines', 'size']);
		evnt.reset();
		// if any value > 0 is set, obj.size will change
		obj.size = 20;
		expect(obj.size).toBe(20);
		expect(obj.tableSize).toBe(10);
		expect(evnt.list).toMatchObject(['lines', 'size']); // size should not change
		evnt.reset();
		// even amounts > 0 and lower than table * options.size will change obj.size
		obj.size = 4;
		expect(obj.size).toBe(4);
		expect(evnt.list).toMatchObject(['lines', 'size']); // size should change to 4;
		evnt.reset();
		// an amount of -1 (<0) will reset value to table * options.size
		obj.size = -1;
		expect(obj.size).toBe(5);
		expect(obj.tableSize).toBe(10); // table size always remain unchanged
		expect(evnt.list).toMatchObject(['lines', 'size']);
		evnt.reset();
		// a size of 0 will always be set to 0
		obj.size = 0;
		expect(obj.size).toBe(0);
		expect(evnt.list).toMatchObject(['lines', 'size']); // size is limited to table * size
	});

	test('size as decimal in options object together with a min and max value', () => {
		const options: colOptions = {
			name: 'col1',
			size: 0.5,
			minSize: 4,
			maxSize: 10,
		};
		// size initialized without table size will inherit the maxSize
		const obj = new ColumnInfo(options);
		expect(obj.size).toBe(10);
		expect(obj.lines).toMatchObject(['col1      ']);

		// if table is not set, obj.size could be changed anytime
		// however this will be limited to minSize and maxSize.
		obj.size = 7;
		expect(obj.size).toBe(7);
		expect(obj.lines).toMatchObject(['col1   ']);

		// setting a size to larger than max will be limited to max
		obj.size = 11;
		expect(obj.size).toBe(10);

		// setting a size to below min will revert to 0
		obj.size = 3;
		expect(obj.size).toBe(0);

		// resetting without tablesize will reset value to maxSize.
		obj.size = -1;
		expect(obj.size).toBe(10);

		// setting a tablesize will fix size value and min / max will be ignored
		// obj.size can then only fluctuate between 0 and table * options.size.
		obj.tableSize = 10;
		expect(obj.size).toBe(5);

		// setting tableSize to an unacceptable large size will limit obj.size to max
		obj.tableSize = 22;
		expect(obj.size).toBe(10);

		// setting a tablesize to an unacceptable low size (minsize) will set obj.size to 0.
		obj.tableSize = 6;
		expect(obj.size).toBe(0);

		// resetting will have the same effect
		obj.size = -1;
		expect(obj.size).toBe(0);
	});

	test('size with fixed as true', () => {
		const options: colOptions = {
			name: 'col1',
			fixed: true,
		};
		const obj = new ColumnInfo(options);
		expect(obj.size).toBe(4); // inherit size of printName
		expect(obj.lines).toMatchObject(['col1']);
		const evnt = new EventReg(obj);

		// set larger size
		obj.size = 20;
		expect(obj.size).toBe(4);
		expect(evnt.list).toMatchObject([]); // size should not change
		// set size to 0
		obj.size = 0;
		expect(obj.size).toBe(0);
		expect(evnt.list).toMatchObject(['lines', 'size']);
		evnt.reset();
		// set size 5 and larger
		evnt.reset();
		obj.size = 6;
		expect(obj.size).toBe(4);
		expect(evnt.list).toMatchObject(['lines', 'size']); // size is limited to table * size
	});

	test('size with fixed as true and size', () => {
		const options: colOptions = {
			name: 'col1',
			fixed: true,
			size: 10,
		};
		const obj = new ColumnInfo(options);
		expect(obj.size).toBe(10);
		const evnt = new EventReg(obj);

		// set larger size
		obj.size = 20;
		expect(obj.size).toBe(10);
		expect(evnt.list).toMatchObject([]); // size should not change
		// set size to 0
		obj.size = 0;
		expect(obj.size).toBe(0);
		expect(evnt.list).toMatchObject(['lines', 'size']);
		// set size 5 and larger
		evnt.reset();
		obj.size = 6;
		expect(obj.size).toBe(0);
		expect(evnt.list).toMatchObject([]); // size is limited to table * size
	});

	test('internalSizeChange testing', () => {
		const nme = new ColumnInfo({ name: 'col1' });

		expect(nme.hasContent).toBeFalsy();
		expect(nme.size).toBe(4);
		expect(nme.maxContent).toBe(0);
		expect(nme.contentSize).toBe(4);
		nme.internalSizeChange(30);
		expect(nme.hasContent).toBeFalsy();
		expect(nme.size).toBe(30);
		expect(nme.maxContent).toBe(0);
		expect(nme.contentSize).toBe(4);

		nme.size = 40;
		nme.internalSizeChange(-1);
		expect(nme.size).toBe(40);
	});

	test('setExtenalMaxSize testing', () => {
		const nme = new ColumnInfo({ name: 'col1' });

		expect(nme.hasContent).toBeFalsy();
		nme.maxContent = 20;
		expect(nme.hasContent).toBeTruthy();
		expect(nme.size).toBe(20);
		expect(nme.maxContent).toBe(20);
		expect(nme.contentSize).toBe(20);
		nme.setExternalMax(30);
		expect(nme.size).toBe(30);
		expect(nme.maxContent).toBe(30);
		expect(nme.contentSize).toBe(20);

		nme.setExternalMax(15);
		expect(nme.size).toBe(20);
		expect(nme.maxContent).toBe(20);
		expect(nme.contentSize).toBe(20);
		nme.size = 40;
		expect(nme.size).toBe(40);
		nme.size = 22;
		expect(nme.lines).toMatchObject(['col1                  ']);
		nme.setExternalMax(23);
		expect(nme.size).toBe(22);
		expect(nme.lines).toMatchObject(['col1                  ']);
	});
});

describe('testing max- && minSize property', () => {
	test('maxSize not set in options', () => {
		// real max size can only be set at initialization.
		// maxsize set later will only alter the content maxSize
		// ... i.e. it assumes that the content inside the collumn has increased.
		const options: colOptions = {
			name: 'col1',
		};
		const obj = new ColumnInfo(options);
		expect(obj.size).toBe(4);
		expect(obj.maxSize).toBe(4);
		expect(obj.minSize).toBe(0);
		expect(obj.maxHeader).toBe(4);
		expect(obj.maxContent).toBe(0);

		// should change the size of the maxcontent [size of rows for column]
		obj.maxContent = 3;
		expect(obj.size).toBe(4);
		// will still inherit the actual size of the printName prop
		expect(obj.maxSize).toBe(4);
		expect(obj.maxHeader).toBe(4);
		expect(obj.maxContent).toBe(3);

		// should be able to set maxContent to any bigger amount
		obj.maxContent = 10;
		expect(obj.size).toBe(10); // size has not yet been set
		expect(obj.maxSize).toBe(10);
		expect(obj.maxHeader).toBe(4);
		expect(obj.maxContent).toBe(10);

		obj.size = 5;
		expect(obj.size).toBe(5); // will change
		expect(obj.maxSize).toBe(10); // no change
		expect(obj.maxHeader).toBe(4); // no change
		expect(obj.maxContent).toBe(10); // no change

		// should not change if new maxContent is lower than that already set.
		obj.maxContent = 4;
		expect(obj.size).toBe(5);
		expect(obj.maxSize).toBe(10);
		expect(obj.maxHeader).toBe(4);
		expect(obj.maxContent).toBe(10);

		// first reset the maxContent variables
		obj.reset();
		expect(obj.maxContent).toBe(0);

		// then change maxcontent to lower amount.
		obj.maxContent = 4;
		expect(obj.maxContent).toBe(4);
	});

	test('should limit size by min or maxSize in options', () => {
		const options: colOptions = {
			name: 'col1',
			maxSize: 9,
			minSize: 2,
		};
		const obj = new ColumnInfo(options);
		expect(obj.maxSize).toBe(9);
		expect(obj.minSize).toBe(2);
		expect(obj.size).toBe(9);

		// should be able to set any size up to minSize
		obj.size = 2;
		expect(obj.size).toBe(2);
		expect(obj.maxContent).toBe(0);
		// should be able to set any size above min
		obj.size = 5;
		expect(obj.size).toBe(5);

		// should be able to set size only to maxSize
		obj.size = 10;
		expect(obj.size).toBe(9);
		// anything below minsize should make size 0
		obj.size = 1;
		expect(obj.size).toBe(0);
		expect(obj.maxSize).toBe(9);
		expect(obj.maxHeader).toBe(4);
	});

	test('maxSize property as a fraction', () => {
		const options: colOptions = {
			name: 'col1',
			maxSize: 0.4,
		};
		const obj = new ColumnInfo(options);
		// maxsize is only active if table size is more than -1
		expect(obj.size).toBe(4);
		expect(obj.maxSize).toBe(4);
		// maxSize will retain the size of the data (i.e. as if no maxSize has been set)
		obj.size = 8;
		expect(obj.maxSize).toBe(4);
		expect(obj.maxHeader).toBe(4);
		expect(obj.maxContent).toBe(0);
		expect(obj.size).toBe(8);
		const evnt = new EventReg(obj);

		// size should reset to bring in line with maxSize if table size is set
		obj.tableSize = 15;
		// maxHeader will always be the same as content actual size
		expect(obj.maxHeader).toBe(4);
		expect(obj.maxSize).toBe(6);
		expect(obj.size).toBe(6);
		expect(evnt.list).toMatchObject(['max', 'lines', 'size']);
		evnt.reset();

		// size should not change if maxSize is bigger than size
		obj.tableSize = 20;
		expect(obj.maxSize).toBe(8);
		expect(obj.size).toBe(6);
		expect(evnt.list).toMatchObject(['max']);
		evnt.reset();

		obj.size = 9;
		expect(obj.maxSize).toBe(8);
		expect(obj.size).toBe(8);
		expect(evnt.list).toMatchObject(['lines', 'size']);
		evnt.reset();

		// should not be able to set a new maxSize (maxFix should be true).
		obj.maxContent = 20;
		expect(obj.maxSize).toBe(8);
		expect(obj.maxContent).toBe(20);
		expect(obj.maxHeader).toBe(4);
		expect(evnt.list).toMatchObject([]);
		evnt.reset();
	});
});

describe('testing ratio property', () => {
	test('without setting ratio', () => {
		const options: colOptions = {
			name: 'col1',
		};
		const obj = new ColumnInfo(options);
		expect(obj.ratio).toBe(0);
		const evnt = new EventReg(obj);

		// activate ratio
		obj.ratio = 1;
		expect(obj.ratio).toBe(0.5);
		expect(evnt.list).toMatchObject(['size']);
		evnt.reset();
		obj.ratio = 0;
		// deactivate ratio
		expect(obj.ratio).toBe(0);
		// no ratio has really been changed
		expect(evnt.list).toMatchObject(['size']);
		evnt.reset();
		obj.maxContent = 3;
		expect(obj.ratio).toBe(0);
		// ratio has changed... but deactivated.
		expect(evnt.list).toMatchObject([]);
		// reactivate ratio
		obj.ratio = 1;
		expect(obj.ratio).toBe(4 / 7);
		// no change has occured except for size chagne
		expect(evnt.list).toMatchObject(['size']);
		evnt.reset();
		obj.maxContent = 7;
		expect(obj.ratio).toBe(4 / 11);
		expect(evnt.list).toMatchObject(['max', 'ratio', 'size']);
		expect(obj.maxHeader).toBe(4);
		expect(obj.maxContent).toBe(7);
		expect(obj.headerSize).toBe(4);
		expect(obj.contentSize).toBe(7);
		expect(obj.size).toBe(11 + 4);
	});

	test('if size is a percentage of tableSize', () => {
		const options: colOptions = {
			name: 'col1',
			size: 0.4,
			tableSize: 10,
		};
		const obj = new ColumnInfo(options);
		expect(obj.size).toBe(4);
		const evnt = new EventReg(obj);
		obj.maxContent = 5;
		expect(obj.size).toBe(4);
		expect(obj.lines).toMatchObject(['col1']);
		expect(evnt.list).toMatchObject([]);
		evnt.reset();
		obj.ratio = 1;
		expect(obj.size).toBe(4);
		expect(obj.headerSize).toBe(0);
		expect(obj.contentSize).toBe(0);
		expect(obj.lines).toMatchObject([]);
		expect(evnt.list).toMatchObject(['ratio', 'lines']);
		expect(obj.ratio).toBe(4 / 9);
		evnt.reset();
		obj.tableSize = 18;
		expect(obj.size).toBe(8);
		expect(obj.ratio).toBe(4 / 9);
		expect(obj.headerSize).toBe(2);
		expect(obj.contentSize).toBe(8 - 4 - 2);
		expect(obj.lines).toMatchObject(['co', 'l1']);
		expect(evnt.list).toMatchObject(['lines', 'size']);
		evnt.reset();
		obj.tableSize = 18;
		expect(evnt.list).toMatchObject([]);
		obj.ratio = 0;
		expect(obj.tableSize).toBe(18);
		expect(obj.isFixed).toBeTruthy();
		expect(obj.isPercent).toBeTruthy();
		obj.size = 30;
		expect(obj.size).toBe(8);
		obj.tableSize = 78;
		// 30 is below 32
		expect(obj.size).toBe(0);
		obj.size = 35;
		expect(obj.size).toBe(32);
		obj.tableSize = -1;
		expect(obj.tableSize).toBe(-1);
		expect(obj.isFixed).toBeFalsy();
		expect(obj.isPercent).toBeTruthy();
		expect(obj.size).toBe(35);
	});

	test('size set as fraction', () => {
		const options: colOptions = {
			name: 'col1',
			size: 0.6,
		};
		const obj = new ColumnInfo(options);
		obj.ratio = 1;
		expect(obj.ratio).toBe(0.5);
		expect(obj.headerSize).toBe(4);
		expect(obj.contentSize).toBe(4);
	});

	test('changing ratios', () => {
		const options: colOptions = {
			name: 'col1',
		};
		const obj = new ColumnInfo(options);
		expect(obj.size).toBe(4);
		expect(obj.contentSize).toBe(4);
		expect(obj.headerSize).toBe(4);

		obj.maxContent = 8;
		expect(obj.size).toBe(8);
		expect(obj.contentSize).toBe(8);
		expect(obj.headerSize).toBe(8);

		const evnt = new EventReg(obj);

		// activate ratio
		obj.ratio = 1;
		expect(obj.spacer).toBe(4);
		expect(obj.ratio).toBe(4 / 12);
		expect(obj.size).toBe(8 + 4 + 4);
		expect(obj.contentSize).toBe(8);
		expect(obj.headerSize).toBe(4);
		expect(evnt.list).toMatchObject(['ratio', 'lines', 'size']);
		evnt.reset();

		// nothing should happen if ratio has already been set.
		obj.ratio = 1;
		expect(evnt.list).toMatchObject([]);
		evnt.reset();

		obj.size = 12;
		expect(obj.ratio).toBe(4 / 12);
		expect(obj.headerSize).toBe(3);
		expect(obj.contentSize).toBe(12 - 4 - 3);
		expect(obj.lines).toMatchObject(['col', '1  ']);
		expect(evnt.list).toMatchObject(['lines', 'size']);
		evnt.reset();

		// set to 0
		obj.size = 0;
		expect(obj.ratio).toBe(4 / 12);
		expect(obj.headerSize).toBe(0);
		expect(obj.contentSize).toBe(0);
		expect(obj.lines).toMatchObject([]);
		expect(evnt.list).toMatchObject(['lines', 'size']);
	});

	test('testing spacer', () => {
		const options: colOptions = {
			name: 'col1',
		};
		const obj = new ColumnInfo(options);
		expect(obj.spacer).toBe(4);
		expect(obj.contentSize).toBe(4);
		expect(obj.headerSize).toBe(4);
		obj.maxContent = 8;
		// activate ratio
		obj.ratio = 1;
		expect(obj.spacer).toBe(4);
		expect(obj.ratio).toBe(4 / 12);
		expect(obj.size).toBe(8 + 4 + 4);
		expect(obj.contentSize).toBe(8);
		expect(obj.headerSize).toBe(4);
		expect(obj.maxSize).toBe(16);

		const evnt = new EventReg(obj);

		obj.changeSpace(1, 1);
		expect(obj.spacer).toBe(3);
		expect(obj.maxSize).toBe(15);
		expect(evnt.list).toMatchObject(['max', 'size']);

		obj.size = 12;
		evnt.reset();
		obj.changeSpace(1, 0);
		expect(obj.spacer).toBe(2);
		expect(obj.maxSize).toBe(14);
		expect(evnt.list).toMatchObject(['max']);

		obj.size = 11;
		evnt.reset();
		obj.changeSpace(2, 1);
		expect(obj.size).toBe(11);
		expect(obj.spacer).toBe(5);
		expect(obj.maxSize).toBe(17);
		expect(obj.contentSize).toBe(4);
		expect(obj.headerSize).toBe(2);
		expect(evnt.list).toMatchObject(['max', 'lines']);

		evnt.reset();
		obj.changeSpace(1, 3);
		expect(obj.spacer).toBe(5);
		expect(evnt.list).toMatchObject([]);
	});
});

describe('testing the order property', () => {
	test('testing without initializing with order property', () => {
		const options: colOptions = {
			name: 'col1',
		};

		const obj = new ColumnInfo(options);
		expect(obj.order).toBe(0);
		const evnt = new EventReg(obj);

		obj.order = 3;
		expect(obj.order).toBe(3);
		expect(evnt.list).toMatchObject(['order']);

		evnt.reset();
		obj.order = 3;
		expect(obj.order).toBe(3);
		expect(evnt.list).toMatchObject([]);
	});

	test('testing with order property on initializing', () => {
		const options: colOptions = {
			name: 'col1',
			order: 2,
		};

		const obj = new ColumnInfo(options);
		expect(obj.order).toBe(2);

		expect(new ColumnInfo({ ...options, order: -1 }).order).toBe(0);
	});
});
