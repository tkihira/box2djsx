import "common/*.jsx";
import "common/math/*.jsx";
import "collision/*.jsx";
import "collision/shapes/*.jsx";
import "dynamics/*.jsx";

class b2CircleShape extends b2Shape {
	var m_localPosition: b2Vec2 = new b2Vec2();
	var m_radius = 0;
	
	function TestPoint(p: b2Vec2): boolean{
		//var d = b2Math.SubtractVV(p, this.m_position);
		var d = new b2Vec2();
		d.SetV(p);
		d.Subtract(this.m_position);
		return b2Math.b2Dot(d, d) <= this.m_radius * this.m_radius;
	}
	
	function constructor(def: b2CircleDef, body: b2Body, localCenter: b2Vec2) {
		// initialize instance variables for references
		super(def, body);
		/*
		this.m_R = new b2Mat22();
		this.m_position = new b2Vec2();
		//

		// The constructor for b2Shape
		this.m_userData = def.userData;

		this.m_friction = def.friction;
		this.m_restitution = def.restitution;
		this.m_body = body;

		this.m_proxyId = b2Pair.b2_nullProxy;

		this.m_maxRadius = 0.0;

		this.m_categoryBits = def.categoryBits;
		this.m_maskBits = def.maskBits;
		this.m_groupIndex = def.groupIndex;
		//
		*/

		// initialize instance variables for references
		this.m_localPosition = new b2Vec2();
		//

		//super(def, body);

		//b2Settings.b2Assert(def.type == b2Shape.e_circleShape);
		var circle = def;

		//this.m_localPosition = def.localPosition - localCenter;
		this.m_localPosition.Set(def.localPosition.x - localCenter.x, def.localPosition.y - localCenter.y);
		this.m_type = b2Shape.e_circleShape;
		this.m_radius = circle.radius;

		this.m_R.SetM(this.m_body.m_R);
		//b2Vec2 r = b2Mul(this.m_body->this.m_R, this.m_localPosition);
		var rX = this.m_R.col1.x * this.m_localPosition.x + this.m_R.col2.x * this.m_localPosition.y;
		var rY = this.m_R.col1.y * this.m_localPosition.x + this.m_R.col2.y * this.m_localPosition.y;
		//this.m_position = this.m_body->this.m_position + r;
		this.m_position.x = this.m_body.m_position.x + rX;
		this.m_position.y = this.m_body.m_position.y + rY;
		//this.m_maxRadius = r.Length() + this.m_radius;
		this.m_maxRadius = Math.sqrt(rX*rX+rY*rY) + this.m_radius;

		var aabb = new b2AABB();
		aabb.minVertex.Set(this.m_position.x - this.m_radius, this.m_position.y - this.m_radius);
		aabb.maxVertex.Set(this.m_position.x + this.m_radius, this.m_position.y + this.m_radius);

		var broadPhase = this.m_body.m_world.m_broadPhase;
		if (broadPhase.InRange(aabb))
		{
			this.m_proxyId = broadPhase.CreateProxy(aabb, this);
		}
		else
		{
			this.m_proxyId = b2Pair.b2_nullProxy;
		}

		if (this.m_proxyId == b2Pair.b2_nullProxy)
		{
			this.m_body.Freeze();
		}
	}
	
	function Synchronize(position1: b2Vec2, R1: b2Mat22, position2: b2Vec2, R2: b2Mat22): void {
		this.m_R.SetM(R2);
		//this.m_position = position2 + b2Mul(R2, this.m_localPosition);
		this.m_position.x = (R2.col1.x * this.m_localPosition.x + R2.col2.x * this.m_localPosition.y) + position2.x;
		this.m_position.y = (R2.col1.y * this.m_localPosition.x + R2.col2.y * this.m_localPosition.y) + position2.y;

		if (this.m_proxyId == b2Pair.b2_nullProxy)
		{
			return;
		}

		// Compute an AABB that covers the swept shape (may miss some rotation effect).
		//b2Vec2 p1 = position1 + b2Mul(R1, this.m_localPosition);
		var p1X = position1.x + (R1.col1.x * this.m_localPosition.x + R1.col2.x * this.m_localPosition.y);
		var p1Y = position1.y + (R1.col1.y * this.m_localPosition.x + R1.col2.y * this.m_localPosition.y);
		//b2Vec2 lower = b2Min(p1, this.m_position);
		var lowerX = Math.min(p1X, this.m_position.x);
		var lowerY = Math.min(p1Y, this.m_position.y);
		//b2Vec2 upper = b2Max(p1, this.m_position);
		var upperX = Math.max(p1X, this.m_position.x);
		var upperY = Math.max(p1Y, this.m_position.y);

		var aabb = new b2AABB();
		aabb.minVertex.Set(lowerX - this.m_radius, lowerY - this.m_radius);
		aabb.maxVertex.Set(upperX + this.m_radius, upperY + this.m_radius);

		var broadPhase = this.m_body.m_world.m_broadPhase;
		if (broadPhase.InRange(aabb))
		{
			broadPhase.MoveProxy(this.m_proxyId, aabb);
		}
		else
		{
			this.m_body.Freeze();
		}
	}
	
	function QuickSync(position: b2Vec2, R: b2Mat22): void {
		this.m_R.SetM(R);
		//this.m_position = position + b2Mul(R, this.m_localPosition);
		this.m_position.x = (R.col1.x * this.m_localPosition.x + R.col2.x * this.m_localPosition.y) + position.x;
		this.m_position.y = (R.col1.y * this.m_localPosition.x + R.col2.y * this.m_localPosition.y) + position.y;
	}
	
	function ResetProxy(broadPhase: b2BroadPhase): void {
		if (this.m_proxyId == b2Pair.b2_nullProxy)
		{
			return;
		}

		var proxy = broadPhase.GetProxy(this.m_proxyId);

		broadPhase.DestroyProxy(this.m_proxyId);
		proxy = null;

		var aabb = new b2AABB();
		aabb.minVertex.Set(this.m_position.x - this.m_radius, this.m_position.y - this.m_radius);
		aabb.maxVertex.Set(this.m_position.x + this.m_radius, this.m_position.y + this.m_radius);

		if (broadPhase.InRange(aabb))
		{
			this.m_proxyId = broadPhase.CreateProxy(aabb, this);
		}
		else
		{
			this.m_proxyId = b2Pair.b2_nullProxy;
		}

		if (this.m_proxyId == b2Pair.b2_nullProxy)
		{
			this.m_body.Freeze();
		}
	}
	
	function Support(dX: number, dY: number, out: b2Vec2): void {
		//b2Vec2 u = d;
		//u.Normalize();
		var len = Math.sqrt(dX*dX + dY*dY);
		dX /= len;
		dY /= len;
		//return this.m_position + this.m_radius * u;
		out.Set(	this.m_position.x + this.m_radius*dX,
					this.m_position.y + this.m_radius*dY);
	}
}
