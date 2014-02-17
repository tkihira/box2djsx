import "../../common/*.jsx";
import "../../common/math/*.jsx";
import "../../collision/*.jsx";
import "../../collision/shapes/*.jsx";
import "../../dynamics/*.jsx";
import "../../dynamics/contacts/*.jsx";


class b2CircleContact extends b2Contact {
	var m_manifold: b2Manifold[];

	function constructor(s1: b2CircleShape, s2: b2CircleShape) {
		super(s1, s2);
		if(s1 == null || s2 == null) {
			debugger;
		}
		this.m_manifold = [new b2Manifold()];
		this.m_manifold[0].pointCount = 0;
		this.m_manifold[0].points[0].normalImpulse = 0.0;
		this.m_manifold[0].points[0].tangentImpulse = 0.0;
	}

	override function Evaluate(): void {
		b2Collision.b2CollideCircle(this.m_manifold[0], this.m_shape1 as __noconvert__ b2CircleShape, this.m_shape2 as __noconvert__ b2CircleShape, false);

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

	static function Create(shape1: b2CircleShape, shape2: b2CircleShape, allocator: variant): b2CircleContact {
		return new b2CircleContact(shape1, shape2);
	}
	static function Destroy(contact: b2Contact, allocator: variant): void {
	}
}
