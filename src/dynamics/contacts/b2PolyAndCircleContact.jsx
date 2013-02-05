import "common/*.jsx";
import "common/math/*.jsx";
import "collision/*.jsx";
import "collision/shapes/*.jsx";
import "dynamics/*.jsx";
import "dynamics/contacts/*.jsx";

class b2PolyAndCircleContact extends b2Contact {

	var m_manifold: b2Manifold[];

	function constructor(s1: b2PolyShape, s2: b2CircleShape) {
		super(s1, s2);
		this.m_manifold = [new b2Manifold()];

		b2Settings.b2Assert(this.m_shape1.m_type == b2Shape.e_polyShape);
		b2Settings.b2Assert(this.m_shape2.m_type == b2Shape.e_circleShape);

		this.m_manifold[0].pointCount = 0;
		this.m_manifold[0].points[0].normalImpulse = 0.0;
		this.m_manifold[0].points[0].tangentImpulse = 0.0;
	}

	override function Evaluate(): void {
		b2Collision.b2CollidePolyAndCircle(this.m_manifold[0], this.m_shape1 as __noconvert__ b2PolyShape, this.m_shape2 as __noconvert__ b2CircleShape, false);

		if (this.m_manifold[0].pointCount > 0)
		{
			this.m_manifoldCount = 1;
		}
		else
		{
			this.m_manifoldCount = 0;
		}
	}
	override function GetManifolds(): b2Manifold[]
	{
		return this.m_manifold;
	}

	static function Create(shape1: b2PolyShape, shape2: b2CircleShape, allocator: variant): b2PolyAndCircleContact {
		return new b2PolyAndCircleContact(shape1, shape2);
	}
	static function Destroy(contact: b2Contact, allocator: variant): void {
	}
}
