import { CombinedInfo } from '../src/lib/combinedInfo';
import { ColumnInfo } from '../src/lib/columnInfo';
import * as Events from '../src/lib/events';
import { emojiLevel, Alignment } from '../src/types/options';

class EventReg {
	constructor(public colInfo: ColumnInfo | CombinedInfo) {
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

describe('CombinedInfo init', () => {
	test('parameterless import', () => {
		const obj = new CombinedInfo(null, null);
		expect(obj.proper).toBeFalsy();
		// if not proper this object should not be used further.
		expect(obj.ratio).toBe(0);
		expect(obj.headerSize).toBe(0);
		expect(obj.contentSize).toBe(0);
		expect(obj.tableSize).toBe(0);
		expect(obj.lines).toMatchObject([]);
		expect(obj.size).toBe(0);
		expect(obj.maxHeader).toBe(0);
		expect(obj.maxContent).toBe(0);
		expect(obj.tabSize).toBe(2);
		expect(obj.eLevel).toBe(emojiLevel.all);
		expect(obj.align).toBe(Alignment.left);
		expect(obj.headAlign).toBe(Alignment.left);
		obj.ratio = 1;
		expect(obj.ratio).toBe(0);

		obj.addCol(null, null);
		expect(obj.proper).toBeFalsy();
	});
	test('only one info available import', () => {
		const nme = new ColumnInfo({ name: 'col1', tabSize: 1, eLevel: emojiLevel.low });
		const num = new ColumnInfo({ name: '1', tabSize: 4, eLevel: emojiLevel.med });

		let obj = new CombinedInfo(nme, null);
		expect(obj.proper).toBeTruthy();
		expect(obj.tabSize).toBe(1);
		expect(obj.eLevel).toBe(emojiLevel.low);
		expect(new CombinedInfo(num, null).proper).toBeTruthy();
		obj = new CombinedInfo(null, num);
		expect(obj.proper).toBeTruthy();
		expect(obj.tabSize).toBe(4);
		expect(obj.eLevel).toBe(emojiLevel.med);
		expect(new CombinedInfo(null, nme).proper).toBeTruthy();
	});
	test('both info objects available import', () => {
		const nme = new ColumnInfo({ name: 'col1' });
		const num = new ColumnInfo({ name: '1' });

		expect(new CombinedInfo(nme, num).proper).toBeTruthy();
		expect(new CombinedInfo(nme, nme).proper).toBeTruthy();
		expect(new CombinedInfo(num, num).proper).toBeTruthy();
	});
	test('seeting objects with different tableSizes', () => {
		const getNme = () =>
			new ColumnInfo({
				name: 'col1',
				tableSize: 10,
			});
		const getNum = () =>
			new ColumnInfo({
				name: '1',
				tableSize: 20,
			});

		let obj = new CombinedInfo(getNme(), getNum());
		expect(obj.proper).toBeTruthy();
		// alwasy take name value if both is supplied.
		expect(obj.tableSize).toBe(10);

		obj = new CombinedInfo(null, getNum());
		expect(obj.proper).toBeTruthy();
		expect(obj.tableSize).toBe(20);

		obj = new CombinedInfo(getNme(), null);
		expect(obj.proper).toBeTruthy();
		expect(obj.tableSize).toBe(10);

		// alwasy take name value if both is supplied.
		obj = new CombinedInfo(getNum(), getNme());
		expect(obj.proper).toBeTruthy();
		expect(obj.tableSize).toBe(20);
	});
});

describe('Size Property inside CombinedInfo', () => {
	test('the percentage property of CombinedInfo', () => {
		let nme = new ColumnInfo({ name: 'co1', size: 0.2 });

		let obj = new CombinedInfo(nme, null);
		obj.tableSize = 20;
		expect(obj.name2).toBe('');
		expect(obj.proper).toBeTruthy();
		expect(obj.isPercent).toBeTruthy();
		expect(obj.size).toBe(4);

		const num = new ColumnInfo({ name: '1', size: 0.2 });
		nme = new ColumnInfo({ name: 'co1' });
		obj = new CombinedInfo(nme, num);
		expect(obj.name).toBe('co1');
		expect(obj.name2).toBe('1');
		expect(obj.isPercent).toBeTruthy();
		expect(obj.size).toBe(3);
		obj.tableSize = 20;
		expect(obj.size).toBe(4);
	});

	test('testing size later', () => {
		let nme = new ColumnInfo({ name: 'co1' });
		const num = new ColumnInfo({ name: '1' });

		const numEvnt = new EventReg(num);
		const nmeEvnt = new EventReg(nme);

		let obj = new CombinedInfo(nme, num);

		expect(obj.size).toBe(3);
		expect(obj.lines).toMatchObject(['co1']);
		// no reset required... nme is mostly used for name of column
		expect(numEvnt.list).toMatchObject(['lines', 'size']);
		// setting the col size of nmeCol on initialization of combined
		expect(nmeEvnt.list).toMatchObject([]);

		numEvnt.reset();
		nmeEvnt.reset();

		obj.size = 10;
		expect(obj.size).toBe(10);
		expect(obj.lines).toMatchObject(['co1       ']);
		expect(numEvnt.list).toMatchObject(['lines', 'size']);
		expect(nmeEvnt.list).toMatchObject(['lines', 'size']);

		numEvnt.reset();
		nmeEvnt.reset();
		obj.size = 2;
		expect(obj.size).toBe(2);
		expect(obj.lines).toMatchObject(['co', '1 ']);
		expect(numEvnt.list).toMatchObject(['lines', 'size']);
		expect(nmeEvnt.list).toMatchObject(['lines', 'size']);
	});

	test('testing size later with only 1 object', () => {
		let nme = new ColumnInfo({ name: 'co1' });
		const num = new ColumnInfo({ name: '1' });

		const numEvnt = new EventReg(num);
		const nmeEvnt = new EventReg(nme);

		let obj = new CombinedInfo(nme, null);

		expect(obj.size).toBe(3);
		expect(obj.lines).toMatchObject(['co1']);
		expect(nmeEvnt.list).toMatchObject([]);
		obj.size = 10;
		expect(nmeEvnt.list).toMatchObject(['lines', 'size']);

		obj = new CombinedInfo(null, num);

		expect(obj.name).toBe('');
		expect(obj.size).toBe(5);
		expect(obj.lines).toMatchObject(['col-1']);
		obj.size = 10;
		expect(obj.size).toBe(10);
		expect(obj.lines).toMatchObject(['col-1     ']);
		expect(numEvnt.list).toMatchObject(['lines', 'size']);
	});

	test('testing min and max sizes', () => {
		let nme = new ColumnInfo({ name: 'co1', minSize: 2, maxSize: 20 });
		let num = new ColumnInfo({ name: '1', minSize: 3, maxSize: 15 });

		const numEvnt = new EventReg(num);
		const nmeEvnt = new EventReg(nme);

		let obj = new CombinedInfo(nme, num);

		expect(obj.size).toBe(15);
		expect(obj.minSize).toBe(3);
		expect(obj.maxSize).toBe(15);
		expect(obj.lines).toMatchObject(['co1            ']);
		expect(nmeEvnt.list).toMatchObject(['lines', 'size']);
		nmeEvnt.reset();

		obj.size = 2;
		expect(obj.size).toBe(0);
		expect(numEvnt.list).toMatchObject(['lines', 'size']);
		expect(nmeEvnt.list).toMatchObject(['lines', 'size']);
		expect(obj.lines).toMatchObject([]);

		numEvnt.reset();
		nmeEvnt.reset();

		obj.size = 20;
		expect(obj.size).toBe(15);
		expect(obj.lines).toMatchObject(['co1            ']);
		expect(numEvnt.list).toMatchObject(['lines', 'size']);
		expect(nmeEvnt.list).toMatchObject(['lines', 'size']);

		nme = new ColumnInfo({ name: 'co1', minSize: 2, maxSize: 20 });
		num = new ColumnInfo({ name: '1' });

		obj = new CombinedInfo(nme, num);
		expect(obj.maxFix).toBeTruthy();
		expect(obj.maxSize).toBe(20);
		expect(obj.minSize).toBe(2);

		nme = new ColumnInfo({ name: 'co1' });
		num = new ColumnInfo({ name: '1', minSize: 5, maxSize: 15 });

		obj = new CombinedInfo(nme, num);
		expect(obj.maxFix).toBeTruthy();
		expect(obj.maxSize).toBe(15);
		expect(obj.minSize).toBe(5);
		expect(obj.size).toBe(0);
		obj.size = 5;
		expect(obj.lines).toMatchObject(['co1  ']);
	});

	test('testing fixed sizes', () => {
		let nme = new ColumnInfo({ name: 'co1', size: 5 });
		let num = new ColumnInfo({ name: '1', size: 10 });

		const numEvnt = new EventReg(num);
		const nmeEvnt = new EventReg(nme);

		let obj = new CombinedInfo(nme, num);

		expect(obj.size).toBe(5);
		expect(obj.lines).toMatchObject(['co1  ']);
		expect(nmeEvnt.list).toMatchObject([]);
		expect(numEvnt.list).toMatchObject(['lines', 'size']);
		nmeEvnt.reset();
		numEvnt.reset();

		obj.size = 15;
		expect(obj.size).toBe(5);
		expect(numEvnt.list).toMatchObject(['lines', 'size']);
		expect(nmeEvnt.list).toMatchObject([]);
		numEvnt.reset();

		obj.size = 4;
		expect(obj.size).toBe(0);
		expect(numEvnt.list).toMatchObject(['lines', 'size']);
		expect(nmeEvnt.list).toMatchObject(['lines', 'size']);

		obj.size = 0;
		expect(obj.size).toBe(0);
		expect(obj.lines).toMatchObject([]);

		obj = new CombinedInfo(
			new ColumnInfo({ name: 'col1', size: 10 }),
			new ColumnInfo({ name: '1' }),
		);
		expect(obj.size).toBe(10);
		obj.size = 15;
		expect(obj.size).toBe(10);
		obj.size = 0;
		expect(obj.size).toBe(0);
		obj.size = -1;
		expect(obj.size).toBe(10);
		obj.size = 5;
		expect(obj.size).toBe(0);

		obj = new CombinedInfo(
			new ColumnInfo({ name: 'col1' }),
			new ColumnInfo({ name: '1', size: 10 }),
		);
		expect(obj.size).toBe(10);
		obj.size = 15;
		expect(obj.size).toBe(10);
		obj.size = 0;
		expect(obj.size).toBe(0);
		obj.size = -1;
		expect(obj.size).toBe(10);
		obj.size = 5;
		expect(obj.size).toBe(0);
	});

	test('odd size values', () => {
		const nme = new ColumnInfo({ name: 'col1', maxSize: 0.5, size: 10 });

		const obj = new CombinedInfo(nme, null);
		nme.tableSize = 10;
		obj.size = -1;
		expect(obj.size).toBe(10);

		obj.size = 5;
		expect(obj.size).toBe(0);
	});

	test('setsize and isFixed property', () => {
		// setsize returns the size set at the start of creating the columns.
		// should bear in mind that the name column has preference
		let nme = new ColumnInfo({ name: 'c1', size: 5 });
		let num = new ColumnInfo({ name: '0', size: 10 });
		let obj = new CombinedInfo(nme, num);

		obj.size = 20;

		expect(obj.setsize).toBe(5);
		expect(obj.isFixed).toBeTruthy();

		// should return 10 because num is set eventhough nme is not
		nme = new ColumnInfo({ name: 'c1' });
		num = new ColumnInfo({ name: '0', size: 10 });
		obj = new CombinedInfo(nme, num);
		obj.size = 20;
		expect(obj.setsize).toBe(10);
		expect(obj.isFixed).toBeTruthy();

		num = new ColumnInfo({ name: '0', size: 0.5 });
		obj = new CombinedInfo(nme, num);
		obj.size = 20;
		expect(obj.setsize).toBe(0.5);
		expect(obj.isFixed).toBeFalsy();
		obj.tableSize = 200;
		expect(obj.setsize).toBe(0.5);
		expect(obj.isFixed).toBeTruthy();

		// should return -1 if none is set
		nme = new ColumnInfo({ name: 'c1' });
		num = new ColumnInfo({ name: '0' });
		obj = new CombinedInfo(nme, num);
		obj.size = 20;
		expect(obj.setsize).toBe(-1);
		expect(obj.isFixed).toBeFalsy();

		// should have similar effect with null object
		num = new ColumnInfo({ name: '0', size: 10 });
		obj = new CombinedInfo(null, num);
		obj.size = 20;
		expect(obj.setsize).toBe(10);
		expect(obj.isFixed).toBeTruthy();

		nme = new ColumnInfo({ name: 'c1', size: 5 });
		obj = new CombinedInfo(nme, null);

		obj.size = 20;

		expect(obj.setsize).toBe(5);
		expect(obj.isFixed).toBeTruthy();
	});

	test('spacer and spaceSize Property', () => {
		// spaceSize = the size the actual data takes up in a given column.
		// please note that if ratio = 0, then spaceSize = size
		// if not then spaceSize = size - spacer
		// spacer being the padding and borders between header and content.

		let nme = new ColumnInfo({ name: 'c1' });
		let num = new ColumnInfo({ name: '0' });
		let obj = new CombinedInfo(nme, num);

		// size of the column
		expect(obj.spaceSize).toBe(2);
		// 2 x padding (2 each)
		expect(obj.spacer).toBe(4);

		nme.maxContent = 20;
		expect(obj.spaceSize).toBe(20);
		// 2 x padding (2 each)
		expect(obj.spacer).toBe(4);
		num.maxContent = 25;
		expect(obj.spaceSize).toBe(25);
		// 2 x padding (2 each)
		expect(obj.spacer).toBe(4);
		expect(obj.size).toBe(25);
		// now if ratio is set
		obj.ratio = 1;
		expect(obj.spacer).toBe(4);
		// header: 2 + content (25)
		expect(obj.spaceSize).toBe(27);
		// spaceSize + spacer
		expect(obj.size).toBe(31);

		nme = new ColumnInfo({ name: 'c1', size: 10 });
		num = new ColumnInfo({ name: '0' });
		obj = new CombinedInfo(nme, num);

		// size of the column
		expect(obj.spaceSize).toBe(10);
		expect(obj.size).toBe(10);

		nme.maxContent = 20;
		expect(obj.spaceSize).toBe(10);
		num.maxContent = 25;
		expect(obj.spaceSize).toBe(10);
		expect(obj.size).toBe(10);
		// now if ratio is set
		obj.ratio = 1;
		// max size (10) - spacer (4)... available space for content = 6
		expect(obj.spaceSize).toBe(6);
		expect(obj.size).toBe(10);

		// same preinciples apply if one item is null
		num = new ColumnInfo({ name: '0' });
		obj = new CombinedInfo(null, num);

		// size of the column ('col-0')
		expect(obj.spaceSize).toBe(5);
		// 2 x padding (2 each)
		expect(obj.spacer).toBe(4);

		nme = new ColumnInfo({ name: 'c1', size: 10 });
		obj = new CombinedInfo(nme, null);
		// size of the column ('col-0')
		expect(obj.spaceSize).toBe(10);
		// 2 x padding (2 each)
		expect(obj.spacer).toBe(4);

		obj = new CombinedInfo(null, null);
		expect(obj.spaceSize).toBe(0);
		expect(obj.spacer).toBe(0);
	});
});

describe('Ratio property insize CombinedInfo', () => {
	test('testing ratio property', () => {
		// The name (nmeCol) ratio is always used, unless it does not exist
		const num = new ColumnInfo({ name: '1' });
		const nme = new ColumnInfo({ name: 'col1' });

		const obj = new CombinedInfo(nme, num);

		num.maxContent = 2;
		nme.maxContent = 16;

		expect(obj.ratio).toBe(0);
		expect(obj.maxHeader).toBe(4);
		expect(obj.maxContent).toBe(16);

		const numEvnt = new EventReg(num);
		const nmeEvnt = new EventReg(nme);

		obj.ratio = 1;

		expect(obj.ratio).toBe(0.2);
		expect(obj.contentSize).toBe(16);
		expect(obj.headerSize).toBe(4);
		expect(obj.size).toBe(24);
		expect(obj.emptyContent).toBe('                ');
		expect(obj.emptyHeader).toBe('    ');
		expect(nmeEvnt.list).toMatchObject(['ratio', 'lines', 'size']);
		// headersize does not change from 5... therefore no ratio change... only size changed.
		expect(numEvnt.list).toMatchObject(['lines', 'size']);
		expect(nme.ratio).toBe(0.2);
		// if both num and nme - we don't change num.
		expect(num.ratio).toBe(0);

		numEvnt.reset();
		nmeEvnt.reset();

		obj.size = 14;
		expect(numEvnt.list).toMatchObject(['lines', 'size']);
		expect(nmeEvnt.list).toMatchObject(['lines', 'size']);

		expect(obj.size).toBe(14);
		expect(obj.ratio).toBe(0.2);
		expect(obj.contentSize).toBe(8);
		expect(obj.headerSize).toBe(2);
		expect(obj.maxContent).toBe(16);
		expect(obj.maxHeader).toBe(4);
		expect(obj.emptyContent).toBe('        ');
		expect(obj.emptyHeader).toBe('  ');

		numEvnt.reset();
		nmeEvnt.reset();

		// should reset content size
		obj.resetContent();
		expect(obj.size).toBe(14);
		expect(obj.ratio).toBe(0.5);
		expect(obj.headerSize).toBe(5);
		expect(obj.contentSize).toBe(5);
		expect(nme.ratio).toBe(0.5);
		expect(nme.contentSize).toBe(5);
		expect(obj.lines).toMatchObject(['col1 ']);
		expect(numEvnt.list).toMatchObject([]);
		expect(nmeEvnt.list).toMatchObject(['ratio', 'lines']);
		numEvnt.reset();
		nmeEvnt.reset();

		// should change spacer size
		obj.changeSpace(1, 1);
		expect(obj.size).toBe(14);
		expect(obj.headerSize).toBe(6);
		expect(obj.contentSize).toBe(5);
		expect(numEvnt.list).toMatchObject([]);
		expect(nmeEvnt.list).toMatchObject(['max', 'lines']);
		expect(obj.lines).toMatchObject(['col1  ']);

		numEvnt.reset();
		nmeEvnt.reset();

		// should change if content size changes
		num.maxContent = 6;
		expect(obj.ratio).toBe(0.4);
		expect(numEvnt.list).toMatchObject(['max']);
		// on any original item.
		nme.maxContent = 6;
		expect(obj.ratio).toBe(0.4);
		expect(nmeEvnt.list).toMatchObject(['max', 'ratio', 'lines']);
		expect(obj.size).toBe(14);

		nme.maxContent = 12;
		expect(obj.ratio).toBe(0.25);

		// fix ratio variable
		obj.ratio = 0.3;
		expect(obj.ratio).toBe(0.3);
		// don't change if ratio don't make sense
		obj.ratio = -1;
		expect(obj.ratio).toBe(0.3);
		obj.ratio = 2;
		expect(obj.ratio).toBe(0.3);
	});

	test('testing ratio property only nmeCol', () => {
		// The name (nmeCol) ratio is always used, unless it does not exist
		const nme = new ColumnInfo({ name: 'col1' });

		const obj = new CombinedInfo(nme, null);
		nme.maxContent = 16;

		expect(obj.ratio).toBe(0);
		expect(obj.maxHeader).toBe(4);
		expect(obj.maxContent).toBe(16);

		const nmeEvnt = new EventReg(nme);

		obj.ratio = 1;

		expect(obj.ratio).toBe(0.2);
		expect(obj.contentSize).toBe(16);
		expect(obj.headerSize).toBe(4);
		expect(obj.size).toBe(24);
		expect(obj.emptyContent).toBe('                ');
		expect(obj.emptyHeader).toBe('    ');
		expect(nmeEvnt.list).toMatchObject(['ratio', 'lines', 'size']);
		expect(nme.ratio).toBe(0.2);
		nmeEvnt.reset();

		obj.size = 14;
		expect(nmeEvnt.list).toMatchObject(['lines', 'size']);

		expect(obj.size).toBe(14);
		expect(obj.contentSize).toBe(8);
		expect(obj.headerSize).toBe(2);
		expect(obj.maxContent).toBe(16);
		expect(obj.maxHeader).toBe(4);
		expect(obj.emptyContent).toBe('        ');
		expect(obj.emptyHeader).toBe('  ');

		nmeEvnt.reset();

		// should reset content size
		obj.resetContent();
		expect(obj.size).toBe(14);
		expect(obj.ratio).toBe(0.5);
		expect(obj.headerSize).toBe(5);
		expect(obj.contentSize).toBe(5);
		expect(nme.ratio).toBe(0.5);
		expect(nme.contentSize).toBe(5);
		expect(obj.lines).toMatchObject(['col1 ']);
		expect(nmeEvnt.list).toMatchObject(['ratio', 'lines']);
		nmeEvnt.reset();

		// should change spacer size
		obj.changeSpace(1, 1);
		expect(obj.size).toBe(14);
		expect(obj.headerSize).toBe(6);
		expect(obj.contentSize).toBe(5);
		expect(nmeEvnt.list).toMatchObject(['max', 'lines']);
		expect(obj.lines).toMatchObject(['col1  ']);

		nmeEvnt.reset();

		// should change if content size changes
		nme.maxContent = 6;
		expect(obj.ratio).toBe(0.4);
		expect(nmeEvnt.list).toMatchObject(['max', 'ratio', 'lines']);
		expect(obj.size).toBe(14);

		nme.maxContent = 12;
		expect(obj.ratio).toBe(0.25);
	});

	test('testing ratio property only numCol', () => {
		// The name (nmeCol) ratio is always used, unless it does not exist
		const num = new ColumnInfo({ name: '1' });

		const obj = new CombinedInfo(null, num);

		num.maxContent = 2;

		expect(obj.ratio).toBe(0);
		expect(obj.maxHeader).toBe(5);
		expect(obj.maxContent).toBe(2);

		const numEvnt = new EventReg(num);

		obj.ratio = 1;

		expect(obj.ratio).toBe(5 / 7);
		expect(obj.contentSize).toBe(2);
		expect(obj.headerSize).toBe(5);
		expect(obj.size).toBe(11);
		expect(obj.emptyContent).toBe('  ');
		expect(obj.emptyHeader).toBe('     ');
		// only size changed
		expect(numEvnt.list).toMatchObject(['ratio', 'size']);
		numEvnt.reset();

		obj.size = 14;
		expect(numEvnt.list).toMatchObject(['lines', 'size']);

		expect(obj.size).toBe(14);
		expect(obj.contentSize).toBe(3);
		expect(obj.headerSize).toBe(7);
		expect(obj.maxContent).toBe(2);
		expect(obj.maxHeader).toBe(5);
		expect(obj.emptyContent).toBe('   ');
		expect(obj.emptyHeader).toBe('       ');

		numEvnt.reset();

		// should reset content size
		obj.resetContent();
		expect(obj.size).toBe(14);
		expect(obj.ratio).toBe(0.5);
		expect(obj.headerSize).toBe(5);
		expect(obj.contentSize).toBe(5);
		expect(obj.lines).toMatchObject(['col-1']);
		expect(numEvnt.list).toMatchObject(['ratio', 'lines']);
		numEvnt.reset();

		// should change spacer size
		obj.changeSpace(1, 1);
		expect(obj.size).toBe(14);
		expect(obj.headerSize).toBe(6);
		expect(obj.contentSize).toBe(5);
		expect(numEvnt.list).toMatchObject(['max', 'lines']);
		expect(obj.lines).toMatchObject(['col-1 ']);

		numEvnt.reset();

		// should change if content size changes
		num.maxContent = 6;
		expect(obj.ratio).toBe(5 / 11);
		expect(numEvnt.list).toMatchObject(['max', 'ratio', 'lines']);
		// on any original item.
		obj.changeSpace();
		expect(obj.size).toBe(14);
		expect(obj.headerSize).toBe(5);
	});
});

describe('odd property & Events tests inside CombinedInfo', () => {
	test('testing events', () => {
		const num = new ColumnInfo({ name: '1' });
		const nme = new ColumnInfo({ name: 'col1' });
		const numEvnt = new EventReg(num);
		const nmeEvnt = new EventReg(nme);

		const obj = new CombinedInfo(nme, num);
		const objEvnt = new EventReg(obj);
		nmeEvnt.reset();
		numEvnt.reset();

		num.maxContent = 20;

		expect(objEvnt.list).toMatchObject(['max', 'lines', 'size']);
		expect(numEvnt.list).toMatchObject(['max', 'lines', 'size']);
		expect(nmeEvnt.list).toMatchObject(['max', 'lines', 'size']);

		numEvnt.reset();
		nmeEvnt.reset();
		objEvnt.reset();

		obj.ratio = 1;
		expect(objEvnt.list).toMatchObject(['ratio', 'lines', 'size']);
		expect(nmeEvnt.list).toMatchObject(['ratio', 'lines', 'size']);
		expect(numEvnt.list).toMatchObject(['lines', 'size']);

		expect(obj.size).toBe(28);
		expect(obj.ratio).toBe(4 / 24);
		expect(obj.headerSize).toBe(4);
		expect(obj.contentSize).toBe(20);

		numEvnt.reset();
		nmeEvnt.reset();
		objEvnt.reset();
		expect(num.ratio).toBe(0);

		num.ratio = 0.3;
		expect(numEvnt.list).toMatchObject(['ratio', 'lines']);
		expect(nmeEvnt.list).toMatchObject([]);
		expect(objEvnt.list).toMatchObject([]);

		numEvnt.reset();
		nmeEvnt.reset();
		objEvnt.reset();
	});

	test('testing events by removing a colInfo object', () => {
		const num = new ColumnInfo({ name: '1' });
		const nme = new ColumnInfo({ name: 'col1' });

		const numEvnt = new EventReg(num);
		const nmeEvnt = new EventReg(nme);
		const obj = new CombinedInfo(nme, num);
		nmeEvnt.reset();
		numEvnt.reset();
		const objEvnt = new EventReg(obj);

		// done setting up
		num.maxContent = 20;

		expect(objEvnt.list).toMatchObject(['max', 'lines', 'size']);
		expect(numEvnt.list).toMatchObject(['max', 'lines', 'size']);
		expect(nmeEvnt.list).toMatchObject(['max', 'lines', 'size']);

		// should not be able to load a new column over an existing one
		const num2 = new ColumnInfo({ name: '2', size: 10, order: 2, tableSize: 20 });
		const num2Evnt = new EventReg(num2);

		numEvnt.reset();
		nmeEvnt.reset();
		objEvnt.reset();

		obj.addCol(nme, num2);
		expect(objEvnt.list).toMatchObject([]);
		expect(numEvnt.list).toMatchObject([]);
		expect(nmeEvnt.list).toMatchObject([]);
		expect(num2Evnt.list).toMatchObject([]);

		num2.size = 0;

		expect(obj.size).toBe(20);
		expect(objEvnt.list).toMatchObject([]);
		expect(numEvnt.list).toMatchObject([]);
		expect(nmeEvnt.list).toMatchObject([]);
		expect(num2Evnt.list).toMatchObject(['lines', 'size']);

		num2Evnt.reset();

		// same goes for nmeCols
		const nme2 = new ColumnInfo({ name: 'col2', tableSize: 5, order: 3 });
		const nme2Evnt = new EventReg(nme2);

		obj.addCol(nme2, num2);
		expect(objEvnt.list).toMatchObject([]);
		expect(nmeEvnt.list).toMatchObject([]);
		expect(nme2Evnt.list).toMatchObject([]);
		expect(num2Evnt.list).toMatchObject([]);

		expect(obj.name).toBe('col1');
	});

	test('align properties', () => {
		const num = new ColumnInfo({
			name: '1',
			size: 10,
			align: Alignment.right,
			headAlign: Alignment.center,
		});
		const nme = new ColumnInfo({
			name: 'col1',
			size: 10,
			align: Alignment.center,
			headAlign: Alignment.right,
		});
		let obj = new CombinedInfo(nme, num);

		expect(obj.size).toBe(10);
		expect(obj.align).toBe(Alignment.center);
		expect(obj.headAlign).toBe(Alignment.right);
		expect(obj.lines).toMatchObject(['      col1']);

		obj = new CombinedInfo(null, num);

		expect(obj.size).toBe(10);
		expect(obj.align).toBe(Alignment.right);
		expect(obj.headAlign).toBe(Alignment.center);
		expect(obj.lines).toMatchObject(['  col-1   ']);
	});

	test('adding collumns later - name compatibility', () => {
		let nme = new ColumnInfo({ name: 'headr' });
		let num = new ColumnInfo({ name: '0' });
		let obj = new CombinedInfo(null, num);

		expect(obj.lines).toMatchObject(['col-0']);

		obj.addCol(nme, num);

		expect(obj.lines).toMatchObject(['headr']);

		nme = new ColumnInfo({ name: 'hea-0', size: 3 });
		num = new ColumnInfo({ name: '0', size: 3, tableSize: 10 });
		obj = new CombinedInfo(null, num);

		expect(obj.lines).toMatchObject(['col', '-0 ']);

		obj.addCol(nme, num);

		expect(obj.lines).toMatchObject(['hea', '-0 ']);
	});

	test('order Properties in both items', () => {
		const nme = new ColumnInfo({ name: 'nme', order: 2 });
		let num = new ColumnInfo({ name: '0', order: 1 });

		let obj = new CombinedInfo(nme, num);
		expect(obj.order).toBe(1);

		num = new ColumnInfo({ name: '0', order: 3 });

		obj = new CombinedInfo(nme, num);
		expect(obj.order).toBe(2);
	});
});
