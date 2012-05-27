import "common/*.jsx";
import "common/math/*.jsx";
import "collision/*.jsx";
import "collision/shapes/*.jsx";
import "dynamics/*.jsx";

class b2ShapeDef {
	var type: number;
	var userData: variant;
	var localPosition: b2Vec2;
	var localRotation: number;
	var friction: number;
	var restitution: number;
	var density: number;
	var categoryBits: number;
	var maskBits: number;
	var groupIndex: number;
	
	function constructor()
	{
		this.type = b2Shape.e_unknownShape;
		this.userData = null;
		this.localPosition = new b2Vec2(0.0, 0.0);
		this.localRotation = 0.0;
		this.friction = 0.2;
		this.restitution = 0.0;
		this.density = 0.0;
		this.categoryBits = 0x0001;
		this.maskBits = 0xFFFF;
		this.groupIndex = 0;
	}

	function ComputeMass(massData: b2MassData): void {

		massData.center = new b2Vec2(0.0, 0.0);

		if (this.density == 0.0)
		{
			massData.mass = 0.0;
			massData.center.Set(0.0, 0.0);
			massData.I = 0.0;
		};

		switch (this.type)
		{
		case b2Shape.e_circleShape:
			{
				var circle: b2CircleDef = this as b2CircleDef;
				massData.mass = this.density * b2Settings.b2_pi * circle.radius * circle.radius;
				massData.center.Set(0.0, 0.0);
				massData.I = 0.5 * (massData.mass) * circle.radius * circle.radius;
			}
			break;

		case b2Shape.e_boxShape:
			{
				var box: b2BoxDef = this as b2BoxDef;
				massData.mass = 4.0 * this.density * box.extents.x * box.extents.y;
				massData.center.Set(0.0, 0.0);
				massData.I = massData.mass / 3.0 * b2Math.b2Dot(box.extents, box.extents);
			}
			break;

		case b2Shape.e_polyShape:
			{
				var poly: b2PolyDef = this as b2PolyDef;
				b2Shape.PolyMass(massData, poly.vertices, poly.vertexCount, this.density);
			}
			break;

		default:
			massData.mass = 0.0;
			massData.center.Set(0.0, 0.0);
			massData.I = 0.0;
			break;
		}
	}

}
