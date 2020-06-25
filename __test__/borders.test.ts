import { getBorder } from '../src/lib/borders';
import {
	bold,
	single,
	boldSingle,
	double,
	doubleSingle,
	round,
	empty,
	singleBold,
	singleDouble,
	// eslint-disable-next-line object-curly-newline
} from '../src/objects/borderTemplates';
import {
	BorderTypes,
	CombinedBorders,
	BorderSettings,
	BordersExtended,
} from '../src/objects/options';
import {
	LeftIntersect,
	BottomLeftBorder,
	Intersect,
	RightIntersect,
	HorizontalLines,
	VerticalLines,
	BottomIntersect,
	getIntersections,
	TopLeftBorder,
	TopRightBorder,
} from '../src/objects/borderShapes';
import { connect } from 'http2';

test('get single borders back if no parameters is sent', () => {
	const result = getBorder();
	const hr: BordersExtended = { ...single };
	hr.bottomLeft = LeftIntersect.line;
	hr.bottomIntersect = Intersect.line;
	hr.bottomRight = RightIntersect.line;
	expect(result).toEqual({ content: single, header: hr });
});
test('get border by type -> single | bold', () => {
	let borderConfig = { content: BorderTypes.single, header: BorderTypes.bold };
	let result = getBorder({ borderConfig }) as CombinedBorders;
	let hR: BordersExtended = { ...bold };
	hR.bottomLeft = LeftIntersect.lightBottom;
	hR.bottomIntersect = Intersect.lightBottom;
	hR.bottomRight = RightIntersect.lightBottom;
	expect(result.content).toEqual(single);
	expect(result.header).toEqual(hR);

	borderConfig = { content: BorderTypes.bold, header: BorderTypes.single };
	result = getBorder({ borderConfig }) as CombinedBorders;
	hR = { ...single };
	hR.bottomLeft = LeftIntersect.boldBottom;
	hR.bottomIntersect = Intersect.bottom;
	hR.bottomRight = RightIntersect.boldBottom;
	expect(result.content).toEqual(bold);
	expect(result.header).toEqual(hR);
});
test('get border by type -> double | single', () => {
	let borderConfig = { content: BorderTypes.double, header: BorderTypes.single };
	let result = getBorder({ borderConfig }) as CombinedBorders;
	let hR: BordersExtended = { ...single };
	hR.bottomLeft = LeftIntersect.singleDouble;
	hR.bottomIntersect = Intersect.singleDouble;
	hR.bottomRight = RightIntersect.singleDouble;
	expect(result.content).toEqual(double);
	expect(result.header).toEqual(hR);

	borderConfig = { content: BorderTypes.single, header: BorderTypes.double };
	result = getBorder({ borderConfig }) as CombinedBorders;
	hR = { ...double };
	hR.bottomLeft = LeftIntersect.double;
	hR.bottomIntersect = Intersect.double;
	hR.bottomRight = RightIntersect.double;
	expect(result.content).toEqual(single);
	expect(result.header).toEqual(hR);
});

test('get border by type -> double | bold', () => {
	let borderConfig = { content: BorderTypes.double, header: BorderTypes.bold };
	let result = getBorder({ borderConfig }) as CombinedBorders;
	let hR: BordersExtended = { ...bold };
	hR.bottomLeft = LeftIntersect.bold;
	hR.bottomIntersect = Intersect.lightBottom;
	hR.bottomRight = RightIntersect.bold;
	expect(result.content).toEqual(double);
	expect(result.header).toEqual(hR);

	borderConfig = { content: BorderTypes.bold, header: BorderTypes.double };
	result = getBorder({ borderConfig }) as CombinedBorders;
	hR = { ...double };
	hR.bottomLeft = LeftIntersect.double;
	hR.bottomIntersect = Intersect.double;
	hR.bottomRight = RightIntersect.double;
	expect(result.content).toEqual(bold);
	expect(result.header).toEqual(hR);
});

test('get border by type -> boldSingle | singleBold', () => {
	let borderConfig = { content: BorderTypes.singleBold, header: BorderTypes.boldSingle };
	let result = getBorder({ borderConfig }) as CombinedBorders;
	expect(result.content).toEqual(singleBold);
	let hr: BordersExtended = { ...boldSingle };
	hr.bottomLeft = LeftIntersect.lightTop;
	hr.bottomIntersect = Intersect.lightTop;
	hr.bottomRight = RightIntersect.lightTop;
	expect(result.header).toEqual(hr);
});

test('get border by type -> singleDouble | doubleSingle', () => {
	let borderConfig = { content: BorderTypes.singleDouble, header: BorderTypes.doubleSingle };
	let result = getBorder({ borderConfig }) as CombinedBorders;
	expect(result.content).toEqual(singleDouble);
	let hr: BordersExtended = { ...doubleSingle };
	hr.bottomLeft = LeftIntersect.double;
	hr.bottomIntersect = Intersect.double;
	hr.bottomRight = RightIntersect.double;
	expect(result.header).toEqual(hr);
});

test('get border by type -> none', () => {
	let borderConfig = { content: BorderTypes.none, header: false };
	let result = getBorder({ borderConfig }) as CombinedBorders;
	let cn: BordersExtended = { ...empty };
	cn.left = false;
	cn.right = false;
	cn.bottom = false;
	cn.top = false;
	expect(result.content).toEqual(cn);
});

test('get border by type -> quadDash | dash', () => {
	let borderConfig: BorderSettings = {
		content: {
			horizontal: HorizontalLines.quadDash,
			vertical: VerticalLines.dash,
		},
		header: {
			horizontal: HorizontalLines.dash,
			vertical: VerticalLines.quadDash,
		},
	};
	let result = getBorder({ borderConfig }) as CombinedBorders;
	let hR: BordersExtended = { ...single };
	let cn: BordersExtended = { ...single };
	hR.vertical = VerticalLines.quadDash;
	hR.horizontal = HorizontalLines.dash;
	hR.bottomIntersect = Intersect.line;
	hR.bottomLeft = LeftIntersect.line;
	hR.bottomRight = RightIntersect.line;
	cn.vertical = VerticalLines.dash;
	cn.horizontal = HorizontalLines.quadDash;
	expect(result.content).toEqual(cn);
	expect(result.header).toEqual(hR);

	borderConfig = {
		content: {
			horizontal: HorizontalLines.quadDashBold,
			vertical: VerticalLines.dashBold,
		},
		header: {
			horizontal: HorizontalLines.dashBold,
			vertical: VerticalLines.quadDashBold,
		},
	};
	result = getBorder({ borderConfig }) as CombinedBorders;
	hR = { ...single };
	cn = { ...single };
	hR.vertical = VerticalLines.quadDashBold;
	hR.horizontal = HorizontalLines.dashBold;
	hR.bottomLeft = LeftIntersect.line;
	hR.bottomIntersect = Intersect.singleBold;
	hR.bottomRight = RightIntersect.line;
	cn.vertical = VerticalLines.dashBold;
	cn.horizontal = HorizontalLines.quadDashBold;
	expect(result.content).toEqual(cn);
	expect(result.header).toEqual(hR);
});

test('get borders by way of boolean value (borderconfig)', () => {
	let result = getBorder({ borderConfig: false });
	expect(result).toEqual(false);

	result = getBorder({ borderConfig: true });
	let hr: BordersExtended = { ...single };
	hr.bottomLeft = LeftIntersect.line;
	hr.bottomIntersect = Intersect.line;
	hr.bottomRight = RightIntersect.line;
	expect(result).toEqual({ content: single, header: hr });
});

test('get borders by way of boolean value (content / header)', () => {
	let borderConfig: BorderSettings = {
		content: false,
		header: true,
	};
	let result = getBorder({ borderConfig }) as CombinedBorders;
	let special: BordersExtended = { ...empty };
	special.bottom = false;
	special.top = false;
	special.left = false;
	special.right = false;
	expect(result.content).toEqual(special);
	expect(result.header).toEqual(single);

	borderConfig.content = true;
	borderConfig.header = false;
	result = getBorder({ borderConfig }) as CombinedBorders;
	expect(result.content).toEqual(single);
	expect(result.header).toEqual(special);

	borderConfig.content = false;
	result = getBorder({ borderConfig }) as any;
	expect(result).toEqual(false);
});

test('options strict && buildTableBorders', () => {
	const borderConfig: BorderSettings = {
		content: {
			vertical: VerticalLines.line,
			strict: true,
			buildTableBorders: true,
		},
		header: {
			horizontal: HorizontalLines.line,
			strict: true,
			buildTableBorders: false,
		},
	};
	let result = getBorder({ borderConfig }) as CombinedBorders;
	const cn: BordersExtended = { ...single };
	cn.intersect = VerticalLines.line;
	cn.strict = true;
	cn.buildTableBorders = true;
	cn.topLeft = VerticalLines.linedown;
	cn.bottomLeft = VerticalLines.lineup;
	cn.topRight = VerticalLines.linedown;
	cn.bottomRight = VerticalLines.lineup;
	cn.topIntersect = VerticalLines.linedown;
	cn.bottomIntersect = VerticalLines.lineup;
	cn.rightIntersect = VerticalLines.line;
	cn.leftIntersect = VerticalLines.line;
	cn.top = HorizontalLines.none;
	cn.bottom = HorizontalLines.none;
	delete cn.horizontal;
	const hr: BordersExtended = { ...empty };
	hr.horizontal = HorizontalLines.line;
	hr.strict = true;
	hr.bottom = false;
	hr.left = false;
	hr.right = false;
	hr.top = false;
	hr.buildTableBorders = false;
	hr.intersect = Intersect.none;
	hr.leftIntersect = LeftIntersect.none;
	hr.rightIntersect = RightIntersect.none;
	delete hr.vertical;
	expect(result.content).toEqual(cn);
	expect(result.header).toEqual(hr);

	borderConfig.header = borderConfig.content;
	borderConfig.content = {
		horizontal: HorizontalLines.line,
		strict: true,
		buildTableBorders: false,
	};
	result = getBorder({ borderConfig }) as CombinedBorders;
	expect(result.content).toEqual(hr);
	expect(result.header).toEqual(cn);
});

test('build borders from horizontal options', () => {
	let borderConfig: BorderSettings = {
		content: {
			horizontal: HorizontalLines.line,
			strict: true,
			buildTableBorders: true,
		},
		header: {
			top: HorizontalLines.line,
			strict: true,
			buildTableBorders: true,
		},
	};
	let result = getBorder({ borderConfig }) as CombinedBorders;
	const hr: BordersExtended = {
		top: HorizontalLines.line,
		strict: true,
		buildTableBorders: true,
		bottom: HorizontalLines.line,
		topLeft: HorizontalLines.lineright,
		topRight: HorizontalLines.lineleft,
		bottomLeft: HorizontalLines.lineright,
		bottomRight: HorizontalLines.lineleft,
		topIntersect: HorizontalLines.line,
		bottomIntersect: HorizontalLines.line,
		leftIntersect: HorizontalLines.none,
		rightIntersect: HorizontalLines.none,
		intersect: HorizontalLines.none,
		right: VerticalLines.none,
		left: VerticalLines.none,
	};
	const cn: BordersExtended = {
		horizontal: HorizontalLines.line,
		strict: true,
		buildTableBorders: true,
		top: HorizontalLines.line,
		bottom: HorizontalLines.line,
		topLeft: HorizontalLines.lineright,
		topRight: HorizontalLines.lineleft,
		bottomLeft: HorizontalLines.lineright,
		bottomRight: HorizontalLines.lineleft,
		topIntersect: HorizontalLines.line,
		bottomIntersect: HorizontalLines.line,
		leftIntersect: HorizontalLines.lineright,
		rightIntersect: HorizontalLines.lineleft,
		intersect: HorizontalLines.line,
		right: VerticalLines.none,
		left: VerticalLines.none,
	};
	expect(result.header).toEqual(hr);
	expect(result.content).toEqual(cn);

	borderConfig = {
		header: BorderTypes.round,
		content: {
			bottom: HorizontalLines.line,
			strict: true,
			buildTableBorders: true,
		},
	};
	result = getBorder({ borderConfig }) as CombinedBorders;
	expect(result.content).toEqual(hr);
	expect((result.header as BordersExtended).topLeft).toEqual(TopLeftBorder.round);
	expect((result.header as BordersExtended).topRight).toEqual(TopRightBorder.round);
});

test('build borders from vertical optiosn', () => {
	let borderConfig: BorderSettings = {
		content: {
			left: VerticalLines.line,
			strict: true,
			buildTableBorders: true,
		},
		header: {
			right: VerticalLines.line,
			strict: true,
			buildTableBorders: true,
		},
	};
	let result = getBorder({ borderConfig }) as CombinedBorders;
	let cn = {
		left: '│',
		strict: true,
		buildTableBorders: true,
		right: '│',
		topLeft: '╷',
		topRight: '╷',
		bottomLeft: '╵',
		bottomRight: '╵',
		topIntersect: '',
		bottomIntersect: '',
		leftIntersect: '│',
		rightIntersect: '│',
		intersect: '',
		top: '',
		bottom: '',
	};
	expect(result.content).toEqual(cn);
	cn.bottomLeft = VerticalLines.line;
	cn.bottomRight = VerticalLines.line;
	expect(result.header).toEqual(cn);
	// console.log(result);
});

test('keep border spacing', () => {
	let borderConfig: BorderSettings = {
		content: {
			left: VerticalLines.none,
			strict: true,
			buildTableBorders: true,
			keepBorderSpace: true,
		},
		header: {
			horizontal: HorizontalLines.none,
			strict: true,
			buildTableBorders: true,
			keepBorderSpace: true,
		},
	};
	let result = getBorder({ borderConfig }) as CombinedBorders;

	const cn = {
		left: ' ',
		strict: true,
		buildTableBorders: true,
		keepBorderSpace: true,
		topLeft: ' ',
		topRight: ' ',
		bottomLeft: ' ',
		bottomRight: ' ',
		topIntersect: ' ',
		bottomIntersect: ' ',
		leftIntersect: ' ',
		rightIntersect: ' ',
		intersect: ' ',
		top: ' ',
		right: ' ',
		bottom: ' ',
	};
	expect(result.content).toEqual(cn);
	(cn as BordersExtended).horizontal = HorizontalLines.none;
	expect(result.header).toEqual(cn);

	(borderConfig.header as BordersExtended).keepBorderSpace = false;
	result = getBorder({ borderConfig }) as CombinedBorders;
	expect(result.header).toEqual(cn);
});
