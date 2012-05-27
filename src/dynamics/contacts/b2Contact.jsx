import "common/*.jsx";
import "common/math/*.jsx";
import "collision/*.jsx";
import "collision/shapes/*.jsx";
import "dynamics/*.jsx";
import "dynamics/contacts/*.jsx";

class b2Contact {
	var m_flags: number;

	// World pool and list pointers.
	var m_prev: b2Contact = null;
	var m_next: b2Contact = null;

	// Nodes for connecting bodies.
	var m_node1: b2ContactNode;
	var m_node2: b2ContactNode;

	var m_shape1: b2Shape;
	var m_shape2: b2Shape;

	var m_manifoldCount = 0;

	// Combined friction
	var m_friction = 0;
	var m_restitution = 0;

	function constructor(s1: b2Shape, s2: b2Shape) {
		this.m_node1 = new b2ContactNode();
		this.m_node2 = new b2ContactNode();

		this.m_flags = 0;

		if (s1 == null || s2 == null){
			this.m_shape1 = null;
			this.m_shape2 = null;
			return;
		}

		this.m_shape1 = s1;
		this.m_shape2 = s2;

		this.m_manifoldCount = 0;

		this.m_friction = Math.sqrt(this.m_shape1.m_friction * this.m_shape2.m_friction);
		this.m_restitution = b2Math.b2Max(this.m_shape1.m_restitution, this.m_shape2.m_restitution);

		this.m_prev = null;
		this.m_next = null;

		this.m_node1.contact = null;
		this.m_node1.prev = null;
		this.m_node1.next = null;
		this.m_node1.other = null;

		this.m_node2.contact = null;
		this.m_node2.prev = null;
		this.m_node2.next = null;
		this.m_node2.other = null;
	}
	function constructor() {
		this.constructor(null, null);
	}
	
	function GetManifolds(): b2Manifold[] {return null;}
	function GetManifoldCount(): number {
		return this.m_manifoldCount;
	}

	function GetNext(): b2Contact {
		return this.m_next;
	}

	function GetShape1(): b2Shape {
		return this.m_shape1;
	}

	function GetShape2(): b2Shape {
		return this.m_shape2;
	}
	
	function Evaluate(): void {}

	static var e_islandFlag = 0x0001;
	static var e_destroyFlag = 0x0002;
	/*
	static function AddType = function(createFcn, destroyFcn, type1, type2) {
		//b2Settings.b2Assert(b2Shape.e_unknownShape < type1 && type1 < b2Shape.e_shapeTypeCount);
		//b2Settings.b2Assert(b2Shape.e_unknownShape < type2 && type2 < b2Shape.e_shapeTypeCount);

		b2Contact.s_registers[type1][type2].createFcn = createFcn;
		b2Contact.s_registers[type1][type2].destroyFcn = destroyFcn;
		b2Contact.s_registers[type1][type2].primary = true;

		if (type1 != type2)
		{
			b2Contact.s_registers[type2][type1].createFcn = createFcn;
			b2Contact.s_registers[type2][type1].destroyFcn = destroyFcn;
			b2Contact.s_registers[type2][type1].primary = false;
		}
	}*/
	
}