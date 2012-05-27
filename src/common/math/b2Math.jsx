import "common/math/*.jsx";

class b2Math {
	static function b2IsValid(x: number): boolean {
		return Number.isFinite(x);
	}
	static function b2Dot(a: b2Vec2, b: b2Vec2): number {
		return a.x * b.x + a.y * b.y;
	}
	static function b2CrossVV(a: b2Vec2, b: b2Vec2): number {
		return a.x * b.y - a.y * b.x;
	}
	static function b2CrossVF(a: b2Vec2, s: number): b2Vec2 {
		var v = new b2Vec2(s * a.y, -s * a.x);
		return v;
	}
	static function b2CrossFV(s: number, a: b2Vec2): b2Vec2 {
		var v = new b2Vec2(-s * a.y, s * a.x);
		return v;
	}
	static function b2MulMV(A: b2Mat22, v: b2Vec2): b2Vec2 {
		var u = new b2Vec2(A.col1.x * v.x + A.col2.x * v.y, A.col1.y * v.x + A.col2.y * v.y);
		return u;
	}
	static function b2MulTMV(A: b2Mat22, v: b2Vec2): b2Vec2 {
		var u = new b2Vec2(b2Math.b2Dot(v, A.col1), b2Math.b2Dot(v, A.col2));
		return u;
	}
	static function AddVV(a: b2Vec2, b: b2Vec2): b2Vec2 {
		var v = new b2Vec2(a.x + b.x, a.y + b.y);
		return v;
	}
	static function SubtractVV(a: b2Vec2, b: b2Vec2): b2Vec2 {
		var v = new b2Vec2(a.x - b.x, a.y - b.y);
		return v;
	}
	static function MulFV(s: number, a: b2Vec2): b2Vec2 {
		var v = new b2Vec2(s * a.x, s * a.y);
		return v;
	}
	static function AddMM(A: b2Mat22, B: b2Mat22): b2Mat22 {
		var C = new b2Mat22(0, b2Math.AddVV(A.col1, B.col1), b2Math.AddVV(A.col2, B.col2));
		return C;
	}
	static function b2MulMM(A: b2Mat22, B: b2Mat22): b2Mat22 {
		var C = new b2Mat22(0, b2Math.b2MulMV(A, B.col1), b2Math.b2MulMV(A, B.col2));
		return C;
	}
	static function b2MulTMM(A: b2Mat22, B: b2Mat22): b2Mat22 {
		var c1 = new b2Vec2(b2Math.b2Dot(A.col1, B.col1), b2Math.b2Dot(A.col2, B.col1));
		var c2 = new b2Vec2(b2Math.b2Dot(A.col1, B.col2), b2Math.b2Dot(A.col2, B.col2));
		var C = new b2Mat22(0, c1, c2);
		return C;
	}
	static function b2Abs(a: number): number {
		return Math.abs(a);
		//return a > 0.0 ? a : -a;
	}
	static function b2AbsV(a:b2Vec2): b2Vec2 {
		var b = new b2Vec2(b2Math.b2Abs(a.x), b2Math.b2Abs(a.y));
		return b;
	}
	static function  b2AbsM(A: b2Mat22): b2Mat22 {
		var B = new b2Mat22(0, b2Math.b2AbsV(A.col1), b2Math.b2AbsV(A.col2));
		return B;
	}
	static function b2Min(a: number, b: number): number {
		return a < b ? a : b;
	}
	static function b2MinV(a: b2Vec2, b: b2Vec2): b2Vec2 {
		var c = new b2Vec2(b2Math.b2Min(a.x, b.x), b2Math.b2Min(a.y, b.y));
		return c;
	}
	static function b2Max(a: number, b: number): number {
		return a > b ? a : b;
	}
	static function b2MaxV(a: b2Vec2, b: b2Vec2): b2Vec2 {
		var c = new b2Vec2(b2Math.b2Max(a.x, b.x), b2Math.b2Max(a.y, b.y));
		return c;
	}
	static function b2Clamp(a: number, low: number, high: number): number {
		return b2Math.b2Max(low, b2Math.b2Min(a, high));
	}
	static function b2ClampV(a: b2Vec2, low: b2Vec2, high: b2Vec2): b2Vec2 {
		return b2Math.b2MaxV(low, b2Math.b2MinV(a, high));
	}
	/*
	static function b2Swap(a: , b)
	{
		var tmp = a[0];
		a[0] = b[0];
		b[0] = tmp;
	};
	*/
	static function b2Random(): number {
		return Math.random() * 2 - 1;
	}
	static function b2NextPowerOfTwo(x: int): int {
		x |= (x >> 1) & 0x7FFFFFFF;
		x |= (x >> 2) & 0x3FFFFFFF;
		x |= (x >> 4) & 0x0FFFFFFF;
		x |= (x >> 8) & 0x00FFFFFF;
		x |= (x >> 16)& 0x0000FFFF;
		return x + 1;
	}
	static function b2IsPowerOfTwo(x: number): boolean {
		var result = x > 0 && (x & (x - 1)) == 0;
		return result;
	}
	static var tempVec2 = new b2Vec2();
	static var tempVec3 = new b2Vec2();
	static var tempVec4 = new b2Vec2();
	static var tempVec5 = new b2Vec2();
	static var tempMat = new b2Mat22();
}
