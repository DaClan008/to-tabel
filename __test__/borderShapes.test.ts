import {
	getIntersections,
	VerticalLines,
	HorizontalLines,
	TopLeftBorder,
	TopRightBorder,
	BottomLeftBorder,
	CornerPositions,
	BottomRightBorder,
	TopIntersect,
	BottomIntersect,
	LeftIntersect,
	RightIntersect,
	Intersect,
} from '../src/objects/borderShapes';

describe('should discover corners', () => {
	describe('TopLeft', () => {
		test('none', () => {
			const border = {
				left: VerticalLines.none,
				top: HorizontalLines.none,
			};
			expect(getIntersections(border, CornerPositions.topLeft)).toEqual(TopLeftBorder.none);
		});
		test('normal', () => {
			let border = {
				left: VerticalLines.line,
				top: HorizontalLines.line,
			};
			expect(getIntersections(border, CornerPositions.topLeft)).toEqual(TopLeftBorder.line);

			border.left = VerticalLines.dash;
			border.top = HorizontalLines.trippleDash;
			expect(getIntersections(border, CornerPositions.topLeft)).toEqual(TopLeftBorder.line);

			border.left = VerticalLines.quadDash;
			border.top = HorizontalLines.quadDash;
			expect(getIntersections(border, CornerPositions.topLeft)).toEqual(TopLeftBorder.line);
		});
		test('bold', () => {
			let border = {
				left: VerticalLines.bold,
				top: HorizontalLines.bold,
			};
			expect(getIntersections(border, CornerPositions.topLeft)).toEqual(TopLeftBorder.bold);

			border.left = VerticalLines.dashBold;
			border.top = HorizontalLines.trippleDashBold;
			expect(getIntersections(border, CornerPositions.topLeft)).toEqual(TopLeftBorder.bold);

			border.left = VerticalLines.quadDashBold;
			border.top = HorizontalLines.quadDashBold;
			expect(getIntersections(border, CornerPositions.topLeft)).toEqual(TopLeftBorder.bold);
		});
		test('double', () => {
			const border = {
				left: VerticalLines.double,
				top: HorizontalLines.double,
			};
			expect(getIntersections(border, CornerPositions.topLeft)).toEqual(TopLeftBorder.double);

			border.left = VerticalLines.double;
			border.top = HorizontalLines.bold;
			expect(getIntersections(border, CornerPositions.topLeft)).toEqual(TopLeftBorder.double);

			border.left = VerticalLines.bold;
			border.top = HorizontalLines.double;
			expect(getIntersections(border, CornerPositions.topLeft)).toEqual(TopLeftBorder.double);
		});

		test('boldSingle', () => {
			const border = {
				left: VerticalLines.line,
				top: HorizontalLines.bold,
			};
			expect(getIntersections(border, CornerPositions.topLeft)).toEqual(
				TopLeftBorder.boldSingle,
			);
		});

		test('singleBold', () => {
			const border = {
				left: VerticalLines.bold,
				top: HorizontalLines.line,
			};
			expect(getIntersections(border, CornerPositions.topLeft)).toEqual(
				TopLeftBorder.singleBold,
			);
		});

		test('doubleSingle', () => {
			const border = {
				left: VerticalLines.line,
				top: HorizontalLines.double,
			};
			expect(getIntersections(border, CornerPositions.topLeft)).toEqual(
				TopLeftBorder.doubleSingle,
			);
		});

		test('singleDouble', () => {
			const border = {
				left: VerticalLines.double,
				top: HorizontalLines.line,
			};
			expect(getIntersections(border, CornerPositions.topLeft)).toEqual(
				TopLeftBorder.singleDouble,
			);
		});

		test('only vertical', () => {
			const border = {
				bottomY: VerticalLines.line,
			};
			expect(getIntersections(border)).toEqual(VerticalLines.linedown);

			const border2 = {
				left: VerticalLines.bold,
			};
			expect(getIntersections(border2, CornerPositions.topLeft)).toEqual(
				VerticalLines.linedownBold,
			);

			border.bottomY = VerticalLines.double;
			expect(getIntersections(border)).toEqual(VerticalLines.linedown);

			border2.left = VerticalLines.dash;
			expect(getIntersections(border2, CornerPositions.topLeft)).toEqual(
				VerticalLines.linedown,
			);
		});
		test('only Horizontal (BOTTOM) [Must switch]', () => {
			const border = {
				rightX: HorizontalLines.line,
			};
			expect(getIntersections(border)).toEqual(HorizontalLines.lineright);
			const border2 = {
				top: HorizontalLines.bold,
			};
			expect(getIntersections(border2, CornerPositions.topLeft)).toEqual(
				HorizontalLines.linerightBold,
			);

			border.rightX = HorizontalLines.double;
			expect(getIntersections(border)).toEqual(HorizontalLines.lineright);

			border2.top = HorizontalLines.dash;
			expect(getIntersections(border2, CornerPositions.topLeft)).toEqual(
				HorizontalLines.lineright,
			);
		});
	});

	describe('TopRight', () => {
		test('none', () => {
			const border = {
				right: VerticalLines.none,
				top: HorizontalLines.none,
			};
			expect(getIntersections(border, CornerPositions.topRight)).toEqual(TopRightBorder.none);
		});
		test('normal', () => {
			let border = {
				right: VerticalLines.line,
				top: HorizontalLines.line,
			};
			expect(getIntersections(border, CornerPositions.topRight)).toEqual(TopRightBorder.line);

			border.right = VerticalLines.dash;
			border.top = HorizontalLines.trippleDash;
			expect(getIntersections(border, CornerPositions.topRight)).toEqual(TopRightBorder.line);

			border.right = VerticalLines.quadDash;
			border.top = HorizontalLines.quadDash;
			expect(getIntersections(border, CornerPositions.topRight)).toEqual(TopRightBorder.line);
		});
		test('bold', () => {
			let border = {
				right: VerticalLines.bold,
				top: HorizontalLines.bold,
			};
			expect(getIntersections(border, CornerPositions.topRight)).toEqual(TopRightBorder.bold);

			border.right = VerticalLines.dashBold;
			border.top = HorizontalLines.trippleDashBold;
			expect(getIntersections(border, CornerPositions.topRight)).toEqual(TopRightBorder.bold);

			border.right = VerticalLines.quadDashBold;
			border.top = HorizontalLines.quadDashBold;
			expect(getIntersections(border, CornerPositions.topRight)).toEqual(TopRightBorder.bold);
		});
		test('double', () => {
			const border = {
				right: VerticalLines.double,
				top: HorizontalLines.double,
			};
			expect(getIntersections(border, CornerPositions.topRight)).toEqual(
				TopRightBorder.double,
			);

			border.right = VerticalLines.double;
			border.top = HorizontalLines.bold;
			expect(getIntersections(border, CornerPositions.topRight)).toEqual(
				TopRightBorder.double,
			);

			border.right = VerticalLines.bold;
			border.top = HorizontalLines.double;
			expect(getIntersections(border, CornerPositions.topRight)).toEqual(
				TopRightBorder.double,
			);
		});

		test('boldSingle', () => {
			const border = {
				right: VerticalLines.line,
				top: HorizontalLines.bold,
			};
			expect(getIntersections(border, CornerPositions.topRight)).toEqual(
				TopRightBorder.boldSingle,
			);
		});

		test('singleBold', () => {
			const border = {
				right: VerticalLines.bold,
				top: HorizontalLines.line,
			};
			expect(getIntersections(border, CornerPositions.topRight)).toEqual(
				TopRightBorder.singleBold,
			);
		});

		test('doubleSingle', () => {
			const border = {
				right: VerticalLines.line,
				top: HorizontalLines.double,
			};
			expect(getIntersections(border, CornerPositions.topRight)).toEqual(
				TopRightBorder.doubleSingle,
			);
		});

		test('singleDouble', () => {
			const border = {
				right: VerticalLines.double,
				top: HorizontalLines.line,
			};
			expect(getIntersections(border, CornerPositions.topRight)).toEqual(
				TopRightBorder.singleDouble,
			);
		});

		test('only vertical (RIGHT)', () => {
			const border = {
				right: VerticalLines.line,
			};
			expect(getIntersections(border, CornerPositions.topRight)).toEqual(
				VerticalLines.linedown,
			);
			const border2 = {
				bottomY: VerticalLines.bold,
			};
			expect(getIntersections(border2)).toEqual(VerticalLines.linedownBold);

			border.right = VerticalLines.double;
			expect(getIntersections(border, CornerPositions.topRight)).toEqual(
				VerticalLines.linedown,
			);

			border2.bottomY = VerticalLines.dash;
			expect(getIntersections(border2)).toEqual(VerticalLines.linedown);
		});
		test('only Horizontal (TOP)', () => {
			const border = {
				top: HorizontalLines.line,
			};
			expect(getIntersections(border, CornerPositions.topRight)).toEqual(
				HorizontalLines.lineleft,
			);
			const border2 = {
				leftX: HorizontalLines.bold,
			};
			expect(getIntersections(border2)).toEqual(HorizontalLines.lineleftBold);

			border.top = HorizontalLines.double;
			expect(getIntersections(border, CornerPositions.topRight)).toEqual(
				HorizontalLines.lineleft,
			);

			border2.leftX = HorizontalLines.dash;
			expect(getIntersections(border2)).toEqual(HorizontalLines.lineleft);
		});
	});

	describe('BottomLeft', () => {
		test('none', () => {
			const border = {
				left: VerticalLines.none,
				bottom: HorizontalLines.none,
			};
			expect(getIntersections(border, CornerPositions.bottomLeft)).toEqual(
				BottomLeftBorder.none,
			);
		});
		test('normal', () => {
			let border = {
				left: VerticalLines.line,
				bottom: HorizontalLines.line,
			};
			expect(getIntersections(border, CornerPositions.bottomLeft)).toEqual(
				BottomLeftBorder.line,
			);

			border.left = VerticalLines.dash;
			border.bottom = HorizontalLines.trippleDash;
			expect(getIntersections(border, CornerPositions.bottomLeft)).toEqual(
				BottomLeftBorder.line,
			);

			border.left = VerticalLines.quadDash;
			border.bottom = HorizontalLines.quadDash;
			expect(getIntersections(border, CornerPositions.bottomLeft)).toEqual(
				BottomLeftBorder.line,
			);
		});
		test('bold', () => {
			const border = {
				left: VerticalLines.bold,
				bottom: HorizontalLines.bold,
			};
			expect(getIntersections(border, CornerPositions.bottomLeft)).toEqual(
				BottomLeftBorder.bold,
			);

			border.left = VerticalLines.dashBold;
			border.bottom = HorizontalLines.trippleDashBold;
			expect(getIntersections(border, CornerPositions.bottomLeft)).toEqual(
				BottomLeftBorder.bold,
			);

			border.left = VerticalLines.quadDashBold;
			border.bottom = HorizontalLines.quadDashBold;
			expect(getIntersections(border, CornerPositions.bottomLeft)).toEqual(
				BottomLeftBorder.bold,
			);
		});
		test('double', () => {
			const border = {
				left: VerticalLines.double,
				bottom: HorizontalLines.double,
			};
			expect(getIntersections(border, CornerPositions.bottomLeft)).toEqual(
				BottomLeftBorder.double,
			);

			border.left = VerticalLines.double;
			border.bottom = HorizontalLines.bold;
			expect(getIntersections(border, CornerPositions.bottomLeft)).toEqual(
				BottomLeftBorder.double,
			);

			border.left = VerticalLines.bold;
			border.bottom = HorizontalLines.double;
			expect(getIntersections(border, CornerPositions.bottomLeft)).toEqual(
				BottomLeftBorder.double,
			);
		});

		test('boldSingle', () => {
			const border = {
				left: VerticalLines.line,
				bottom: HorizontalLines.bold,
			};
			expect(getIntersections(border, CornerPositions.bottomLeft)).toEqual(
				BottomLeftBorder.boldSingle,
			);
		});

		test('singleBold', () => {
			const border = {
				left: VerticalLines.bold,
				bottom: HorizontalLines.line,
			};
			expect(getIntersections(border, CornerPositions.bottomLeft)).toEqual(
				BottomLeftBorder.singleBold,
			);
		});

		test('doubleSingle', () => {
			const border = {
				left: VerticalLines.line,
				bottom: HorizontalLines.double,
			};
			expect(getIntersections(border, CornerPositions.bottomLeft)).toEqual(
				BottomLeftBorder.doubleSingle,
			);
		});

		test('singleDouble', () => {
			const border = {
				left: VerticalLines.double,
				bottom: HorizontalLines.line,
			};
			expect(getIntersections(border, CornerPositions.bottomLeft)).toEqual(
				BottomLeftBorder.singleDouble,
			);
		});

		test('only vertical', () => {
			const border = {
				left: VerticalLines.line,
			};
			expect(getIntersections(border, CornerPositions.bottomLeft)).toEqual(
				VerticalLines.lineup,
			);
			const border2 = {
				topY: VerticalLines.bold,
			};
			expect(getIntersections(border2)).toEqual(VerticalLines.lineupBold);

			border.left = VerticalLines.double;
			expect(getIntersections(border, CornerPositions.bottomLeft)).toEqual(
				VerticalLines.lineup,
			);

			border2.topY = VerticalLines.dash;
			expect(getIntersections(border2)).toEqual(VerticalLines.lineup);
		});
		test('only Horizontal', () => {
			const border = {
				rightX: HorizontalLines.line,
			};
			expect(getIntersections(border)).toEqual(HorizontalLines.lineright);

			const border2 = {
				bottom: HorizontalLines.bold,
			};
			expect(getIntersections(border2, CornerPositions.bottomLeft)).toEqual(
				HorizontalLines.linerightBold,
			);

			border.rightX = HorizontalLines.double;
			expect(getIntersections(border)).toEqual(HorizontalLines.lineright);

			border2.bottom = HorizontalLines.dash;
			expect(getIntersections(border2, CornerPositions.bottomLeft)).toEqual(
				HorizontalLines.lineright,
			);
		});
	});

	describe('BottomRight', () => {
		test('none', () => {
			const border = {
				right: VerticalLines.none,
				bottom: HorizontalLines.none,
			};
			expect(getIntersections(border, CornerPositions.bottomRight)).toEqual(
				BottomRightBorder.none,
			);
		});
		test('normal', () => {
			let border = {
				right: VerticalLines.line,
				bottom: HorizontalLines.line,
			};
			expect(getIntersections(border, CornerPositions.bottomRight)).toEqual(
				BottomRightBorder.line,
			);

			border.right = VerticalLines.dash;
			border.bottom = HorizontalLines.trippleDash;
			expect(getIntersections(border, CornerPositions.bottomRight)).toEqual(
				BottomRightBorder.line,
			);

			border.right = VerticalLines.quadDash;
			border.bottom = HorizontalLines.quadDash;
			expect(getIntersections(border, CornerPositions.bottomRight)).toEqual(
				BottomRightBorder.line,
			);
		});
		test('bold', () => {
			const border = {
				right: VerticalLines.bold,
				bottom: HorizontalLines.bold,
			};
			expect(getIntersections(border, CornerPositions.bottomRight)).toEqual(
				BottomRightBorder.bold,
			);

			border.right = VerticalLines.dashBold;
			border.bottom = HorizontalLines.trippleDashBold;
			expect(getIntersections(border, CornerPositions.bottomRight)).toEqual(
				BottomRightBorder.bold,
			);

			border.right = VerticalLines.quadDashBold;
			border.bottom = HorizontalLines.quadDashBold;
			expect(getIntersections(border, CornerPositions.bottomRight)).toEqual(
				BottomRightBorder.bold,
			);
		});
		test('double', () => {
			const border = {
				right: VerticalLines.double,
				bottom: HorizontalLines.double,
			};
			expect(getIntersections(border, CornerPositions.bottomRight)).toEqual(
				BottomRightBorder.double,
			);

			border.right = VerticalLines.double;
			border.bottom = HorizontalLines.bold;
			expect(getIntersections(border, CornerPositions.bottomRight)).toEqual(
				BottomRightBorder.double,
			);

			border.right = VerticalLines.bold;
			border.bottom = HorizontalLines.double;
			expect(getIntersections(border, CornerPositions.bottomRight)).toEqual(
				BottomRightBorder.double,
			);
		});

		test('boldSingle', () => {
			const border = {
				right: VerticalLines.line,
				bottom: HorizontalLines.bold,
			};
			expect(getIntersections(border, CornerPositions.bottomRight)).toEqual(
				BottomRightBorder.boldSingle,
			);
		});

		test('singleBold', () => {
			const border = {
				right: VerticalLines.bold,
				bottom: HorizontalLines.line,
			};
			expect(getIntersections(border, CornerPositions.bottomRight)).toEqual(
				BottomRightBorder.singleBold,
			);
		});

		test('doubleSingle', () => {
			const border = {
				right: VerticalLines.line,
				bottom: HorizontalLines.double,
			};
			expect(getIntersections(border, CornerPositions.bottomRight)).toEqual(
				BottomRightBorder.doubleSingle,
			);
		});

		test('singleDouble', () => {
			const border = {
				right: VerticalLines.double,
				bottom: HorizontalLines.line,
			};
			expect(getIntersections(border, CornerPositions.bottomRight)).toEqual(
				BottomRightBorder.singleDouble,
			);
		});

		test('only vertical', () => {
			const border = {
				right: VerticalLines.line,
			};
			expect(getIntersections(border, CornerPositions.bottomRight)).toEqual(
				VerticalLines.lineup,
			);
			const border2 = {
				topY: VerticalLines.bold,
			};
			expect(getIntersections(border2)).toEqual(VerticalLines.lineupBold);

			border.right = VerticalLines.double;
			expect(getIntersections(border, CornerPositions.bottomRight)).toEqual(
				VerticalLines.lineup,
			);

			border2.topY = VerticalLines.dash;
			expect(getIntersections(border2)).toEqual(VerticalLines.lineup);
		});
		test('only Horizontal', () => {
			const border = {
				leftX: HorizontalLines.line,
			};
			expect(getIntersections(border)).toEqual(HorizontalLines.lineleft);

			const border2 = {
				bottom: HorizontalLines.bold,
			};
			expect(getIntersections(border2, CornerPositions.bottomRight)).toEqual(
				HorizontalLines.lineleftBold,
			);

			border.leftX = HorizontalLines.double;
			expect(getIntersections(border)).toEqual(HorizontalLines.lineleft);

			border2.bottom = HorizontalLines.dash;
			expect(getIntersections(border2, CornerPositions.bottomRight)).toEqual(
				HorizontalLines.lineleft,
			);
		});
	});
});

describe('should discover border intersections', () => {
	describe('TopIntersection', () => {
		test('normal line', () => {
			const border = {
				leftX: HorizontalLines.line,
				rightX: HorizontalLines.line,
				bottomY: VerticalLines.line,
			};
			expect(getIntersections(border)).toEqual(TopIntersect.line);

			border.leftX = HorizontalLines.dash;
			border.rightX = HorizontalLines.trippleDash;
			border.bottomY = VerticalLines.quadDash;
			expect(getIntersections(border)).toEqual(TopIntersect.line);
		});
		test('bold left', () => {
			const border = {
				leftX: HorizontalLines.dashBold,
				rightX: HorizontalLines.dash,
				bottomY: VerticalLines.line,
			};
			expect(getIntersections(border)).toEqual(TopIntersect.boldLeft);
		});

		test('bold right', () => {
			const border = {
				leftX: HorizontalLines.quadDash,
				rightX: HorizontalLines.bold,
				bottomY: VerticalLines.line,
			};
			expect(getIntersections(border)).toEqual(TopIntersect.boldRight);
		});

		test('bold horizontal line vertical', () => {
			const border = {
				leftX: HorizontalLines.bold,
				rightX: HorizontalLines.bold,
				bottomY: VerticalLines.line,
			};
			expect(getIntersections(border)).toEqual(TopIntersect.boldSingle);
		});

		test('single horizontal bold vertical', () => {
			const border = {
				leftX: HorizontalLines.line,
				rightX: HorizontalLines.line,
				bottomY: VerticalLines.bold,
			};
			expect(getIntersections(border)).toEqual(TopIntersect.singleBold);
			border.leftX = HorizontalLines.double;
			expect(getIntersections(border)).toEqual(TopIntersect.singleBold);
		});

		test('light right rest bold', () => {
			const border = {
				leftX: HorizontalLines.bold,
				rightX: HorizontalLines.line,
				bottomY: VerticalLines.bold,
			};
			expect(getIntersections(border)).toEqual(TopIntersect.lightRight);
		});

		test('light left rest bold', () => {
			const border = {
				leftX: HorizontalLines.line,
				rightX: HorizontalLines.bold,
				bottomY: VerticalLines.bold,
			};
			expect(getIntersections(border)).toEqual(TopIntersect.lightLeft);
		});

		test('bold', () => {
			const border = {
				leftX: HorizontalLines.bold,
				rightX: HorizontalLines.bold,
				bottomY: VerticalLines.bold,
			};
			expect(getIntersections(border)).toEqual(TopIntersect.bold);
			border.leftX = HorizontalLines.double;
			expect(getIntersections(border)).toEqual(TopIntersect.bold);
			border.leftX = HorizontalLines.bold;
			border.rightX = HorizontalLines.double;
			expect(getIntersections(border)).toEqual(TopIntersect.bold);
			border.rightX = HorizontalLines.bold;
			border.bottomY = VerticalLines.double;
			expect(getIntersections(border)).toEqual(TopIntersect.bold);
		});

		test('double', () => {
			const border = {
				leftX: HorizontalLines.double,
				rightX: HorizontalLines.double,
				bottomY: VerticalLines.double,
			};
			expect(getIntersections(border)).toEqual(TopIntersect.double);
			border.bottomY = VerticalLines.bold;
			expect(getIntersections(border)).toEqual(TopIntersect.double);
			border.bottomY = VerticalLines.double;
			border.leftX = HorizontalLines.line;
			expect(getIntersections(border)).toEqual(TopIntersect.double);
			border.leftX = HorizontalLines.double;
			border.rightX = HorizontalLines.line;
			expect(getIntersections(border)).toEqual(TopIntersect.double);
			border.rightX = HorizontalLines.bold;
			expect(getIntersections(border)).toEqual(TopIntersect.double);
			border.rightX = HorizontalLines.double;
			border.leftX = HorizontalLines.bold;
			expect(getIntersections(border)).toEqual(TopIntersect.double);
		});

		test('horizontal line and vertical double line', () => {
			const border = {
				leftX: HorizontalLines.line,
				rightX: HorizontalLines.dash,
				bottomY: VerticalLines.double,
			};
			expect(getIntersections(border)).toEqual(TopIntersect.singleDouble);
			border.rightX = HorizontalLines.bold;
			expect(getIntersections(border)).toEqual(TopIntersect.singleDouble);
			border.rightX = HorizontalLines.line;
			border.leftX = HorizontalLines.bold;
			expect(getIntersections(border)).toEqual(TopIntersect.singleDouble);
		});

		test('horizontal double and vertical line', () => {
			const border = {
				leftX: HorizontalLines.double,
				rightX: HorizontalLines.double,
				bottomY: VerticalLines.line,
			};
			expect(getIntersections(border)).toEqual(TopIntersect.doubleSingle);
			border.leftX = HorizontalLines.line;
			expect(getIntersections(border)).toEqual(TopIntersect.doubleSingle);
			border.leftX = HorizontalLines.double;
			border.rightX = HorizontalLines.line;
			expect(getIntersections(border)).toEqual(TopIntersect.doubleSingle);
			border.rightX = HorizontalLines.bold;
			expect(getIntersections(border)).toEqual(TopIntersect.doubleSingle);
			border.rightX = HorizontalLines.double;
			border.leftX = HorizontalLines.bold;
			expect(getIntersections(border)).toEqual(TopIntersect.doubleSingle);
		});
	});

	describe('BottomIntersection', () => {
		test('normal line', () => {
			const border = {
				leftX: HorizontalLines.line,
				rightX: HorizontalLines.line,
				topY: VerticalLines.line,
			};
			expect(getIntersections(border)).toEqual(BottomIntersect.line);

			border.leftX = HorizontalLines.dash;
			border.rightX = HorizontalLines.trippleDash;
			border.topY = VerticalLines.quadDash;
			expect(getIntersections(border)).toEqual(BottomIntersect.line);
		});
		test('bold left', () => {
			const border = {
				leftX: HorizontalLines.dashBold,
				rightX: HorizontalLines.dash,
				topY: VerticalLines.line,
			};
			expect(getIntersections(border)).toEqual(BottomIntersect.boldLeft);
		});

		test('bold right', () => {
			const border = {
				leftX: HorizontalLines.quadDash,
				rightX: HorizontalLines.bold,
				topY: VerticalLines.line,
			};
			expect(getIntersections(border)).toEqual(BottomIntersect.boldRight);
		});

		test('bold horizontal line vertical', () => {
			const border = {
				leftX: HorizontalLines.bold,
				rightX: HorizontalLines.bold,
				topY: VerticalLines.line,
			};
			expect(getIntersections(border)).toEqual(BottomIntersect.boldSingle);
		});

		test('single horizontal bold vertical', () => {
			const border = {
				leftX: HorizontalLines.line,
				rightX: HorizontalLines.line,
				topY: VerticalLines.bold,
			};
			expect(getIntersections(border)).toEqual(BottomIntersect.singleBold);
			border.leftX = HorizontalLines.double;
			expect(getIntersections(border)).toEqual(BottomIntersect.singleBold);
			border.rightX = HorizontalLines.double;
			border.leftX = HorizontalLines.line;
			expect(getIntersections(border)).toEqual(BottomIntersect.singleBold);
		});

		test('light right rest bold', () => {
			const border = {
				leftX: HorizontalLines.bold,
				rightX: HorizontalLines.line,
				topY: VerticalLines.bold,
			};
			expect(getIntersections(border)).toEqual(BottomIntersect.lightRight);
		});

		test('light left rest bold', () => {
			const border = {
				leftX: HorizontalLines.line,
				rightX: HorizontalLines.bold,
				topY: VerticalLines.bold,
			};
			expect(getIntersections(border)).toEqual(BottomIntersect.lightLeft);
		});

		test('bold', () => {
			const border = {
				leftX: HorizontalLines.bold,
				rightX: HorizontalLines.bold,
				topY: VerticalLines.bold,
			};
			expect(getIntersections(border)).toEqual(BottomIntersect.bold);
			border.leftX = HorizontalLines.double;
			expect(getIntersections(border)).toEqual(BottomIntersect.bold);
			border.leftX = HorizontalLines.bold;
			border.rightX = HorizontalLines.double;
			expect(getIntersections(border)).toEqual(BottomIntersect.bold);
			border.rightX = HorizontalLines.bold;
			border.topY = VerticalLines.double;
			expect(getIntersections(border)).toEqual(BottomIntersect.bold);
		});

		test('double', () => {
			const border = {
				leftX: HorizontalLines.double,
				rightX: HorizontalLines.double,
				topY: VerticalLines.double,
			};
			expect(getIntersections(border)).toEqual(BottomIntersect.double);
			border.topY = VerticalLines.bold;
			expect(getIntersections(border)).toEqual(BottomIntersect.double);
			border.topY = VerticalLines.double;
			border.leftX = HorizontalLines.line;
			expect(getIntersections(border)).toEqual(BottomIntersect.double);
			border.leftX = HorizontalLines.double;
			border.rightX = HorizontalLines.line;
			expect(getIntersections(border)).toEqual(BottomIntersect.double);
			border.rightX = HorizontalLines.bold;
			expect(getIntersections(border)).toEqual(BottomIntersect.double);
			border.rightX = HorizontalLines.double;
			border.leftX = HorizontalLines.bold;
			expect(getIntersections(border)).toEqual(BottomIntersect.double);
		});

		test('horizontal line and vertical double line', () => {
			const border = {
				leftX: HorizontalLines.line,
				rightX: HorizontalLines.dash,
				topY: VerticalLines.double,
			};
			expect(getIntersections(border)).toEqual(BottomIntersect.singleDouble);
			border.rightX = HorizontalLines.bold;
			expect(getIntersections(border)).toEqual(BottomIntersect.singleDouble);
			border.rightX = HorizontalLines.line;
			border.leftX = HorizontalLines.bold;
			expect(getIntersections(border)).toEqual(BottomIntersect.singleDouble);
		});

		test('horizontal double and vertical line', () => {
			const border = {
				leftX: HorizontalLines.double,
				rightX: HorizontalLines.double,
				topY: VerticalLines.line,
			};
			expect(getIntersections(border)).toEqual(BottomIntersect.doubleSingle);
			border.leftX = HorizontalLines.line;
			expect(getIntersections(border)).toEqual(BottomIntersect.doubleSingle);
			border.leftX = HorizontalLines.double;
			border.rightX = HorizontalLines.line;
			expect(getIntersections(border)).toEqual(BottomIntersect.doubleSingle);
			border.rightX = HorizontalLines.bold;
			expect(getIntersections(border)).toEqual(BottomIntersect.doubleSingle);
			border.rightX = HorizontalLines.double;
			border.leftX = HorizontalLines.bold;
			expect(getIntersections(border)).toEqual(BottomIntersect.doubleSingle);
		});
	});

	describe('LeftIntersection', () => {
		test('normal line', () => {
			const border = {
				bottomY: VerticalLines.line,
				rightX: HorizontalLines.line,
				topY: VerticalLines.line,
			};
			expect(getIntersections(border)).toEqual(LeftIntersect.line);

			border.bottomY = VerticalLines.dash;
			border.rightX = HorizontalLines.trippleDash;
			border.topY = VerticalLines.quadDash;
			expect(getIntersections(border)).toEqual(LeftIntersect.line);
		});
		test('bold Top', () => {
			const border = {
				topY: VerticalLines.bold,
				rightX: HorizontalLines.dash,
				bottomY: VerticalLines.dash,
			};
			expect(getIntersections(border)).toEqual(LeftIntersect.boldTop);
		});

		test('bold bottom', () => {
			const border = {
				topY: VerticalLines.line,
				bottomY: VerticalLines.quadDashBold,
				rightX: HorizontalLines.line,
			};
			expect(getIntersections(border)).toEqual(LeftIntersect.boldBottom);
		});

		test('bold horizontal line vertical', () => {
			const border = {
				bottomY: VerticalLines.line,
				rightX: HorizontalLines.bold,
				topY: VerticalLines.line,
			};
			expect(getIntersections(border)).toEqual(LeftIntersect.boldSingle);
			border.bottomY = VerticalLines.double;
			expect(getIntersections(border)).toEqual(LeftIntersect.boldSingle);
			border.bottomY = VerticalLines.line;
			border.topY = VerticalLines.double;
			expect(getIntersections(border)).toEqual(LeftIntersect.boldSingle);
		});

		test('line horizontal bold vertical', () => {
			const border = {
				topY: VerticalLines.bold,
				rightX: HorizontalLines.line,
				bottomY: VerticalLines.bold,
			};
			expect(getIntersections(border)).toEqual(LeftIntersect.singleBold);
			border.rightX = HorizontalLines.double;
			expect(getIntersections(border)).toEqual(LeftIntersect.singleBold);
		});

		test('light top', () => {
			const border = {
				topY: VerticalLines.line,
				rightX: HorizontalLines.bold,
				bottomY: VerticalLines.bold,
			};
			expect(getIntersections(border)).toEqual(LeftIntersect.lightTop);
		});

		test('light bottom', () => {
			const border = {
				topY: VerticalLines.bold,
				rightX: HorizontalLines.bold,
				bottomY: VerticalLines.line,
			};
			expect(getIntersections(border)).toEqual(LeftIntersect.lightBottom);
		});

		test('bold', () => {
			const border = {
				topY: VerticalLines.bold,
				rightX: HorizontalLines.bold,
				bottomY: VerticalLines.bold,
			};
			expect(getIntersections(border)).toEqual(LeftIntersect.bold);
			border.topY = VerticalLines.double;
			expect(getIntersections(border)).toEqual(LeftIntersect.bold);
			border.topY = VerticalLines.bold;
			border.bottomY = VerticalLines.double;
			expect(getIntersections(border)).toEqual(LeftIntersect.bold);
		});

		test('doubleSingle', () => {
			const border = {
				topY: VerticalLines.line,
				rightX: HorizontalLines.double,
				bottomY: VerticalLines.line,
			};
			expect(getIntersections(border)).toEqual(LeftIntersect.doubleSingle);
			border.topY = VerticalLines.bold;
			expect(getIntersections(border)).toEqual(LeftIntersect.doubleSingle);
			border.topY = VerticalLines.line;
			border.bottomY = VerticalLines.bold;
			expect(getIntersections(border)).toEqual(LeftIntersect.doubleSingle);
		});

		test('singleDouble', () => {
			const border = {
				topY: VerticalLines.double,
				rightX: HorizontalLines.line,
				bottomY: VerticalLines.double,
			};
			expect(getIntersections(border)).toEqual(LeftIntersect.singleDouble);
			border.topY = VerticalLines.bold;
			expect(getIntersections(border)).toEqual(LeftIntersect.singleDouble);
			border.topY = VerticalLines.double;
			border.bottomY = VerticalLines.bold;
			expect(getIntersections(border)).toEqual(LeftIntersect.singleDouble);
			border.bottomY = VerticalLines.line;
			expect(getIntersections(border)).toEqual(LeftIntersect.singleDouble);
			border.bottomY = VerticalLines.double;
			border.topY = VerticalLines.line;
			expect(getIntersections(border)).toEqual(LeftIntersect.singleDouble);
		});
		test('double', () => {
			const border = {
				topY: VerticalLines.double,
				rightX: HorizontalLines.double,
				bottomY: VerticalLines.double,
			};
			expect(getIntersections(border)).toEqual(LeftIntersect.double);
			border.topY = VerticalLines.line;
			expect(getIntersections(border)).toEqual(LeftIntersect.double);
			border.topY = VerticalLines.bold;
			expect(getIntersections(border)).toEqual(LeftIntersect.double);
			border.topY = VerticalLines.double;
			border.bottomY = VerticalLines.line;
			expect(getIntersections(border)).toEqual(LeftIntersect.double);
			border.bottomY = VerticalLines.bold;
			expect(getIntersections(border)).toEqual(LeftIntersect.double);
			border.bottomY = VerticalLines.double;
			border.rightX = HorizontalLines.bold;
			expect(getIntersections(border)).toEqual(LeftIntersect.double);
		});
	});

	describe('RightIntersection', () => {
		test('normal line', () => {
			const border = {
				bottomY: VerticalLines.line,
				leftX: HorizontalLines.line,
				topY: VerticalLines.line,
			};
			expect(getIntersections(border)).toEqual(RightIntersect.line);

			border.bottomY = VerticalLines.dash;
			border.leftX = HorizontalLines.trippleDash;
			border.topY = VerticalLines.quadDash;
			expect(getIntersections(border)).toEqual(RightIntersect.line);
		});
		test('bold Top', () => {
			const border = {
				topY: VerticalLines.bold,
				leftX: HorizontalLines.dash,
				bottomY: VerticalLines.dash,
			};
			expect(getIntersections(border)).toEqual(RightIntersect.boldTop);
		});

		test('bold bottom', () => {
			const border = {
				leftX: HorizontalLines.line,
				topY: VerticalLines.line,
				bottomY: VerticalLines.quadDashBold,
			};
			expect(getIntersections(border)).toEqual(RightIntersect.boldBottom);
		});

		test('bold horizontal line vertical', () => {
			const border = {
				bottomY: VerticalLines.line,
				leftX: HorizontalLines.bold,
				topY: VerticalLines.line,
			};
			expect(getIntersections(border)).toEqual(RightIntersect.boldSingle);
			border.bottomY = VerticalLines.double;
			expect(getIntersections(border)).toEqual(RightIntersect.boldSingle);
			border.bottomY = VerticalLines.line;
			border.topY = VerticalLines.double;
			expect(getIntersections(border)).toEqual(RightIntersect.boldSingle);
		});

		test('line horizontal bold vertical', () => {
			const border = {
				topY: VerticalLines.bold,
				leftX: HorizontalLines.line,
				bottomY: VerticalLines.bold,
			};
			expect(getIntersections(border)).toEqual(RightIntersect.singleBold);
			border.leftX = HorizontalLines.double;
			expect(getIntersections(border)).toEqual(RightIntersect.singleBold);
		});

		test('light top', () => {
			const border = {
				leftX: HorizontalLines.bold,
				topY: VerticalLines.line,
				bottomY: VerticalLines.bold,
			};
			expect(getIntersections(border)).toEqual(RightIntersect.lightTop);
		});

		test('light bottom', () => {
			const border = {
				topY: VerticalLines.bold,
				leftX: HorizontalLines.bold,
				bottomY: VerticalLines.line,
			};
			expect(getIntersections(border)).toEqual(RightIntersect.lightBottom);
		});

		test('bold', () => {
			const border = {
				topY: VerticalLines.bold,
				leftX: HorizontalLines.bold,
				bottomY: VerticalLines.bold,
			};
			expect(getIntersections(border)).toEqual(RightIntersect.bold);
			border.topY = VerticalLines.double;
			expect(getIntersections(border)).toEqual(RightIntersect.bold);
			border.topY = VerticalLines.bold;
			border.bottomY = VerticalLines.double;
			expect(getIntersections(border)).toEqual(RightIntersect.bold);
		});

		test('doubleSingle', () => {
			const border = {
				leftX: HorizontalLines.double,
				topY: VerticalLines.line,
				bottomY: VerticalLines.line,
			};
			expect(getIntersections(border)).toEqual(RightIntersect.doubleSingle);
			border.topY = VerticalLines.bold;
			expect(getIntersections(border)).toEqual(RightIntersect.doubleSingle);
			border.topY = VerticalLines.line;
			border.bottomY = VerticalLines.bold;
			expect(getIntersections(border)).toEqual(RightIntersect.doubleSingle);
		});

		test('singleDouble', () => {
			const border = {
				topY: VerticalLines.double,
				leftX: HorizontalLines.line,
				bottomY: VerticalLines.double,
			};
			expect(getIntersections(border)).toEqual(RightIntersect.singleDouble);
			border.topY = VerticalLines.bold;
			expect(getIntersections(border)).toEqual(RightIntersect.singleDouble);
			border.topY = VerticalLines.double;
			border.bottomY = VerticalLines.bold;
			expect(getIntersections(border)).toEqual(RightIntersect.singleDouble);
			border.bottomY = VerticalLines.line;
			expect(getIntersections(border)).toEqual(RightIntersect.singleDouble);
			border.bottomY = VerticalLines.double;
			border.topY = VerticalLines.line;
			expect(getIntersections(border)).toEqual(RightIntersect.singleDouble);
		});
		test('double', () => {
			const border = {
				topY: VerticalLines.double,
				leftX: HorizontalLines.double,
				bottomY: VerticalLines.double,
			};
			expect(getIntersections(border)).toEqual(RightIntersect.double);
			border.topY = VerticalLines.line;
			expect(getIntersections(border)).toEqual(RightIntersect.double);
			border.topY = VerticalLines.bold;
			expect(getIntersections(border)).toEqual(RightIntersect.double);
			border.topY = VerticalLines.double;
			border.bottomY = VerticalLines.line;
			expect(getIntersections(border)).toEqual(RightIntersect.double);
			border.bottomY = VerticalLines.bold;
			expect(getIntersections(border)).toEqual(RightIntersect.double);
			border.bottomY = VerticalLines.double;
			border.leftX = HorizontalLines.bold;
			expect(getIntersections(border)).toEqual(RightIntersect.double);
		});
	});
});

describe('should discover middle border intersections', () => {
	test('line', () => {
		const border = {
			leftX: HorizontalLines.line,
			topY: VerticalLines.line,
			rightX: HorizontalLines.line,
			bottomY: VerticalLines.line,
		};
		expect(getIntersections(border)).toEqual(Intersect.line);
	});
	test('left [bold left rest normal]', () => {
		const border = {
			leftX: HorizontalLines.bold,
			topY: VerticalLines.line,
			rightX: HorizontalLines.line,
			bottomY: VerticalLines.line,
		};
		expect(getIntersections(border)).toEqual(Intersect.left);
		border.bottomY = VerticalLines.double;
		expect(getIntersections(border)).toEqual(Intersect.left);
		border.bottomY = VerticalLines.line;
		border.topY = VerticalLines.double;
		expect(getIntersections(border)).toEqual(Intersect.left);
	});

	test('right [bold right rest normal]', () => {
		const border = {
			leftX: HorizontalLines.line,
			topY: VerticalLines.line,
			rightX: HorizontalLines.bold,
			bottomY: VerticalLines.line,
		};
		expect(getIntersections(border)).toEqual(Intersect.right);
		border.bottomY = VerticalLines.double;
		expect(getIntersections(border)).toEqual(Intersect.right);
		border.bottomY = VerticalLines.line;
		border.topY = VerticalLines.double;
		expect(getIntersections(border)).toEqual(Intersect.right);
	});

	test('top [bold top rest normal]', () => {
		const border = {
			leftX: HorizontalLines.line,
			topY: VerticalLines.bold,
			rightX: HorizontalLines.line,
			bottomY: VerticalLines.line,
		};
		expect(getIntersections(border)).toEqual(Intersect.top);
		border.leftX = HorizontalLines.double;
		expect(getIntersections(border)).toEqual(Intersect.top);
		border.leftX = HorizontalLines.line;
		border.rightX = HorizontalLines.double;
		expect(getIntersections(border)).toEqual(Intersect.top);
	});

	test('bottom [bold bottom rest normal]', () => {
		const border = {
			leftX: HorizontalLines.line,
			topY: VerticalLines.line,
			rightX: HorizontalLines.line,
			bottomY: VerticalLines.bold,
		};
		expect(getIntersections(border)).toEqual(Intersect.bottom);
		border.leftX = HorizontalLines.double;
		expect(getIntersections(border)).toEqual(Intersect.bottom);
		border.leftX = HorizontalLines.line;
		border.rightX = HorizontalLines.double;
		expect(getIntersections(border)).toEqual(Intersect.bottom);
	});

	test('bold horizontal, normal vertical', () => {
		const border = {
			leftX: HorizontalLines.bold,
			topY: VerticalLines.line,
			rightX: HorizontalLines.bold,
			bottomY: VerticalLines.line,
		};
		expect(getIntersections(border)).toEqual(Intersect.boldSingle);
		border.topY = VerticalLines.double;
		expect(getIntersections(border)).toEqual(Intersect.boldSingle);
		border.topY = VerticalLines.line;
		border.bottomY = VerticalLines.double;
		expect(getIntersections(border)).toEqual(Intersect.boldSingle);
	});

	test('normal horizontal, bold vertical', () => {
		const border = {
			leftX: HorizontalLines.line,
			topY: VerticalLines.bold,
			rightX: HorizontalLines.line,
			bottomY: VerticalLines.bold,
		};
		expect(getIntersections(border)).toEqual(Intersect.singleBold);
		border.leftX = HorizontalLines.double;
		expect(getIntersections(border)).toEqual(Intersect.singleBold);
		border.leftX = HorizontalLines.line;
		border.rightX = HorizontalLines.double;
		expect(getIntersections(border)).toEqual(Intersect.singleBold);
	});

	test('top Left (top & left = bold bottom & right = normal)', () => {
		const border = {
			leftX: HorizontalLines.bold,
			topY: VerticalLines.bold,
			rightX: HorizontalLines.line,
			bottomY: VerticalLines.line,
		};
		expect(getIntersections(border)).toEqual(Intersect.topLeft);
		border.rightX = HorizontalLines.double;
		expect(getIntersections(border)).toEqual(Intersect.topLeft);
		border.rightX = HorizontalLines.line;
		border.bottomY = VerticalLines.double;
		expect(getIntersections(border)).toEqual(Intersect.topLeft);
	});

	test('top Right (top & Right = bold bottom & left = normal)', () => {
		const border = {
			leftX: HorizontalLines.line,
			topY: VerticalLines.bold,
			rightX: HorizontalLines.bold,
			bottomY: VerticalLines.line,
		};
		expect(getIntersections(border)).toEqual(Intersect.topRight);
		border.leftX = HorizontalLines.double;
		expect(getIntersections(border)).toEqual(Intersect.topRight);
		border.leftX = HorizontalLines.line;
		border.bottomY = VerticalLines.double;
		expect(getIntersections(border)).toEqual(Intersect.topRight);
	});

	test('Bottom left (bottom & left = bold top & right = normal)', () => {
		const border = {
			leftX: HorizontalLines.bold,
			topY: VerticalLines.line,
			rightX: HorizontalLines.line,
			bottomY: VerticalLines.bold,
		};
		expect(getIntersections(border)).toEqual(Intersect.bottomLeft);
		border.topY = VerticalLines.double;
		expect(getIntersections(border)).toEqual(Intersect.bottomLeft);
		border.topY = VerticalLines.line;
		border.rightX = HorizontalLines.double;
		expect(getIntersections(border)).toEqual(Intersect.bottomLeft);
	});

	test('Bottom Right (bottom & right = bold top & left = normal)', () => {
		const border = {
			leftX: HorizontalLines.line,
			topY: VerticalLines.line,
			rightX: HorizontalLines.bold,
			bottomY: VerticalLines.bold,
		};
		expect(getIntersections(border)).toEqual(Intersect.bottomRight);
		border.topY = VerticalLines.double;
		expect(getIntersections(border)).toEqual(Intersect.bottomRight);
		border.topY = VerticalLines.line;
		border.leftX = HorizontalLines.double;
		expect(getIntersections(border)).toEqual(Intersect.bottomRight);
	});

	test('light left (all bold except left = normal)', () => {
		const border = {
			leftX: HorizontalLines.line,
			topY: VerticalLines.bold,
			rightX: HorizontalLines.bold,
			bottomY: VerticalLines.bold,
		};
		expect(getIntersections(border)).toEqual(Intersect.lightLeft);
		border.leftX = HorizontalLines.double;
		expect(getIntersections(border)).toEqual(Intersect.lightLeft);
	});

	test('light top (all bold except top = normal)', () => {
		const border = {
			leftX: HorizontalLines.bold,
			topY: VerticalLines.line,
			rightX: HorizontalLines.bold,
			bottomY: VerticalLines.bold,
		};
		expect(getIntersections(border)).toEqual(Intersect.lightTop);
		border.topY = VerticalLines.double;
		expect(getIntersections(border)).toEqual(Intersect.lightTop);
	});

	test('light rigth (all bold except right = normal)', () => {
		const border = {
			leftX: HorizontalLines.bold,
			topY: VerticalLines.bold,
			rightX: HorizontalLines.line,
			bottomY: VerticalLines.bold,
		};
		expect(getIntersections(border)).toEqual(Intersect.lightRight);
		border.rightX = HorizontalLines.double;
		expect(getIntersections(border)).toEqual(Intersect.lightRight);
	});

	test('light bottom (all bold except bottom = normal)', () => {
		const border = {
			leftX: HorizontalLines.bold,
			topY: VerticalLines.bold,
			rightX: HorizontalLines.bold,
			bottomY: VerticalLines.line,
		};
		expect(getIntersections(border)).toEqual(Intersect.lightBottom);
		border.bottomY = VerticalLines.double;
		expect(getIntersections(border)).toEqual(Intersect.lightBottom);
	});

	test('bold', () => {
		const border = {
			leftX: HorizontalLines.bold,
			topY: VerticalLines.bold,
			rightX: HorizontalLines.bold,
			bottomY: VerticalLines.bold,
		};
		expect(getIntersections(border)).toEqual(Intersect.bold);
	});

	test('double Single (double horizontal, normal vertical)', () => {
		const border = {
			leftX: HorizontalLines.double,
			topY: VerticalLines.line,
			rightX: HorizontalLines.double,
			bottomY: VerticalLines.line,
		};
		expect(getIntersections(border)).toEqual(Intersect.doubleSingle);
		border.topY = VerticalLines.bold;
		expect(getIntersections(border)).toEqual(Intersect.doubleSingle);
		border.topY = VerticalLines.line;
		border.bottomY = VerticalLines.bold;
		expect(getIntersections(border)).toEqual(Intersect.doubleSingle);
		border.bottomY = VerticalLines.line;
		border.rightX = HorizontalLines.line;
		expect(getIntersections(border)).toEqual(Intersect.doubleSingle);
		border.rightX = HorizontalLines.double;
		border.leftX = HorizontalLines.line;
		expect(getIntersections(border)).toEqual(Intersect.doubleSingle);
		border.leftX = HorizontalLines.bold;
		expect(getIntersections(border)).toEqual(Intersect.doubleSingle);
		border.leftX = HorizontalLines.double;
		border.rightX = HorizontalLines.bold;
		expect(getIntersections(border)).toEqual(Intersect.doubleSingle);
	});

	test('single Double (normal horizontal, double vertical)', () => {
		const border = {
			leftX: HorizontalLines.line,
			topY: VerticalLines.double,
			rightX: HorizontalLines.line,
			bottomY: VerticalLines.double,
		};
		expect(getIntersections(border)).toEqual(Intersect.singleDouble);
		border.leftX = HorizontalLines.bold;
		expect(getIntersections(border)).toEqual(Intersect.singleDouble);
		border.leftX = HorizontalLines.line;
		border.rightX = HorizontalLines.bold;
		expect(getIntersections(border)).toEqual(Intersect.singleDouble);
		border.rightX = HorizontalLines.line;
		border.topY = VerticalLines.line;
		expect(getIntersections(border)).toEqual(Intersect.singleDouble);
		border.topY = VerticalLines.double;
		border.bottomY = VerticalLines.line;
		expect(getIntersections(border)).toEqual(Intersect.singleDouble);
		border.bottomY = VerticalLines.bold;
		expect(getIntersections(border)).toEqual(Intersect.singleDouble);
		border.bottomY = VerticalLines.double;
		border.topY = VerticalLines.bold;
		expect(getIntersections(border)).toEqual(Intersect.singleDouble);
	});

	test('double', () => {
		const border = {
			topY: VerticalLines.double,
			bottomY: VerticalLines.double,
			leftX: HorizontalLines.double,
			rightX: HorizontalLines.double,
		};
		expect(getIntersections(border)).toEqual(Intersect.double);
		border.topY = VerticalLines.line;
		expect(getIntersections(border)).toEqual(Intersect.double);
		border.leftX = HorizontalLines.line;
		expect(getIntersections(border)).toEqual(Intersect.double);
		border.topY = VerticalLines.bold;
		expect(getIntersections(border)).toEqual(Intersect.double);
		border.topY = VerticalLines.line;
		border.leftX = HorizontalLines.bold;
		expect(getIntersections(border)).toEqual(Intersect.double);
		border.leftX = HorizontalLines.double;
		border.rightX = HorizontalLines.line;
		expect(getIntersections(border)).toEqual(Intersect.double);
		border.topY = VerticalLines.double;
		border.bottomY = VerticalLines.line;
		expect(getIntersections(border)).toEqual(Intersect.double);
		border.rightX = HorizontalLines.double;
		border.leftX = HorizontalLines.line;
		expect(getIntersections(border)).toEqual(Intersect.double);
		border.bottomY = VerticalLines.double;
		expect(getIntersections(border)).toEqual(Intersect.double);
		border.leftX = HorizontalLines.double;
		border.bottomY = VerticalLines.line;
		expect(getIntersections(border)).toEqual(Intersect.double);
		border.bottomY = VerticalLines.double;
		border.rightX = HorizontalLines.line;
		expect(getIntersections(border)).toEqual(Intersect.double);
		border.topY = VerticalLines.line;
		border.rightX = HorizontalLines.bold;
		expect(getIntersections(border)).toEqual(Intersect.double);
		border.topY = VerticalLines.bold;
		border.rightX = HorizontalLines.line;
		expect(getIntersections(border)).toEqual(Intersect.double);
		border.bottomY = VerticalLines.bold;
		border.rightX = HorizontalLines.double;
		expect(getIntersections(border)).toEqual(Intersect.double);
		border.rightX = HorizontalLines.bold;
		border.bottomY = VerticalLines.double;
		expect(getIntersections(border)).toEqual(Intersect.double);
		border.leftX = HorizontalLines.bold;
		border.topY = VerticalLines.double;
		border.rightX = HorizontalLines.double;
		expect(getIntersections(border)).toEqual(Intersect.double);
		border.topY = VerticalLines.bold;
		expect(getIntersections(border)).toEqual(Intersect.double);
		border.topY = VerticalLines.double;
		border.rightX = HorizontalLines.bold;
		expect(getIntersections(border)).toEqual(Intersect.double);
	});
});

describe('should discover straight Lines in border Intersections', () => {
	test('normal horizontal line -', () => {
		const border = {
			leftX: HorizontalLines.line,
			rightX: HorizontalLines.line,
		};
		expect(getIntersections(border)).toEqual(HorizontalLines.line);
	});
	test('bold horizontal line -', () => {
		const border = {
			leftX: HorizontalLines.bold,
			rightX: HorizontalLines.bold,
		};
		expect(getIntersections(border)).toEqual(HorizontalLines.bold);
	});
	test('special horizontal line --', () => {
		const border = {
			leftX: HorizontalLines.dash,
			rightX: HorizontalLines.line,
		};
		expect(getIntersections(border)).toEqual(HorizontalLines.dash);
		border.rightX = HorizontalLines.dash;
		expect(getIntersections(border)).toEqual(HorizontalLines.dash);
		border.leftX = HorizontalLines.line;
		expect(getIntersections(border)).toEqual(HorizontalLines.dash);
		border.leftX = HorizontalLines.trippleDash;
		expect(getIntersections(border)).toEqual(HorizontalLines.trippleDash);
		border.leftX = HorizontalLines.line;
		border.rightX = HorizontalLines.trippleDash;
		expect(getIntersections(border)).toEqual(HorizontalLines.trippleDash);
		border.leftX = HorizontalLines.quadDash;
		expect(getIntersections(border)).toEqual(HorizontalLines.quadDash);
		border.leftX = HorizontalLines.line;
		border.rightX = HorizontalLines.quadDash;
		expect(getIntersections(border)).toEqual(HorizontalLines.quadDash);
	});

	test('special horizontal bold line --', () => {
		const border = {
			leftX: HorizontalLines.dashBold,
			rightX: HorizontalLines.bold,
		};
		expect(getIntersections(border)).toEqual(HorizontalLines.dashBold);
		border.rightX = HorizontalLines.dashBold;
		expect(getIntersections(border)).toEqual(HorizontalLines.dashBold);
		border.leftX = HorizontalLines.bold;
		expect(getIntersections(border)).toEqual(HorizontalLines.dashBold);
		border.leftX = HorizontalLines.trippleDashBold;
		expect(getIntersections(border)).toEqual(HorizontalLines.trippleDashBold);
		border.leftX = HorizontalLines.bold;
		border.rightX = HorizontalLines.trippleDashBold;
		expect(getIntersections(border)).toEqual(HorizontalLines.trippleDashBold);
		border.leftX = HorizontalLines.quadDashBold;
		expect(getIntersections(border)).toEqual(HorizontalLines.quadDashBold);
		border.leftX = HorizontalLines.bold;
		border.rightX = HorizontalLines.quadDashBold;
		expect(getIntersections(border)).toEqual(HorizontalLines.quadDashBold);
	});

	test('horizontal bold to line', () => {
		const border = {
			leftX: HorizontalLines.line,
			rightX: HorizontalLines.bold,
		};
		expect(getIntersections(border)).toEqual(HorizontalLines.lineBold);
		border.rightX = HorizontalLines.dashBold;
		expect(getIntersections(border)).toEqual(HorizontalLines.lineBold);
		border.leftX = HorizontalLines.dash;
		expect(getIntersections(border)).toEqual(HorizontalLines.lineBold);
		border.leftX = HorizontalLines.trippleDash;
		expect(getIntersections(border)).toEqual(HorizontalLines.lineBold);
		border.rightX = HorizontalLines.trippleDashBold;
		expect(getIntersections(border)).toEqual(HorizontalLines.lineBold);
	});

	test('horizontal line to bold', () => {
		const border = {
			leftX: HorizontalLines.bold,
			rightX: HorizontalLines.line,
		};
		expect(getIntersections(border)).toEqual(HorizontalLines.boldLine);
		border.leftX = HorizontalLines.dashBold;
		expect(getIntersections(border)).toEqual(HorizontalLines.boldLine);
		border.rightX = HorizontalLines.dash;
		expect(getIntersections(border)).toEqual(HorizontalLines.boldLine);
		border.rightX = HorizontalLines.trippleDash;
		expect(getIntersections(border)).toEqual(HorizontalLines.boldLine);
		border.leftX = HorizontalLines.trippleDashBold;
		expect(getIntersections(border)).toEqual(HorizontalLines.boldLine);
	});

	test('double horizontal line', () => {
		const border = {
			leftX: HorizontalLines.double,
			rightX: HorizontalLines.double,
		};
		expect(getIntersections(border)).toEqual(HorizontalLines.double);
		border.leftX = HorizontalLines.line;
		expect(getIntersections(border)).toEqual(HorizontalLines.double);
		border.leftX = HorizontalLines.double;
		border.rightX = HorizontalLines.line;
		expect(getIntersections(border)).toEqual(HorizontalLines.double);
		border.rightX = HorizontalLines.bold;
		expect(getIntersections(border)).toEqual(HorizontalLines.double);
		border.rightX = HorizontalLines.double;
		border.leftX = HorizontalLines.bold;
		expect(getIntersections(border)).toEqual(HorizontalLines.double);
	});

	test('normal vertical line |', () => {
		const border = {
			topY: VerticalLines.line,
			bottomY: VerticalLines.line,
		};
		expect(getIntersections(border)).toEqual(VerticalLines.line);
	});

	test('bold Vertical line |', () => {
		const border = {
			topY: VerticalLines.bold,
			bottomY: VerticalLines.bold,
		};
		expect(getIntersections(border)).toEqual(VerticalLines.bold);
	});

	test('special vertical line', () => {
		const border = {
			topY: VerticalLines.dash,
			bottomY: VerticalLines.line,
		};
		expect(getIntersections(border)).toEqual(VerticalLines.dash);
		border.bottomY = VerticalLines.dash;
		expect(getIntersections(border)).toEqual(VerticalLines.dash);
		border.topY = VerticalLines.line;
		expect(getIntersections(border)).toEqual(VerticalLines.dash);
		border.topY = VerticalLines.trippleDash;
		expect(getIntersections(border)).toEqual(VerticalLines.trippleDash);
		border.topY = VerticalLines.line;
		border.bottomY = VerticalLines.trippleDash;
		expect(getIntersections(border)).toEqual(VerticalLines.trippleDash);
		border.topY = VerticalLines.quadDash;
		expect(getIntersections(border)).toEqual(VerticalLines.quadDash);
		border.topY = VerticalLines.line;
		border.bottomY = VerticalLines.quadDash;
		expect(getIntersections(border)).toEqual(VerticalLines.quadDash);
	});

	test('special Vertical bold line', () => {
		const border = {
			topY: VerticalLines.dashBold,
			bottomY: VerticalLines.bold,
		};
		expect(getIntersections(border)).toEqual(VerticalLines.dashBold);
		border.bottomY = VerticalLines.dashBold;
		expect(getIntersections(border)).toEqual(VerticalLines.dashBold);
		border.topY = VerticalLines.bold;
		expect(getIntersections(border)).toEqual(VerticalLines.dashBold);
		border.topY = VerticalLines.trippleDashBold;
		expect(getIntersections(border)).toEqual(VerticalLines.trippleDashBold);
		border.topY = VerticalLines.bold;
		border.bottomY = VerticalLines.trippleDashBold;
		expect(getIntersections(border)).toEqual(VerticalLines.trippleDashBold);
		border.topY = VerticalLines.quadDashBold;
		expect(getIntersections(border)).toEqual(VerticalLines.quadDashBold);
		border.topY = VerticalLines.bold;
		border.bottomY = VerticalLines.quadDashBold;
		expect(getIntersections(border)).toEqual(VerticalLines.quadDashBold);
	});

	test('Vertical bold to line', () => {
		const border = {
			topY: VerticalLines.line,
			bottomY: VerticalLines.bold,
		};
		expect(getIntersections(border)).toEqual(VerticalLines.lineBold);
		border.bottomY = VerticalLines.dashBold;
		expect(getIntersections(border)).toEqual(VerticalLines.lineBold);
		border.topY = VerticalLines.dash;
		expect(getIntersections(border)).toEqual(VerticalLines.lineBold);
		border.topY = VerticalLines.trippleDash;
		expect(getIntersections(border)).toEqual(VerticalLines.lineBold);
		border.bottomY = VerticalLines.trippleDashBold;
		expect(getIntersections(border)).toEqual(VerticalLines.lineBold);
	});

	test('vertical line to bold', () => {
		const border = {
			topY: VerticalLines.bold,
			bottomY: VerticalLines.line,
		};
		expect(getIntersections(border)).toEqual(VerticalLines.boldLine);
		border.topY = VerticalLines.dashBold;
		expect(getIntersections(border)).toEqual(VerticalLines.boldLine);
		border.bottomY = VerticalLines.dash;
		expect(getIntersections(border)).toEqual(VerticalLines.boldLine);
		border.bottomY = VerticalLines.trippleDash;
		expect(getIntersections(border)).toEqual(VerticalLines.boldLine);
		border.topY = VerticalLines.trippleDashBold;
		expect(getIntersections(border)).toEqual(VerticalLines.boldLine);
	});

	test('double Vertical line', () => {
		const border = {
			topY: VerticalLines.double,
			bottomY: VerticalLines.double,
		};
		expect(getIntersections(border)).toEqual(VerticalLines.double);
		border.topY = VerticalLines.line;
		expect(getIntersections(border)).toEqual(VerticalLines.double);
		border.topY = VerticalLines.double;
		border.bottomY = VerticalLines.line;
		expect(getIntersections(border)).toEqual(VerticalLines.double);
		border.bottomY = VerticalLines.bold;
		expect(getIntersections(border)).toEqual(VerticalLines.double);
		border.bottomY = VerticalLines.double;
		border.topY = VerticalLines.bold;
		expect(getIntersections(border)).toEqual(VerticalLines.double);
	});
});
