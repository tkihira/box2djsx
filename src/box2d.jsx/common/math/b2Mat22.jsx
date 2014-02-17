import "../../common/math/*.jsx";

class b2Mat22 {
	var col1: b2Vec2;
	var col2: b2Vec2;
	function initializer(angle: number, c1: b2Vec2, c2: b2Vec2): void {
		this.col1 = new b2Vec2();
		this.col2 = new b2Vec2();
		if(c1 != null && c2 != null) {
			this.col1.SetV(c1);
			this.col2.SetV(c2);
		} else {
			var c = Math.cos(angle);
			var s = Math.sin(angle);
			this.col1.x = c; this.col2.x = -s;
			this.col1.y = s; this.col2.y = c;
		}
	}
	function constructor(angle: number, c1: b2Vec2, c2: b2Vec2) {
		this.initializer(angle, c1, c2);
	}
	function constructor(angle: number) {
		this.initializer(angle, null, null);
	}
	function constructor() {
		this.initializer(0, null, null);
	}

	function Set(angle: number): void {
		var c = Math.cos(angle);
		var s = Math.sin(angle);
		this.col1.x = c; this.col2.x = -s;
		this.col1.y = s; this.col2.y = c;
	}

	function SetVV(c1: b2Vec2, c2: b2Vec2): void {
		this.col1.SetV(c1);
		this.col2.SetV(c2);
	}

	function Copy(): b2Mat22 {
		return new b2Mat22(0, this.col1, this.col2);
	}

	function SetM(m: b2Mat22): void {
		this.col1.SetV(m.col1);
		this.col2.SetV(m.col2);
	}

	function AddM(m: b2Mat22): void {
		this.col1.x += m.col1.x;
		this.col1.y += m.col1.y;
		this.col2.x += m.col2.x;
		this.col2.y += m.col2.y;
	}

	function SetIdentity(): void {
		this.col1.x = 1.0; this.col2.x = 0.0;
		this.col1.y = 0.0; this.col2.y = 1.0;
	}

	function SetZero(): void {
		this.col1.x = 0.0; this.col2.x = 0.0;
		this.col1.y = 0.0; this.col2.y = 0.0;
	}

	function Invert(out: b2Mat22): b2Mat22 {
		var a = this.col1.x;
		var b = this.col2.x;
		var c = this.col1.y;
		var d = this.col2.y;
		//var B = new b2Mat22();
		var det = a * d - b * c;
		//b2Settings.b2Assert(det != 0.0);
		det = 1.0 / det;
		out.col1.x =  det * d;	out.col2.x = -det * b;
		out.col1.y = -det * c;	out.col2.y =  det * a;
		return out;
	}

	// this.Solve A * x = b
	function Solve(out: b2Vec2, bX: number, bY: number): b2Vec2 {
		//float32 a11 = this.col1.x, a12 = this.col2.x, a21 = this.col1.y, a22 = this.col2.y;
		var a11 = this.col1.x;
		var a12 = this.col2.x;
		var a21 = this.col1.y;
		var a22 = this.col2.y;
		//float32 det = a11 * a22 - a12 * a21;
		var det = a11 * a22 - a12 * a21;
		//b2Settings.b2Assert(det != 0.0);
		det = 1.0 / det;
		out.x = det * (a22 * bX - a12 * bY);
		out.y = det * (a11 * bY - a21 * bX);

		return out;
	}

	function Abs(): void {
		this.col1.Abs();
		this.col2.Abs();
	}
}
