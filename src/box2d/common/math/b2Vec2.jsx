import "../../common/math/*.jsx";

class b2Vec2 {
	var x: number;
	var y: number;
	function constructor() {
		this.SetZero();
	}
	function constructor(x: number, y: number) {
		this.Set(x, y);
	}
	function SetZero(): void {
		this.x = 0;
		this.y = 0;
	}
	function Set(x: number, y: number): void {
		this.x = x;
		this.y = y;
	}
	function SetV(v: b2Vec2): void {
		this.x = v.x;
		this.y = v.y;
	}

	function Negative(): b2Vec2 {
		return new b2Vec2(-this.x, -this.y);
	}

	function Copy(): b2Vec2{
		return new b2Vec2(this.x, this.y);
	}

	function Add(v: b2Vec2): void {
		this.x += v.x; this.y += v.y;
	}

	function Subtract(v: b2Vec2): void {
		this.x -= v.x; this.y -= v.y;
	}

	function Multiply(a: number): void {
		this.x *= a; this.y *= a;
	}

	function MulM(A: b2Mat22): void {
		var tX = this.x;
		this.x = A.col1.x * tX + A.col2.x * this.y;
		this.y = A.col1.y * tX + A.col2.y * this.y;
	}

	function MulTM(A: b2Mat22): void {
		var tX = b2Math.b2Dot(this, A.col1);
		this.y = b2Math.b2Dot(this, A.col2);
		this.x = tX;
	}

	function CrossVF(s: number): void {
		var tX = this.x;
		this.x = s * this.y;
		this.y = -s * tX;
	}

	function CrossFV(s: number): void {
		var tX = this.x;
		this.x = -s * this.y;
		this.y = s * tX;
	}

	function MinV(b: b2Vec2): void {
		this.x = this.x < b.x ? this.x : b.x;
		this.y = this.y < b.y ? this.y : b.y;
	}

	function MaxV(b: b2Vec2): void {
		this.x = this.x > b.x ? this.x : b.x;
		this.y = this.y > b.y ? this.y : b.y;
	}

	function Abs(): void {
		this.x = Math.abs(this.x);
		this.y = Math.abs(this.y);
	}

	function Length(): number {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}

	function Normalize(): number {
		var length = this.Length();
		if (length < Number.MIN_VALUE) {
			return 0.0;
		}
		var invLength = 1.0 / length;
		this.x *= invLength;
		this.y *= invLength;

		return length;
	}

	function IsValid(): boolean {
		return b2Math.b2IsValid(this.x) && b2Math.b2IsValid(this.y);
	}

	static function Make(x: number, y: number): b2Vec2 {
		return new b2Vec2(x, y);
	}
}
