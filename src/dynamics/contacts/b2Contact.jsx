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

	function initializer(s1: b2Shape, s2: b2Shape): void {
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
	function constructor(s1: b2Shape, s2: b2Shape) {
		this.initializer(s1, s2);
	}
	function constructor() {
		this.initializer(null, null);
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

	static const e_islandFlag = 0x0001;
	static const e_destroyFlag = 0x0002;
	
	
	static function AddType(createFcn: function(:b2Shape, :b2Shape, :variant):b2Contact, destroyFcn: function(:b2Contact, :variant):void, type1: number, type2: number): void {
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
	}

	static function InitializeRegisters(): void{
		b2Contact.s_registers = []: b2ContactRegister[][]; b2Contact.s_registers.length = (b2Shape.e_shapeTypeCount);
		for (var i = 0; i < b2Shape.e_shapeTypeCount; i++){
			b2Contact.s_registers[i] = []: b2ContactRegister[]; b2Contact.s_registers[i].length = (b2Shape.e_shapeTypeCount);
			for (var j = 0; j < b2Shape.e_shapeTypeCount; j++){
				b2Contact.s_registers[i][j] = new b2ContactRegister();
			}
		}

		var c: function(:b2Shape, :b2Shape, :variant):b2Contact;
		var d: function(:b2Contact, :variant):void;
		c = function(s1:b2Shape, s2:b2Shape, al:variant):b2Contact {
			return b2CircleContact.Create(s1 as __noconvert__ b2CircleShape, s2 as __noconvert__ b2CircleShape, al);
		};
		d = function(c: b2Contact, al: variant): void {
			b2CircleContact.Destroy(c, al);
		};
		b2Contact.AddType(c, d, b2Shape.e_circleShape, b2Shape.e_circleShape);
		c = function(s1:b2Shape, s2:b2Shape, al:variant):b2Contact {
			return b2PolyAndCircleContact.Create(s1 as __noconvert__ b2PolyShape, s2 as __noconvert__ b2CircleShape, al);
		};
		d = function(c: b2Contact, al: variant): void {
			b2PolyAndCircleContact.Destroy(c, al);
		};
		b2Contact.AddType(c, d, b2Shape.e_polyShape, b2Shape.e_circleShape);
		c = function(s1:b2Shape, s2:b2Shape, al:variant):b2Contact {
			return b2PolyContact.Create(s1 as __noconvert__ b2PolyShape, s2 as __noconvert__ b2PolyShape, al);
		};
		d = function(c: b2Contact, al: variant): void {
			b2PolyContact.Destroy(c, al);
		};
		b2Contact.AddType(c, d, b2Shape.e_polyShape, b2Shape.e_polyShape);

	}

	static function Create(shape1: b2Shape, shape2: b2Shape, allocator: variant): b2Contact {
		if (b2Contact.s_initialized == false)
		{
			b2Contact.InitializeRegisters();
			b2Contact.s_initialized = true;
		}

		var type1 = shape1.m_type;
		var type2 = shape2.m_type;

		//b2Settings.b2Assert(b2Shape.e_unknownShape < type1 && type1 < b2Shape.e_shapeTypeCount);
		//b2Settings.b2Assert(b2Shape.e_unknownShape < type2 && type2 < b2Shape.e_shapeTypeCount);

		var createFcn = b2Contact.s_registers[type1][type2].createFcn;
		if (createFcn != null)
		{
			if (b2Contact.s_registers[type1][type2].primary)
			{
				return createFcn(shape1, shape2, allocator);
			}
			else
			{
				var c = createFcn(shape2, shape1, allocator);
				for (var i = 0; i < c.GetManifoldCount(); ++i)
				{
					var m = c.GetManifolds()[ i ];
					m.normal = m.normal.Negative();
				}
				return c;
			}
		}
		else
		{
			return null;
		}
	}
	static function Destroy(contact: b2Contact, allocator: variant): void {
		//b2Settings.b2Assert(b2Contact.s_initialized == true);

		if (contact.GetManifoldCount() > 0)
		{
			contact.m_shape1.m_body.WakeUp();
			contact.m_shape2.m_body.WakeUp();
		}

		var type1 = contact.m_shape1.m_type;
		var type2 = contact.m_shape2.m_type;

		//b2Settings.b2Assert(b2Shape.e_unknownShape < type1 && type1 < b2Shape.e_shapeTypeCount);
		//b2Settings.b2Assert(b2Shape.e_unknownShape < type2 && type2 < b2Shape.e_shapeTypeCount);

		var destroyFcn = b2Contact.s_registers[type1][type2].destroyFcn;
		destroyFcn(contact, allocator);
	}
	
	static var s_registers: b2ContactRegister[][] = null;
	static var s_initialized = false;
}