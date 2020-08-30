jest.mock('readline');
import { Table } from '../src/lib/table';
import { Options, Alignment, boksOptions, BorderTypes } from '../src/types/options';
import { templates } from 'boks';
import { table } from 'console';

let writeSpy = [];
const clearScreenSpy = () => (global as any).rl.clearScreenSpy;
const move = () => (global as any).rl.move;
process.stdout.write = (str, cb) => {
	writeSpy.push(str);
	if (cb) cb();
	return true;
};
function clean() {
	writeSpy = [];
	(global as any).rl.clean();
}

describe('ToTable initialization', () => {
	test('testing clean initialization', () => {
		const table = new Table();
		expect(table).toMatchObject({
			key: '',
			row: -1,
			sze: -1,
			rawData: [],
			newData: [],
			newLines: [],
			lnes: [],
			keys: [],
			cols: {},
			combined: {},
			sortedCols: [],
			val: '',
			oldVal: '',
			head: '',
			oldHeader: '',
			separator: '',
			bottomBorder: '',
			padString: '  ',
			borders: {
				content: {
					topLeft: '┌',
					topRight: '┐',
					bottomLeft: '└',
					bottomRight: '┘',
					top: '─',
					bottom: '─',
					left: '│',
					right: '│',
					topIntersect: '┬',
					bottomIntersect: '┴',
					leftIntersect: '├',
					rightIntersect: '┤',
					intersect: '┼',
					horizontal: '─',
					vertical: '│',
				},
				header: {
					topLeft: '┌',
					topRight: '┐',
					bottomLeft: '╞',
					bottomRight: '╡',
					top: '─',
					bottom: '═',
					left: '│',
					right: '│',
					topIntersect: '┬',
					bottomIntersect: '╪',
					leftIntersect: '├',
					rightIntersect: '┤',
					intersect: '┼',
					horizontal: '─',
					vertical: '│',
				},
			},
			vBorder: 1,
			lBorder: 1,
			rBorder: 1,
			padSize: 2,
			deep: 1,
			valueReset: false,
			streaming: false,
			canGrow: true,
			nextOption: [
				{
					borders: {
						content: {
							bottom: '─',
							bottomIntersect: '┴',
							bottomLeft: '└',
							bottomRight: '┘',
							horizontal: '',
							intersect: '┼',
							left: '│',
							leftIntersect: '├',
							right: '│',
							rightIntersect: '┤',
							top: '─',
							topIntersect: '┬',
							topLeft: '┌',
							topRight: '┐',
							vertical: '│',
						},
						headPure: {
							bottom: '─',
							bottomIntersect: '╨',
							bottomLeft: '└',
							bottomRight: '┘',
							horizontal: '',
							intersect: '╫',
							left: '│',
							leftIntersect: '├',
							right: '│',
							rightIntersect: '┤',
							top: '─',
							topIntersect: '╥',
							topLeft: '┌',
							topRight: '┐',
							vertical: '║',
						},
						header: {
							bottom: '═',
							bottomIntersect: '╪',
							bottomLeft: '╞',
							bottomRight: '╡',
							horizontal: '',
							intersect: '┼',
							left: '│',
							leftIntersect: '├',
							right: '│',
							rightIntersect: '┤',
							top: '─',
							topIntersect: '┬',
							topLeft: '┌',
							topRight: '┐',
							vertical: '│',
						},
					},
					eLevel: 1,
					margin: 0,
					maxDepth: 3,
					padding: 1,
					stream: false,
				},
			],
			maxdepth: 3,
			eLevel: 1,
			maxsize: 120,
			margin: 2,
			tabsize: 2,
			flat: false,
		});
		expect(table.isTable).toBeTruthy();
	});

	test('testing clean initialization with array', () => {
		const table = new Table(null, []);
		expect(table).toMatchObject({
			key: '',
			row: -1,
			sze: -1,
			rawData: [],
			newData: [],
			newLines: [],
			lnes: [],
			keys: [],
			cols: {},
			combined: {},
			sortedCols: [],
			val: '',
			oldVal: '',
			head: '',
			oldHeader: '',
			separator: '',
			bottomBorder: '',
			padString: '  ',
			borders: {
				content: {
					topLeft: '┌',
					topRight: '┐',
					bottomLeft: '└',
					bottomRight: '┘',
					top: '─',
					bottom: '─',
					left: '│',
					right: '│',
					topIntersect: '┬',
					bottomIntersect: '┴',
					leftIntersect: '├',
					rightIntersect: '┤',
					intersect: '┼',
					horizontal: '─',
					vertical: '│',
				},
				header: {
					topLeft: '┌',
					topRight: '┐',
					bottomLeft: '╞',
					bottomRight: '╡',
					top: '─',
					bottom: '═',
					left: '│',
					right: '│',
					topIntersect: '┬',
					bottomIntersect: '╪',
					leftIntersect: '├',
					rightIntersect: '┤',
					intersect: '┼',
					horizontal: '─',
					vertical: '│',
				},
			},
			vBorder: 1,
			lBorder: 1,
			rBorder: 1,
			padSize: 2,
			deep: 1,
			valueReset: false,
			streaming: false,
			canGrow: true,
			nextOption: [
				{
					borders: {
						content: {
							bottom: '─',
							bottomIntersect: '┴',
							bottomLeft: '└',
							bottomRight: '┘',
							horizontal: '',
							intersect: '┼',
							left: '│',
							leftIntersect: '├',
							right: '│',
							rightIntersect: '┤',
							top: '─',
							topIntersect: '┬',
							topLeft: '┌',
							topRight: '┐',
							vertical: '│',
						},
						headPure: {
							bottom: '─',
							bottomIntersect: '╨',
							bottomLeft: '└',
							bottomRight: '┘',
							horizontal: '',
							intersect: '╫',
							left: '│',
							leftIntersect: '├',
							right: '│',
							rightIntersect: '┤',
							top: '─',
							topIntersect: '╥',
							topLeft: '┌',
							topRight: '┐',
							vertical: '║',
						},
						header: {
							bottom: '═',
							bottomIntersect: '╪',
							bottomLeft: '╞',
							bottomRight: '╡',
							horizontal: '',
							intersect: '┼',
							left: '│',
							leftIntersect: '├',
							right: '│',
							rightIntersect: '┤',
							top: '─',
							topIntersect: '┬',
							topLeft: '┌',
							topRight: '┐',
							vertical: '│',
						},
					},
					eLevel: 1,
					margin: 0,
					maxDepth: 3,
					padding: 1,
					stream: false,
				},
			],
			maxdepth: 3,
			eLevel: 1,
			maxsize: 120,
			margin: 2,
			tabsize: 2,
			flat: false,
		});
		table.value;
		expect(table.isTable).toBeTruthy();
	});

	test('subOptions options variable', () => {
		const data = {
			name: 'first-data-layer',
			level: {
				name: 'second-data - layer',
				level: {
					name: 'third-data-layer',
					level: {
						name: 'fourth-data-layer',
					},
				},
			},
		};
		const options: Options = {
			subOptions: [
				false, // for second data layer
				{
					// for third data layer
					maxSize: 4,
					padding: 1,
					align: Alignment.right,
					excludeHeader: false, // should be true automatically (regardless of setting)
					stream: true, // should be ignored [main setting is used]
				},
				{
					borders: [{ vertical: '||' as any }],
				},
			],
		};
	});
});

describe('Testing sizing properties', () => {
	test('space and maxData property', () => {
		const tbl = new Table();

		// maxsize (120) - margin (2) - borders (1 + 1) - padding (2 + 2)
		expect(tbl.space).toBe(112);
		expect(tbl.maxData).toBe(0);
		expect(tbl.isFlat).toBeFalsy();

		tbl.addData({ p1: 'prop1', p2: false });
		expect(tbl.space).toBe(112);
		// headerMax (2) + contentMax (5) + padding (2+2) + border (1) = 12
		expect(tbl.maxData).toBe(12);
		expect(tbl.isFlat).toBeFalsy();

		tbl.size = 20;
		// size (20) - margin (2) - borders(1 + 1) - padding (2 + 2)
		expect(tbl.space).toBe(12);
		expect(tbl.maxData).toBe(12);

		tbl.addData({ p1: 'someotherprop' });
		expect(tbl.space).toBe(12);
		expect(tbl.isFlat).toBeTruthy();
		// is now flat [more than 1 data object]...
		// p1 (13) + padding (2 + 2) + border (1) + p2: 5
		expect(tbl.maxData).toBe(23);

		tbl.size = 0;
		expect(tbl.space).toBe(0);
	});

	test('spacing', () => {
		const options: Options = {
			maxSize: 5,
		};
		const tbl = new Table(null, options);
		// maxSize is smaller than available space
		expect(tbl.space).toBe(0);
	});

	test('changing padding', () => {
		const data = [['bigger', 'sm', 'biggest']];

		const tbl = new Table(data);

		expect(tbl.value).toBe(
			'  ┌─────────╥───────────┐\n  │  col-0  ║  bigger   │\n  ├─────────╫───────────┤\n  │  col-1  ║  sm       │\n  ├─────────╫───────────┤\n  │  col-2  ║  biggest  │\n  └─────────╨───────────┘',
		);
		expect(tbl.value).toBe(
			'  ┌─────────╥───────────┐\n  │  col-0  ║  bigger   │\n  ├─────────╫───────────┤\n  │  col-1  ║  sm       │\n  ├─────────╫───────────┤\n  │  col-2  ║  biggest  │\n  └─────────╨───────────┘',
		);
		tbl.padding = 2;

		tbl.padding = 1;

		expect(tbl.value).toBe(
			'  ┌───────╥─────────┐\n  │ col-0 ║ bigger  │\n  ├───────╫─────────┤\n  │ col-1 ║ sm      │\n  ├───────╫─────────┤\n  │ col-2 ║ biggest │\n  └───────╨─────────┘',
		);
	});

	test('setting size on options', () => {
		const data = [['bigger', 'sm', 'biggest']];

		const tbl = new Table(data, { size: 20 });

		expect(tbl.value).toBe(
			'  ┌───────╥────────┐\n  │  col  ║  bigg  │\n  │  -0   ║  er    │\n  ├───────╫────────┤\n  │  col  ║  sm    │\n  │  -1   ║        │\n  ├───────╫────────┤\n  │  col  ║  bigg  │\n  │  -2   ║  est   │\n  └───────╨────────┘',
		);

		tbl.addRow(1);

		expect(tbl.value).toBe(
			'  ┌────────┬───────┐\n  │  col-  │  col  │\n  │  0     │  -1   │\n  ╞════════╪═══════╡\n  │  bigg  │  sm   │\n  │  er    │       │\n  ├────────┼───────┤\n  │  1     │       │\n  └────────┴───────┘',
		);
		tbl.size = 50;
		expect(tbl.value).toBe(
			'  ┌──────────┬─────────┬───────────┐\n  │  col-0   │  col-1  │  col-2    │\n  ╞══════════╪═════════╪═══════════╡\n  │  bigger  │  sm     │  biggest  │\n  ├──────────┼─────────┼───────────┤\n  │  1       │         │           │\n  └──────────┴─────────┴───────────┘',
		);
	});

	test('tabSizing', () => {
		const data: any[] = [['dat\t1', 'dat\t2']];
		let tbl = new Table(data);

		expect(tbl.value).toBe(
			'  ┌─────────╥──────────┐\n  │  col-0  ║  dat  1  │\n  ├─────────╫──────────┤\n  │  col-1  ║  dat  2  │\n  └─────────╨──────────┘',
		);

		tbl = new Table(data, { tabSize: -1 });

		expect(tbl.value).toBe(
			'  ┌─────────╥────────┐\n  │  col-0  ║  dat1  │\n  ├─────────╫────────┤\n  │  col-1  ║  dat2  │\n  └─────────╨────────┘',
		);

		data.push([{ v1: '1\t2', v2: 't\tt' }]);
		tbl = new Table(data, { tabSize: 4 });

		expect(tbl.value).toBe(
			'  ┌───────────────┬────────────┐\n  │  col-0        │  col-1     │\n  ╞═══════════════╪════════════╡\n  │  dat    1     │  dat    2  │\n  ├───────────────┼────────────┤\n  │  v1 ║ 1    2  │            │\n  │  v2 ║ t    t  │            │\n  └───────────────┴────────────┘',
		);
	});

	test('column percentage sizers', () => {
		let data = [
			['sml', 'bigger'],
			['2nd', 'biggest'],
		];
		let tbl = new Table(data, { columns: [null, { name: 'c2', size: 0.4 }] });

		// max sizes should be applies as it is still less than table size
		expect(tbl.value).toBe(
			'  ┌──────────────┬───────────┐\n  │  col-0       │  c2       │\n  ╞══════════════╪═══════════╡\n  │  sml         │  bigger   │\n  ├──────────────┼───────────┤\n  │  2nd         │  biggest  │\n  └──────────────┴───────────┘',
		);

		data = [
			['bigger', 'sameval'],
			['biggest', '2nd'],
		];
		// even though c2 could be bigger when looking at 25 size.. it is limited by ratio
		//  (25 - margin, border & padding (8) - spacer (5)) x 0.2 = 2.4 ... 2
		//  remainder size = (2 / 0.2) - 2 = 8
		// 8 + 2 + spacer (5) + padding, marigin & border (8) = 23 and not 25... ratio remains
		tbl = new Table(data, { columns: [null, { name: 'c2', size: 0.2 }], size: 25 });

		expect(tbl.value).toBe(
			'  ┌────────────┬──────┐\n  │  col-0     │  c2  │\n  ╞════════════╪══════╡\n  │  bigger    │  sa  │\n  │            │  me  │\n  │            │  va  │\n  │            │  l   │\n  ├────────────┼──────┤\n  │  biggest   │  2n  │\n  │            │  d   │\n  └────────────┴──────┘',
		);

		// and reducing size to very small:
		tbl = new Table(data, { columns: [null, { name: 'c2', size: 0.2 }], size: 12 });

		expect(tbl.value).toBe(
			'  ┌────────┐\n  │  col-  │\n  │  0     │\n  ╞════════╡\n  │  bigg  │\n  │  er    │\n  ├────────┤\n  │  bigg  │\n  │  est   │\n  └────────┘',
		);

		// setting size percentage very big, will change effect if no table size is set.
		tbl = new Table(data, { columns: [null, { name: 'c2', size: 0.8 }] });

		expect(tbl.value).toBe(
			'  ┌───────────┬────────────────────────────────┐\n  │  col-0    │  c2                            │\n  ╞═══════════╪════════════════════════════════╡\n  │  bigger   │  sameval                       │\n  ├───────────┼────────────────────────────────┤\n  │  biggest  │  2nd                           │\n  └───────────┴────────────────────────────────┘',
		);

		// fixing spacing issue test
		data = [['bigger'], ['biggest']];
		tbl = new Table(data, { columns: [null, { name: 'c2', size: 0.8 }] });

		expect(tbl.value).toBe(
			'  ┌───────────┐\n  │  col-0    │\n  ╞═══════════╡\n  │  bigger   │\n  ├───────────┤\n  │  biggest  │\n  └───────────┘',
		);
	});

	test('min & max column sizing', () => {
		const data = [
			['bigger', '2nd val'],
			['biggest', 'col2'],
		];
		let tbl = new Table(data, {
			canGrow: true,
			columns: [
				{ name: 'c1', minSize: 5 },
				{ name: 'c2', maxSize: 6 },
			],
			maxSize: 10,
		});

		expect(tbl.value).toBe(
			'  ┌──────┐\n  │  c2  │\n  ╞══════╡\n  │  2n  │\n  │  d   │\n  │  va  │\n  │  l   │\n  ├──────┤\n  │  co  │\n  │  l2  │\n  └──────┘',
		);

		tbl = new Table(data, {
			canGrow: true,
			columns: [
				{ name: 'c1', minSize: 4 },
				{ name: 'c2', maxSize: 6 },
			],
			maxSize: 16,
		});
		expect(tbl.value).toBe(
			'  ┌───────────┐\n  │  c1       │\n  ╞═══════════╡\n  │  bigger   │\n  ├───────────┤\n  │  biggest  │\n  └───────────┘',
		);
		// limited to max size of the column (7) [8 = margin etc]
		expect(tbl.lines[0].length).toBe(15);

		// testing fill
		tbl = new Table(data, {
			canGrow: true,
			columns: [
				{ name: 'c1', minSize: 4 },
				{ name: 'c2', maxSize: 6 },
			],
			maxSize: 17,
			fill: true,
		});
		expect(tbl.value).toBe(
			'  ┌─────────────┐\n  │  c1         │\n  ╞═════════════╡\n  │  bigger     │\n  ├─────────────┤\n  │  biggest    │\n  └─────────────┘',
		);
		expect(tbl.lines[0].length).toBe(17);

		tbl = new Table(data, {
			canGrow: true,
			columns: [
				{ name: 'c1', minSize: 4 },
				{ name: 'c2', size: 5 },
			],
			maxSize: 16,
		});

		expect(tbl.value).toBe(
			'  ┌───────────┐\n  │  c1       │\n  ╞═══════════╡\n  │  bigger   │\n  ├───────────┤\n  │  biggest  │\n  └───────────┘',
		);
	});

	test('col fixed sizing', () => {
		const data = [
			['bigger', '2nd val'],
			['biggest', 'col2'],
		];
		let tbl = new Table(data, {
			canGrow: true,
			columns: [
				{ name: 'c1', minSize: 1 },
				{ name: 'c2', size: 5 },
			],
			maxSize: 16,
		});

		expect(tbl.value).toBe(
			'  ┌───────────┐\n  │  c1       │\n  ╞═══════════╡\n  │  bigger   │\n  ├───────────┤\n  │  biggest  │\n  └───────────┘',
		);

		tbl = new Table(data, {
			canGrow: true,
			columns: [
				{ name: 'c1', minSize: 1 },
				{ name: 'c2', size: 4 },
			],
			maxSize: 16,
		});

		expect(tbl.value).toBe(
			'  ┌───────────┐\n  │  c1       │\n  ╞═══════════╡\n  │  bigger   │\n  ├───────────┤\n  │  biggest  │\n  └───────────┘',
		);
	});
});

describe('Testing output', () => {
	beforeAll(() => {
		clean();
	});
	afterEach(() => {
		clean();
	});

	test('simpleObject', () => {
		const data = {
			pr1: 'p1',
			property2: 'prop2',
		};

		const tbl = new Table(data);
		expect(writeSpy.length).toEqual(0);

		tbl.print();
		expect(writeSpy.length).toEqual(1);
		expect(writeSpy[0]).toEqual(
			'  ┌─────────────╥─────────┐\n  │  pr1        ║  p1     │\n  ├─────────────╫─────────┤\n  │  property2  ║  prop2  │\n  └─────────────╨─────────┘\n',
		);
		expect(move().length).toEqual(0);
		expect(clearScreenSpy()).toEqual(0);
	});

	test('depth level 2 object', () => {
		const data = {
			pr1: 'p1',
			property2: {
				d1: 'lvl2',
				d2: 'lvl2',
			},
		};

		const tbl = new Table(data);
		expect(writeSpy.length).toEqual(0);

		tbl.print();
		expect(writeSpy.length).toEqual(1);
		expect(writeSpy[0]).toEqual(`  ┌─────────────╥─────────────┐
  │  pr1        ║  p1         │
  ├─────────────╫─────────────┤
  │  property2  ║  d1 ║ lvl2  │
  │             ║  d2 ║ lvl2  │
  └─────────────╨─────────────┘
`);
		expect(move().length).toEqual(0);
		expect(clearScreenSpy()).toEqual(0);
	});

	test('depth level 3 object', () => {
		const data = {
			pr1: 'p1',
			property2: {
				d1: 'lvl2',
				d2: {
					b1: 'lvl3',
					b2: 'other',
				},
			},
		};

		const tbl = new Table(data);
		expect(writeSpy.length).toEqual(0);

		tbl.print();
		expect(writeSpy.length).toEqual(1);
		expect(writeSpy[0]).toEqual(`  ┌─────────────╥───────────────────┐
  │  pr1        ║  p1               │
  ├─────────────╫───────────────────┤
  │  property2  ║  d1 ║ lvl2        │
  │             ║  d2 ║ b1 ║ lvl3   │
  │             ║     ║ b2 ║ other  │
  └─────────────╨───────────────────┘
`);
		expect(move().length).toEqual(0);
		expect(clearScreenSpy()).toEqual(0);
	});

	test('depth level 4 object', () => {
		const data = {
			pr1: 'l1',
			property2: {
				d1: 'l2',
				d2: {
					b1: 'l3',
					b2: {
						pl4: 'l4',
						pl4_2: 'other',
					},
				},
			},
		};

		const tbl = new Table(data);
		expect(writeSpy.length).toEqual(0);

		tbl.print();
		expect(writeSpy.length).toEqual(1);
		expect(writeSpy[0]).toEqual(`  ┌─────────────╥──────────────────────────────────────────┐
  │  pr1        ║  l1                                      │
  ├─────────────╫──────────────────────────────────────────┤
  │  property2  ║  d1 ║ l2                                 │
  │             ║  d2 ║ b1 ║ l3                            │
  │             ║     ║ b2 ║ {"pl4":"l4","pl4_2":"other"}  │
  └─────────────╨──────────────────────────────────────────┘
`);
		expect(move().length).toEqual(0);
		expect(clearScreenSpy()).toEqual(0);
	});

	test('different Depth on object', () => {
		const data = {
			pr1: 'p1',
			property2: {
				d1: 'lvl2',
				d2: {
					b1: 'lvl3',
					b2: 'other',
				},
			},
		};

		const tbl = new Table(data, { maxDepth: 2 });
		expect(writeSpy.length).toEqual(0);

		tbl.print();
		expect(writeSpy.length).toEqual(1);
		expect(writeSpy[0]).toEqual(`  ┌─────────────╥───────────────────────────────────┐
  │  pr1        ║  p1                               │
  ├─────────────╫───────────────────────────────────┤
  │  property2  ║  d1 ║ lvl2                        │
  │             ║  d2 ║ {"b1":"lvl3","b2":"other"}  │
  └─────────────╨───────────────────────────────────┘
`);
		expect(move().length).toEqual(0);
		expect(clearScreenSpy()).toEqual(0);
	});

	test('data Arrays', () => {
		// simple
		const data = ['p1', 'prop2', true, false, 1, 0];

		let tbl = new Table(data);

		expect(tbl.lines).toMatchObject([
			'  │  col-0  ║  p1     │',
			'  │  col-1  ║  prop2  │',
			'  │  col-2  ║  true   │',
			'  │  col-3  ║  false  │',
			'  │  col-4  ║  1      │',
			'  │  col-5  ║  0      │',
		]);

		const complexData = [
			'p1',
			{ b1: 'inside', b2: { c1: 'lvl3', c2: true, c3: false, c4: 1 } },
		];

		tbl = new Table(complexData);
		expect(tbl.lines).toMatchObject([
			'  │  p1      │              │',
			'  │  inside  │  c1 ║ lvl3   │',
			'  │          │  c2 ║ true   │',
			'  │          │  c3 ║ false  │',
			'  │          │  c4 ║ 1      │',
		]);

		const complexData2 = [
			['p1', { b1: 'inside', b2: { c1: 'lvl3', c2: true, c3: false, c4: 1 } }],
		];

		tbl = new Table(complexData2);
		expect(tbl.lines).toMatchObject([
			'  │  col-0  ║  p1               │',
			'  │  col-1  ║  b1 ║ inside      │',
			'  │         ║  b2 ║ c1 ║ lvl3   │',
			'  │         ║     ║ c2 ║ true   │',
			'  │         ║     ║ c3 ║ false  │',
			'  │         ║     ║ c4 ║ 1      │',
		]);

		const moreComplex = [{ p1: 'prop1' }, 'p2', 'p3', { p2: 'alone' }, ['add1', 'add2']];
		tbl = new Table(moreComplex);
		expect(tbl.lines).toMatchObject([
			'  │  prop1  │         │',
			'  │  p2     │         │',
			'  │  p3     │         │',
			'  │         │  alone  │',
			'  │  add1   │  add2   │',
		]);
		expect(writeSpy.length).toEqual(0);
		tbl.print();
		expect(writeSpy.length).toEqual(1);
		expect(writeSpy[0]).toEqual(`  ┌─────────┬─────────┐
  │  p1     │  p2     │
  ╞═════════╪═════════╡
  │  prop1  │         │
  ├─────────┼─────────┤
  │  p2     │         │
  ├─────────┼─────────┤
  │  p3     │         │
  ├─────────┼─────────┤
  │         │  alone  │
  ├─────────┼─────────┤
  │  add1   │  add2   │
  └─────────┴─────────┘
`);
		writeSpy = [];

		const moreComplex2 = [{ p1: 'prop1' }, ['p2', 'p3'], { p2: 'alone' }, ['add1', 'add2']];
		tbl = new Table(moreComplex2);
		expect(tbl.lines).toMatchObject([
			'  │  prop1  │         │',
			'  │  p2     │  p3     │',
			'  │         │  alone  │',
			'  │  add1   │  add2   │',
		]);
		tbl.print();
		expect(writeSpy.length).toEqual(1);
		expect(writeSpy[0]).toEqual(`  ┌─────────┬─────────┐
  │  p1     │  p2     │
  ╞═════════╪═════════╡
  │  prop1  │         │
  ├─────────┼─────────┤
  │  p2     │  p3     │
  ├─────────┼─────────┤
  │         │  alone  │
  ├─────────┼─────────┤
  │  add1   │  add2   │
  └─────────┴─────────┘
`);
		expect(move().length).toEqual(0);
		expect(clearScreenSpy()).toEqual(0);
	});
});

describe('adding data', () => {
	beforeAll(() => {
		clean();
	});
	afterEach(() => {
		clean();
	});

	test('easy Add', () => {
		const data = {
			p1: 'p',
			p2: '2',
		};
		const tbl = new Table(data);
		tbl.print();
		expect(writeSpy.length).toEqual(1);
		expect(writeSpy[0]).toEqual(
			'  ┌──────╥─────┐\n  │  p1  ║  p  │\n  ├──────╫─────┤\n  │  p2  ║  2  │\n  └──────╨─────┘\n',
		);
		clean();
		tbl.addData(null);
		tbl.print();
		expect(writeSpy.length).toEqual(1);
		expect(writeSpy[0]).toEqual(
			'  ┌──────╥─────┐\n  │  p1  ║  p  │\n  ├──────╫─────┤\n  │  p2  ║  2  │\n  └──────╨─────┘\n',
		);
		clean();
		tbl.addRow(null);
		tbl.print();
		expect(writeSpy.length).toEqual(1);
		expect(writeSpy[0]).toEqual(
			'  ┌──────╥─────┐\n  │  p1  ║  p  │\n  ├──────╫─────┤\n  │  p2  ║  2  │\n  └──────╨─────┘\n',
		);
		clean();
		tbl.addRow(['big', '1']);
		tbl.print();
		expect(writeSpy.length).toEqual(1);
		expect(writeSpy[0]).toEqual(
			'  ┌───────┬──────┐\n  │  p1   │  p2  │\n  ╞═══════╪══════╡\n  │  p    │  2   │\n  ├───────┼──────┤\n  │  big  │  1   │\n  └───────┴──────┘\n',
		);
		clean();
		tbl.size = 14;
		tbl.print();
		expect(writeSpy.length).toEqual(1);
		expect(writeSpy[0]).toEqual(
			'  ┌───────┐\n  │  p1   │\n  ╞═══════╡\n  │  p    │\n  ├───────┤\n  │  big  │\n  └───────┘\n',
		);
		clean();
		tbl.size = 17;
		tbl.print();
		expect(writeSpy.length).toEqual(1);
		expect(writeSpy[0]).toEqual(
			'  ┌──────┬──────┐\n  │  p1  │  p2  │\n  ╞══════╪══════╡\n  │  p   │  2   │\n  ├──────┼──────┤\n  │  bi  │  1   │\n  │  g   │      │\n  └──────┴──────┘\n',
		);
	});

	test('add different columns', () => {
		const data = [['first', 'second']];
		const tbl = new Table(data);
		expect(tbl.lines).toMatchObject(['  │  col-0  ║  first   │', '  │  col-1  ║  second  │']);
		tbl.addRow({ prop1: 'someVal', prop3: 'otherVal' });
		tbl.print();
		expect(writeSpy.length).toEqual(1);
		expect(writeSpy[0]).toEqual(`  ┌───────────┬────────────┐
  │  prop1    │  prop3     │
  ╞═══════════╪════════════╡
  │  first    │  second    │
  ├───────────┼────────────┤
  │  someVal  │  otherVal  │
  └───────────┴────────────┘
`);
		clean();
		tbl.addRow({ prop1: 'f2', prop2: 'new', prop3: 'f3' });
		tbl.print();
		expect(writeSpy.length).toEqual(1);
		expect(writeSpy[0]).toEqual(`  ┌───────────┬────────────┬─────────┐
  │  prop1    │  prop3     │  prop2  │
  ╞═══════════╪════════════╪═════════╡
  │  first    │  second    │         │
  ├───────────┼────────────┼─────────┤
  │  someVal  │  otherVal  │         │
  ├───────────┼────────────┼─────────┤
  │  f2       │  f3        │  new    │
  └───────────┴────────────┴─────────┘
`);
		clean();
		tbl.addRow([, , , 'd']);
		tbl.print();
		expect(writeSpy.length).toEqual(1);
		expect(writeSpy[0]).toEqual(`  ┌───────────┬────────────┬─────────┬─────────┐
  │  prop1    │  prop3     │  prop2  │  col-3  │
  ╞═══════════╪════════════╪═════════╪═════════╡
  │  first    │  second    │         │         │
  ├───────────┼────────────┼─────────┼─────────┤
  │  someVal  │  otherVal  │         │         │
  ├───────────┼────────────┼─────────┼─────────┤
  │  f2       │  f3        │  new    │         │
  ├───────────┼────────────┼─────────┼─────────┤
  │           │            │         │  d      │
  └───────────┴────────────┴─────────┴─────────┘
`);
	});

	test('fixed columns add', () => {
		const data = [['first', 'second']];
		const options: Options = {
			columns: ['p1', 'p2'],
			canGrow: false,
		};
		const tbl = new Table(null, options);
		tbl.addData(data);
		tbl.print();
		expect(writeSpy.length).toEqual(1);
		expect(writeSpy[0]).toEqual(`  ┌──────╥──────────┐
  │  p1  ║  first   │
  ├──────╫──────────┤
  │  p2  ║  second  │
  └──────╨──────────┘
`);
		clean();
		tbl.addRow({ prop1: 'someVal', prop3: 'otherVal' });
		tbl.print();
		expect(writeSpy.length).toEqual(1);
		expect(writeSpy[0]).toEqual(`  ┌─────────┬──────────┐
  │  p1     │  p2      │
  ╞═════════╪══════════╡
  │  first  │  second  │
  └─────────┴──────────┘
`);
		clean();
		tbl.inclusive = true;
		tbl.inclusive = true;
		tbl.print();
		expect(writeSpy.length).toEqual(1);
		expect(writeSpy[0]).toEqual(`  ┌─────────┬──────────┐
  │  p1     │  p2      │
  ╞═════════╪══════════╡
  │  first  │  second  │
  ├─────────┼──────────┤
  │         │          │
  └─────────┴──────────┘
`);
		clean();
		tbl.addRow({ p1: 'f2', p2: 'new', prop3: 'f3' });
		tbl.addRow(['this', 'that', , 'd']);
		tbl.print();
		expect(writeSpy.length).toEqual(1);
		expect(writeSpy[0]).toEqual(`  ┌─────────┬──────────┐
  │  p1     │  p2      │
  ╞═════════╪══════════╡
  │  first  │  second  │
  ├─────────┼──────────┤
  │         │          │
  ├─────────┼──────────┤
  │  f2     │  new     │
  ├─────────┼──────────┤
  │  this   │  that    │
  └─────────┴──────────┘
`);
	});

	test('without borders', () => {
		const data = [['first', 'second'], { p1: undefined, p2: 'new', prop3: 'f3' }];
		const options: Options = {
			columns: ['p1', 'p2'],
			canGrow: false,
			borders: {
				header: templates.single,
				content: false,
			},
			print: true,
		};
		const tbl = new Table(null, options);
		tbl.addData(data);
		tbl.print();
		expect(writeSpy.length).toEqual(1);
		expect(writeSpy[0]).toEqual(`  ┌─────────┬──────────┐
  │  p1     │  p2      │
  └─────────┴──────────┘
     first     second  
               new     
`);
		tbl.addRow(['this', 'that', , 'd']);
		tbl.print();
		expect(writeSpy.length).toEqual(2);
		expect(writeSpy[1]).toEqual(`  ┌─────────┬──────────┐
  │  p1     │  p2      │
  └─────────┴──────────┘
     first     second  
               new     
     this      that    
`);
	});

	test('data within data', () => {
		// simple solution
		let data = [[[{ p1: 1, p2: 1 }]]];

		let tbl = new Table(data);
		expect(tbl.value).toBe(
			'  ┌─────────╥──────────┐\n  │  col-0  ║  p1 ║ 1  │\n  │         ║  p2 ║ 1  │\n  └─────────╨──────────┘',
		);

		// with no borders inside
		data = [[[{ p1: 1, p2: 1 }]]];

		tbl = new Table(data, [{}, { borders: false }]);
		expect(tbl.value).toBe(
			'  ┌─────────╥─────────┐\n  │  col-0  ║  p1  1  │\n  │         ║  p2  1  │\n  └─────────╨─────────┘',
		);

		data = [
			[
				[
					{ p1: 1, p2: 1 },
					{ p1: 2, p2: 2 },
				],
			],
		];

		tbl = new Table(data);
		expect(tbl.value).toBe(
			'  ┌─────────╥───────────┐\n  │  col-0  ║  p1 │ p2  │\n  │         ║  ═══╪═══  │\n  │         ║  1  │ 1   │\n  │         ║  2  │ 2   │\n  └─────────╨───────────┘',
		);

		tbl.addRow([1]);
		expect(tbl.value).toBe(
			'  ┌───────────┐\n  │  col-0    │\n  ╞═══════════╡\n  │  p1 │ p2  │\n  │  ═══╪═══  │\n  │  1  │ 1   │\n  │  2  │ 2   │\n  ├───────────┤\n  │  1        │\n  └───────────┘',
		);
	});
});

describe('streaming data', () => {
	beforeAll(() => {
		clean();
	});
	afterEach(() => {
		clean();
	});
	test('simple streaming data', async () => {
		expect.assertions(14);
		const data = [['first', 'second']];
		const options: Options = {
			columns: ['p1', 'p2'],
			canGrow: false,
			stream: true,
		};

		const tbl = new Table(null, options);
		await tbl.stream(data);
		expect(writeSpy.length).toBe(1);
		expect(writeSpy[0]).toEqual(`  ┌──────╥──────────┐
  │  p1  ║  first   │
  ├──────╫──────────┤
  │  p2  ║  second  │
  └──────╨──────────┘`);
		expect(move().length).toEqual(0);
		expect(clearScreenSpy()).toEqual(0);
		clean();
		await tbl.stream({ p1: 'p1Val', p2: 'p2Val' });
		expect(writeSpy.length).toBe(1);
		expect(writeSpy[0]).toEqual(`  ┌─────────┬──────────┐
  │  p1     │  p2      │
  ╞═════════╪══════════╡
  │  first  │  second  │
  ├─────────┼──────────┤
  │  p1Val  │  p2Val   │
  └─────────┴──────────┘`);
		expect(move().length).toEqual(1);
		// lines = (rows (FIRST PRINT = 5) - 1) negative, (left = maxData(120) + 10) negative
		expect(move()[0]).toMatchObject({ left: -130, lines: -4 });
		expect(clearScreenSpy()).toEqual(1);
		clean();
		// console.log('\n---\n\n\n');
		await tbl.stream({ p1: 'p1V2', p2: 'p2V2' });
		expect(writeSpy.length).toBe(1);
		expect(writeSpy[0]).toEqual(`  ├─────────┼──────────┤
  │  p1V2   │  p2V2    │
  └─────────┴──────────┘`);
		expect(move().length).toEqual(1);
		// lines = (rows (only last column = 1) - 1) negative, (left = maxData(120) + 10) negative
		expect(move()[0]).toMatchObject({ left: -130, lines: -0 });
		expect(clearScreenSpy()).toEqual(1);
	});
	test('without borders', async () => {
		expect.assertions(8);
		const data = [['first', 'second'], { p1: 'p1Val', p2: 'p2Val' }];
		const options: Options = {
			columns: ['p1', 'p2'],
			canGrow: false,
			stream: true,
			borders: false,
			print: true,
		};

		const tbl = new Table(data, options);
		expect(writeSpy.length).toBe(1);
		expect(writeSpy[0]).toEqual(
			'    p1       p2      \n    first    second  \n    p1Val    p2Val   \n',
		);
		expect(move().length).toEqual(0);
		expect(clearScreenSpy()).toEqual(0);
		clean();
		// console.log('\n---\n\n\n');
		await tbl.stream({ p1: 'p1V2', p2: 'p2V2' });
		expect(writeSpy.length).toBe(1);
		expect(writeSpy[0]).toEqual('    p1V2     p2V2    \n');
		// no need to move - there are no lines to remove.
		expect(move().length).toEqual(0);
		expect(clearScreenSpy()).toEqual(0);
	});

	test('streaming followed by value call', async () => {
		expect.assertions(5);
		const data = ['sml', 'somebig', 'sm'];
		let tbl = new Table(data, { columnPattern: false, stream: true });
		expect(tbl.value).toBe(
			'  ┌───────────┐\n  │  0        │\n  ╞═══════════╡\n  │  sml      │\n  ├───────────┤\n  │  somebig  │\n  ├───────────┤\n  │  sm       │\n  └───────────┘',
		);

		await tbl.stream('sml2');
		expect(writeSpy.length).toBe(1);
		expect(writeSpy[0]).toEqual(
			'  ┌───────────┐\n  │  0        │\n  ╞═══════════╡\n  │  sml      │\n  ├───────────┤\n  │  somebig  │\n  ├───────────┤\n  │  sm       │\n  ├───────────┤\n  │  sml2     │\n  └───────────┘',
		);
		// no need to move - there are no lines to remove.
		expect(move().length).toEqual(0);
		expect(tbl.value).toBe(
			'  ┌───────────┐\n  │  0        │\n  ╞═══════════╡\n  │  sml      │\n  ├───────────┤\n  │  somebig  │\n  ├───────────┤\n  │  sm       │\n  ├───────────┤\n  │  sml2     │\n  └───────────┘',
		);
	});
});

describe('deleting data', () => {
	test('deleting', () => {
		const data = [1, 2, 3, 4, 5];
		const options: Options = {
			columns: { name: 'C' },
			borders: BorderTypes.singleTop,
		};
		const tbl = new Table(data, options);
		expect(tbl.value).toEqual(
			'  ┌─────┐\n  │  C  │\n  └─────┘\n     1  \n     2  \n     3  \n     4  \n     5  \n',
		);
		expect(tbl.value).toEqual(
			'  ┌─────┐\n  │  C  │\n  └─────┘\n     1  \n     2  \n     3  \n     4  \n     5  \n',
		);
		tbl.deleteRow(2);
		expect(tbl.value).toEqual(
			'  ┌─────┐\n  │  C  │\n  └─────┘\n     1  \n     2  \n     4  \n     5  \n',
		);
		tbl.addRow(6);
		tbl.deleteRow(3);
		expect(tbl.value).toEqual(
			'  ┌─────┐\n  │  C  │\n  └─────┘\n     1  \n     2  \n     4  \n     6  \n',
		);
		// nothing should happen here.
		tbl.deleteRow(10);
		tbl.deleteRow(-1);
		expect(tbl.value).toEqual(
			'  ┌─────┐\n  │  C  │\n  └─────┘\n     1  \n     2  \n     4  \n     6  \n',
		);
		tbl.addData(['a', 'b', 'c']);
		tbl.deleteRow(5);
		expect(tbl.value).toEqual(
			'  ┌─────┐\n  │  C  │\n  └─────┘\n     1  \n     2  \n     4  \n     6  \n     a  \n     c  \n',
		);
	});
});

describe('testing borders', () => {
	test('bold', () => {
		// all lines are bold
		const data = { col: 'dat' };
		const options: Options = {
			borders: BorderTypes.bold,
		};
		const tbl = new Table(data, options);
		expect(tbl.value).toEqual('  ┏━━━━━━━┳━━━━━━━┓\n  ┃  col  ┃  dat  ┃\n  ┗━━━━━━━┻━━━━━━━┛');
	});

	test('boldsingle', () => {
		// Header and content has bold outside lines, single inside
		const data = { col: 'dat', cl2: 2 };
		const options: Options = {
			borders: BorderTypes.boldSingle,
		};
		const tbl = new Table(data, options);
		expect(tbl.value).toEqual(
			'  ┏━━━━━━━┳━━━━━━━┓\n  ┃  col  ┃  dat  ┃\n  ┠───────╂───────┨\n  ┃  cl2  ┃  2    ┃\n  ┗━━━━━━━┻━━━━━━━┛',
		);
		tbl.addData({ col: 'dt2', cl2: 3 });
		expect(tbl.value).toEqual(
			'  ┏━━━━━━━┯━━━━━━━┓\n  ┃  col  │  cl2  ┃\n  ┣━━━━━━━┿━━━━━━━┫\n  ┃  dat  │  2    ┃\n  ┠───────┼───────┨\n  ┃  dt2  │  3    ┃\n  ┗━━━━━━━┷━━━━━━━┛',
		);
	});
	test('boldSingleTop', () => {
		// Header: bold with single lines.  Content: no borders
		const data = { col: 'dat', cl2: 2 };
		const options: Options = {
			borders: BorderTypes.boldSingleTop,
		};
		const tbl = new Table(data, options);
		expect(tbl.value).toEqual(
			'  ┏━━━━━━━┓        \n  ┃  col  ┃  dat  \n  ┠───────┨        \n  ┃  cl2  ┃  2    \n  ┗━━━━━━━┛        ',
		);
		tbl.addData({ col: 'dt2', cl2: 3 });
		expect(tbl.value).toEqual(
			'  ┏━━━━━━━┯━━━━━━━┓\n  ┃  col  │  cl2  ┃\n  ┗━━━━━━━┷━━━━━━━┛\n     dat     2    \n     dt2     3    \n',
		);
	});
	test('boldTop', () => {
		// Header: all bold.  Content: no borders
		const data = { col: 'dat', cl2: 2 };
		const options: Options = {
			borders: BorderTypes.boldTop,
		};
		const tbl = new Table(data, options);
		expect(tbl.value).toEqual(
			'  ┏━━━━━━━┓        \n  ┃  col  ┃  dat  \n  ┣━━━━━━━┫        \n  ┃  cl2  ┃  2    \n  ┗━━━━━━━┛        ',
		);
		tbl.addData({ col: 'dt2', cl2: 3 });
		expect(tbl.value).toEqual(
			'  ┏━━━━━━━┳━━━━━━━┓\n  ┃  col  ┃  cl2  ┃\n  ┗━━━━━━━┻━━━━━━━┛\n     dat     2    \n     dt2     3    \n',
		);
	});
	test('boldTopSingle', () => {
		// Header: all bold.  Content: all single
		const data = { col: 'dat', cl2: 2 };
		const options: Options = {
			borders: BorderTypes.boldTopSingle,
		};
		const tbl = new Table(data, options);
		expect(tbl.value).toEqual(
			'  ┏━━━━━━━┳───────┐\n  ┃  col  ┃  dat  │\n  ┣━━━━━━━╋───────┤\n  ┃  cl2  ┃  2    │\n  ┗━━━━━━━┻───────┘',
		);
		tbl.addData({ col: 'dt2', cl2: 3 });
		expect(tbl.value).toEqual(
			'  ┏━━━━━━━┳━━━━━━━┓\n  ┃  col  ┃  cl2  ┃\n  ┡━━━━━━━╇━━━━━━━┩\n  │  dat  │  2    │\n  ├───────┼───────┤\n  │  dt2  │  3    │\n  └───────┴───────┘',
		);
	});
	test('single', () => {
		// Header: all single.  Content: all single
		const data = { col: 'dat', cl2: 2 };
		const options: Options = {
			borders: BorderTypes.single,
		};
		const tbl = new Table(data, options);
		expect(tbl.value).toEqual(
			'  ┌───────┬───────┐\n  │  col  │  dat  │\n  ├───────┼───────┤\n  │  cl2  │  2    │\n  └───────┴───────┘',
		);
		tbl.addData({ col: 'dt2', cl2: 3 });
		expect(tbl.value).toEqual(
			'  ┌───────┬───────┐\n  │  col  │  cl2  │\n  ├───────┼───────┤\n  │  dat  │  2    │\n  ├───────┼───────┤\n  │  dt2  │  3    │\n  └───────┴───────┘',
		);
	});
	test('singleTop', () => {
		// Header: single lines.  Content: none
		const data = { col: 'dat', cl2: 2 };
		const options: Options = {
			borders: BorderTypes.singleTop,
		};
		const tbl = new Table(data, options);
		expect(tbl.value).toEqual(
			'  ┌───────┐        \n  │  col  │  dat  \n  ├───────┤        \n  │  cl2  │  2    \n  └───────┘        ',
		);
		tbl.addData({ col: 'dt2', cl2: 3 });
		expect(tbl.value).toEqual(
			'  ┌───────┬───────┐\n  │  col  │  cl2  │\n  └───────┴───────┘\n     dat     2    \n     dt2     3    \n',
		);
	});

	test('combinedBorders all 3', () => {
		const data = { col: 'dat', cl2: 2 };
		const options: Options = {
			borders: {
				header: { ...templates.single },
				content: { ...templates.single },
				headPure: { ...templates.single },
			},
		};
		const tbl = new Table(data, options);
		expect(tbl.value).toEqual(
			'  ┌───────┬───────┐\n  │  col  │  dat  │\n  ├───────┼───────┤\n  │  cl2  │  2    │\n  └───────┴───────┘',
		);
		tbl.addData({ col: 'dt2', cl2: 3 });
		expect(tbl.value).toEqual(
			'  ┌───────┬───────┐\n  │  col  │  cl2  │\n  ├───────┼───────┤\n  │  dat  │  2    │\n  ├───────┼───────┤\n  │  dt2  │  3    │\n  └───────┴───────┘',
		);
	});

	test('combinedBorders all only content', () => {
		const data = { col: 'dat', cl2: 2 };
		const options: Options = {
			borders: {
				header: false,
				content: { ...templates.single },
			},
		};
		const tbl = new Table(data, options);
		expect(tbl.value).toEqual(
			'          ┬───────┐\n     col  │  dat  │\n          ┼───────┤\n     cl2  │  2    │\n          ┴───────┘',
		);
		tbl.addData({ col: 'dt2', cl2: 3 });
		expect(tbl.value).toEqual(
			'     col     cl2  \n  ┌───────┬───────┐\n  │  dat  │  2    │\n  ├───────┼───────┤\n  │  dt2  │  3    │\n  └───────┴───────┘',
		);
	});

	test('testing arrays all', () => {
		const data = { col: 'dat', cl2: 2 };
		const options: Options = {
			borders: [{ ...templates.single }, { ...templates.single }, { ...templates.single }],
		};
		const tbl = new Table(data, options);
		expect(tbl.value).toEqual(
			'  ┌───────┬───────┐\n  │  col  │  dat  │\n  ├───────┼───────┤\n  │  cl2  │  2    │\n  └───────┴───────┘',
		);
		tbl.addData({ col: 'dt2', cl2: 3 });
		expect(tbl.value).toEqual(
			'  ┌───────┬───────┐\n  │  col  │  cl2  │\n  ├───────┼───────┤\n  │  dat  │  2    │\n  ├───────┼───────┤\n  │  dt2  │  3    │\n  └───────┴───────┘',
		);
	});

	test('arrays only content', () => {
		const data = { col: 'dat', cl2: 2 };
		const options: Options = {
			borders: [, { ...templates.single }],
		};
		const tbl = new Table(data, options);
		expect(tbl.value).toEqual(
			'          ┬───────┐\n     col  │  dat  │\n          ┼───────┤\n     cl2  │  2    │\n          ┴───────┘',
		);
		tbl.addData({ col: 'dt2', cl2: 3 });
		expect(tbl.value).toEqual(
			'     col     cl2  \n  ┌───────┬───────┐\n  │  dat  │  2    │\n  ├───────┼───────┤\n  │  dt2  │  3    │\n  └───────┴───────┘',
		);
	});

	test('arrays only header', () => {
		const data = { col: 'dat', cl2: 2 };
		const options: Options = {
			borders: [{ ...templates.single }],
		};
		const tbl = new Table(data, options);
		expect(tbl.value).toEqual(
			'  ┌───────┬        \n  │  col  │  dat  \n  ├───────┼        \n  │  cl2  │  2    \n  └───────┴        ',
		);
		tbl.addData({ col: 'dt2', cl2: 3 });
		expect(tbl.value).toEqual(
			'  ┌───────┬───────┐\n  │  col  │  cl2  │\n  └───────┴───────┘\n     dat     2    \n     dt2     3    \n',
		);
	});

	test('boksOptions', () => {
		const data = { col: 'dat', cl2: 2 };
		const options: Options = {
			borders: templates.single,
		};
		const tbl = new Table(data, options);
		expect(tbl.value).toEqual(
			'  ┌───────┬───────┐\n  │  col  │  dat  │\n  ├───────┼───────┤\n  │  cl2  │  2    │\n  └───────┴───────┘',
		);
		tbl.addData({ col: 'dt2', cl2: 3 });
		expect(tbl.value).toEqual(
			'  ┌───────┬───────┐\n  │  col  │  cl2  │\n  ├───────┼───────┤\n  │  dat  │  2    │\n  ├───────┼───────┤\n  │  dt2  │  3    │\n  └───────┴───────┘',
		);
	});

	test('no borders', () => {
		const data = { col: 'dat', cl2: 2 };
		const options: Options = {
			borders: false,
		};
		const tbl = new Table(data, options);
		expect(tbl.value).toEqual('    col    dat  \n    cl2    2    \n');
		tbl.addData({ col: 'dt2', cl2: 3 });
		expect(tbl.value).toEqual('    col    cl2  \n    dat    2    \n    dt2    3    \n');
	});

	test('unknown options', () => {
		const data = { col: 'dat', cl2: 2 };
		const options: Options = {
			borders: 'unknown' as any,
		};
		const tbl = new Table(data, options);
		expect(tbl.value).toEqual('    col    dat  \n    cl2    2    \n');
		tbl.addData({ col: 'dt2', cl2: 3 });
		expect(tbl.value).toEqual('    col    cl2  \n    dat    2    \n    dt2    3    \n');
	});
});

describe('options', () => {
	test('Options as array including column info', () => {
		const options: Options[] = [
			{
				align: Alignment.center,
				headAlign: Alignment.right,
				maxSize: 40,
				// fixes the name for each column
				columns: ['col-1', 'this', 'ok'],
			},
			{
				// gives the sorting order for each column
				columns: [3, 1, 2],
			},
		];
		const data = [['d11', { c1: 'c11', c2: 'c12', c3: 'c13' }, 'd13']];

		// alignment (like all properties) are inherited
		const tbl = new Table(data, options);
		expect(tbl.value).toEqual(`  ┌─────────╥───────────────┐
  │  col-1  ║      d11      │
  ├─────────╫───────────────┤
  │   this  ║     c2 ║ c12  │
  │         ║     c3 ║ c13  │
  │         ║     c1 ║ c11  │
  ├─────────╫───────────────┤
  │     ok  ║      d13      │
  └─────────╨───────────────┘`);
	});

	test('column options, no data start', () => {
		const options: Options = { columns: ['col1'] };

		let tbl = new Table(null, options);
		expect(tbl.value).toBe('');

		tbl.addRow(['1', '2']);
		expect(tbl.value).toBe('  ┌────────╥─────┐\n  │  col1  ║  1  │\n  └────────╨─────┘');
	});

	test('column options, mixed Array', () => {
		const data = ['sml', ['somebig', 'sm', 'final']];
		let tbl = new Table(data, { canGrow: true, columns: [{ name: 'c2', order: 2 }, 3] as any });
		expect(tbl.value).toBe(
			'  ┌─────────┬───────────┬─────────┐\n  │  col-2  │  c2       │  col-1  │\n  ╞═════════╪═══════════╪═════════╡\n  │         │  sml      │         │\n  ├─────────┼───────────┼─────────┤\n  │  final  │  somebig  │  sm     │\n  └─────────┴───────────┴─────────┘',
		);
	});

	test('column strange object', () => {
		const data = ['sml', ['somebig', 'sm', 'final']];
		// no ordered items comes first always, then ordered numbers
		const tbl = new Table(data, { columns: { c1: false, c2: 1, c3: true } });
		expect(tbl.value).toBe(
			'  ┌─────────┬──────┐\n  │  c3     │  c2  │\n  ╞═════════╪══════╡\n  │  final  │  sm  │\n  └─────────┴──────┘',
		);
	});

	test('columns limited size', () => {
		const data = [
			[1, 2],
			[3, 4],
		];
		const options = {
			columns: [
				{ name: 'c1', size: 2 },
				{ name: 'large name', size: 6 },
			],
		};

		const tbl = new Table(data, options);
		expect(tbl.value).toBe(
			'  ┌──────┬──────────┐\n  │  c1  │  large   │\n  │      │  name    │\n  ╞══════╪══════════╡\n  │  1   │  2       │\n  ├──────┼──────────┤\n  │  3   │  4       │\n  └──────┴──────────┘',
		);
	});

	test('columProperties object with size limites', () => {
		const options: Options = {
			columns: {
				c1: {
					name: 'c1',
					size: 2,
				},
				c2: {
					name: 'c2',
					minSize: 3,
					order: 5,
				},
				c3: {
					name: 'c3',
					maxSize: 5,
				},
			},
			// only allow for columns specified to be included
			canGrow: false,
		};
		const data = [['bigger', 'sm', 'biggest']];
		const tbl = new Table(data, options);
		// should ignore max / min Column sizing and only account for table sizes.
		expect(tbl.value).toBe(
			'  ┌──────╥───────────┐\n  │  c1  ║  bigger   │\n  ├──────╫───────────┤\n  │  c3  ║  biggest  │\n  ├──────╫───────────┤\n  │  c2  ║  sm       │\n  └──────╨───────────┘',
		);
		// should include column sizing if flat
		tbl.addRow([1, 2, 3]);
		expect(tbl.value).toBe(
			'  ┌──────┬─────────┬───────┐\n  │  c1  │  c3     │  c2   │\n  ╞══════╪═════════╪═══════╡\n  │  bi  │  bigge  │  sm   │\n  │  gg  │  st     │       │\n  │  er  │         │       │\n  ├──────┼─────────┼───────┤\n  │  1   │  3      │  2    │\n  └──────┴─────────┴───────┘',
		);
	});

	test('same as above, calling value at end only', () => {
		const options: Options = {
			columns: {
				c1: {
					name: 'c1',
					size: 2,
				},
				c2: {
					name: 'c2',
					minSize: 3,
					order: 5,
				},
				c3: {
					name: 'c3',
					maxSize: 5,
				},
			},
			// only allow for columns specified to be included
			canGrow: false,
		};
		const data = [['bigger', 'sm', 'biggest']];
		const tbl = new Table(data, options);
		tbl.addRow([1, 2, 3]);
		expect(tbl.value).toBe(
			'  ┌──────┬─────────┬───────┐\n  │  c1  │  c3     │  c2   │\n  ╞══════╪═════════╪═══════╡\n  │  bi  │  bigge  │  sm   │\n  │  gg  │  st     │       │\n  │  er  │         │       │\n  ├──────┼─────────┼───────┤\n  │  1   │  3      │  2    │\n  └──────┴─────────┴───────┘',
		);
	});

	test('inherited options & fals next option', () => {
		const data = { col1: 'c1', col2: { deep: 1, d1c2: { deep: 2, d2c2: 'final' } } };

		let options: (Options | false)[] = [{ excludeHeader: true }];
		// normal test
		let tbl = new Table(data, options as any);

		// todo: fix size when header is false
		// at moment all values are pushed left, but size remains as if they are not.
		expect(tbl.value).toBe(
			'  ┌───────────────────────┐\n  │  c1                   │\n  ├───────────────────────┤\n  │  1                    │\n  │  2                    │\n  │  final                │\n  └───────────────────────┘',
		);
		// and with multiple items
		tbl.addRow(['1', '2']);
		expect(tbl.value).toBe(
			'  ┌────────┬───────────────────────┐\n  │  c1    │  1                    │\n  │        │  2                    │\n  │        │  final                │\n  ├────────┼───────────────────────┤\n  │  1     │  2                    │\n  └────────┴───────────────────────┘',
		);

		// test ordinary 'false; option => absolute defaults is forced
		options = [{ excludeHeader: true }, false];
		tbl = new Table(data, options as any);
		expect(tbl.value).toBe(
			'  ┌─────────────────────────┐\n  │  c1                     │\n  ├─────────────────────────┤\n  │  deep  ║  1             │\n  │  ──────╫──────────────  │\n  │  d1c2  ║  deep ║ 2      │\n  │        ║  d2c2 ║ final  │\n  └─────────────────────────┘',
		);

		// remove borders... false options replaces them, remove it again
		options = [{ excludeHeader: true, borders: false }, false, { borders: false }];
		tbl = new Table(data, options as any);
		tbl.addRow(['1', '2']);
		expect(tbl.value).toBe(
			'    c1      deep  ║  1            \n            ──────╫─────────────  \n            d1c2  ║  deep  2      \n                  ║  d2c2  final  \n    1       2                     \n',
		);
	});

	test('columnPatern options', () => {
		const data = [['dat', 'dat2']];

		const options: Options = { columnPattern: false };

		let tbl = new Table(data, options);
		expect(tbl.value).toBe(
			'  ┌─────╥────────┐\n  │  0  ║  dat   │\n  ├─────╫────────┤\n  │  1  ║  dat2  │\n  └─────╨────────┘',
		);

		options.columnPattern = true;

		tbl = new Table(data, options);
		expect(tbl.value).toBe(
			'  ┌─────────╥────────┐\n  │  col-0  ║  dat   │\n  ├─────────╫────────┤\n  │  col-1  ║  dat2  │\n  └─────────╨────────┘',
		);

		options.columnPattern = 'somePat';

		tbl = new Table(data, options);
		expect(tbl.value).toBe(
			'  ┌────────────╥────────┐\n  │  somePat0  ║  dat   │\n  ├────────────╫────────┤\n  │  somePat1  ║  dat2  │\n  └────────────╨────────┘',
		);

		options.columnPattern = '';

		tbl = new Table(data, options);
		expect(tbl.value).toBe(
			'  ┌─────────╥────────┐\n  │  col-0  ║  dat   │\n  ├─────────╫────────┤\n  │  col-1  ║  dat2  │\n  └─────────╨────────┘',
		);

		options.columnPattern = '| ~D |';

		tbl = new Table(data, options);
		expect(tbl.value).toBe(
			'  ┌─────────╥────────┐\n  │  | 0 |  ║  dat   │\n  ├─────────╫────────┤\n  │  | 1 |  ║  dat2  │\n  └─────────╨────────┘',
		);
	});

	test('maxSize', () => {
		let obj = new Table(['some', 'data'], { fill: true, maxSize: 20 });

		expect(obj.size).toBe(13);
		obj.size = 25;
		expect(obj.size).toBe(20);
	});

	test('fill options', () => {
		const data = [
			[1, 2],
			[3, 4],
		];
		let options: Options = {
			columns: [
				{ name: 'c1', size: 2 },
				{ name: 'large name', size: 0.5 },
			],
		};

		// the size of 2nd column will be pushed wrap text only
		let tbl = new Table(data, options);
		expect(tbl.value).toBe(
			'  ┌──────┬──────────────┐\n  │  c1  │  large name  │\n  ╞══════╪══════════════╡\n  │  1   │  2           │\n  ├──────┼──────────────┤\n  │  3   │  4           │\n  └──────┴──────────────┘',
		);

		// this should have no differenct
		options.fill = false;

		tbl = new Table(data, options);
		expect(tbl.value).toBe(
			'  ┌──────┬──────────────┐\n  │  c1  │  large name  │\n  ╞══════╪══════════════╡\n  │  1   │  2           │\n  ├──────┼──────────────┤\n  │  3   │  4           │\n  └──────┴──────────────┘',
		);

		// should fill all available table space 120 by default. if it can
		// in this case data 2 is limited by setting a size of 2
		options.fill = true;
		tbl = new Table(data, options);

		expect(tbl.value).toBe(
			'  ┌──────┬─────────────────────────────────────────────────────────┐\n  │  c1  │  large name                                             │\n  ╞══════╪═════════════════════════════════════════════════════════╡\n  │  1   │  2                                                      │\n  ├──────┼─────────────────────────────────────────────────────────┤\n  │  3   │  4                                                      │\n  └──────┴─────────────────────────────────────────────────────────┘',
		);

		// removing first column restriction will push full space.
		options = {
			columns: [{ name: 'c1' }, { name: 'large name', size: 0.5 }],
			fill: true,
		};
		tbl = new Table(data, options);
		expect(tbl.value).toBe(
			'  ┌─────────────────────────────────────────────────────────┬─────────────────────────────────────────────────────────┐\n  │  c1                                                     │  large name                                             │\n  ╞═════════════════════════════════════════════════════════╪═════════════════════════════════════════════════════════╡\n  │  1                                                      │  2                                                      │\n  ├─────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────┤\n  │  3                                                      │  4                                                      │\n  └─────────────────────────────────────────────────────────┴─────────────────────────────────────────────────────────┘',
		);
		expect(tbl.lines[0].length).toBe(119);

		// the size of the table will determine to what extend content will be filled.
		options = {
			columns: [{ name: 'c1as' }, { name: 'large name', size: 0.5 }],
			fill: true,
			maxSize: 18,
		};

		tbl = new Table(data, options);
		expect(tbl.value).toBe(
			'  ┌───────┬───────┐\n  │  c1a  │  lar  │\n  │  s    │  ge   │\n  │       │  nam  │\n  │       │  e    │\n  ╞═══════╪═══════╡\n  │  1    │  2    │\n  ├───────┼───────┤\n  │  3    │  4    │\n  └───────┴───────┘',
		);
		expect(tbl.lines[0].length).toBe(19);
	});

	test('inclusive option', () => {
		// adds columns with no data.  default is false
		// default:
		let data = [[1], [2]];
		let options: Options = {
			columns: {
				col1: true,
				col2: true,
			},
		};

		let obj = new Table(data, options);
		expect(obj.value).toBe(
			'  ┌────────┐\n  │  col1  │\n  ╞════════╡\n  │  1     │\n  ├────────┤\n  │  2     │\n  └────────┘',
		);

		// with inclusive
		options.inclusive = true;
		obj = new Table(data, options);
		expect(obj.value).toBe(
			'  ┌────────┬────────┐\n  │  col1  │  col2  │\n  ╞════════╪════════╡\n  │  1     │        │\n  ├────────┼────────┤\n  │  2     │        │\n  └────────┴────────┘',
		);
	});
});
