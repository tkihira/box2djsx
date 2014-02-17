import "../common/*.jsx";
import "../common/math/*.jsx";
import "../collision/*.jsx";
import "../collision/shapes/*.jsx";
import "../dynamics/*.jsx";
import "../dynamics/contacts/*.jsx";


class b2Body {
	var m_flags: number;

	var m_position: b2Vec2;
	var m_rotation: number = 0;
	var m_R: b2Mat22;

	// Conservative advancement data.
	var m_position0: b2Vec2;
	var m_rotation0: number;

	var m_linearVelocity: b2Vec2;
	var m_angularVelocity: number;

	var m_force: b2Vec2;
	var m_torque: number;

	var m_center: b2Vec2;

	var m_world: b2World;
	var m_prev: b2Body;
	var m_next: b2Body;

	var m_shapeList: b2Shape;
	var m_shapeCount: number;

	var m_jointList: variant = null;
	var m_contactList: b2ContactNode = null;

	var m_mass: number;
	var m_invMass: number;
	var m_I: number;
	var m_invI: number;

	var m_linearDamping: number;
	var m_angularDamping: number;

	var m_sleepTime: number;

	var m_userData: variant;

	var sMat0: b2Mat22;

	function constructor(bd: b2BodyDef, world: b2World){
		// initialize instance variables for references
		this.sMat0 = new b2Mat22();
		this.m_position = new b2Vec2();
		this.m_R = new b2Mat22(0);
		this.m_position0 = new b2Vec2();
		//

		var i = 0;
		var sd;
		var massData;

		this.m_flags = 0;
		this.m_position.SetV( bd.position );
		this.m_rotation = bd.rotation;
		this.m_R.Set(this.m_rotation);
		this.m_position0.SetV(this.m_position);
		this.m_rotation0 = this.m_rotation;
		this.m_world = world;

		this.m_linearDamping = b2Math.b2Clamp(1.0 - bd.linearDamping, 0.0, 1.0);
		this.m_angularDamping = b2Math.b2Clamp(1.0 - bd.angularDamping, 0.0, 1.0);

		this.m_force = new b2Vec2(0.0, 0.0);
		this.m_torque = 0.0;

		this.m_mass = 0.0;

		var massDatas = []: b2MassData[]; massDatas.length = (b2Settings.b2_maxShapesPerBody);
		for (i = 0; i < b2Settings.b2_maxShapesPerBody; i++){
			massDatas[i] = new b2MassData();
		}

		// Compute the shape mass properties, the bodies total mass and COM.
		this.m_shapeCount = 0;
		this.m_center = new b2Vec2(0.0, 0.0);
		for (i = 0; i < b2Settings.b2_maxShapesPerBody; ++i)
		{
			sd = bd.shapes[i];
			if (sd == null) break;
			massData = massDatas[ i ];
			sd.ComputeMass(massData);
			this.m_mass += massData.mass;
			//this.m_center += massData->mass * (sd->localPosition + massData->center);
			this.m_center.x += massData.mass * (sd.localPosition.x + massData.center.x);
			this.m_center.y += massData.mass * (sd.localPosition.y + massData.center.y);
			++this.m_shapeCount;
		}

		// Compute center of mass, and shift the origin to the COM.
		if (this.m_mass > 0.0)
		{
			this.m_center.Multiply( 1.0 / this.m_mass );
			this.m_position.Add( b2Math.b2MulMV(this.m_R, this.m_center) );
		}
		else
		{
			this.m_flags |= b2Body.e_staticFlag;
		}

		// Compute the moment of inertia.
		this.m_I = 0.0;
		for (i = 0; i < this.m_shapeCount; ++i)
		{
			sd = bd.shapes[i];
			massData = massDatas[ i ];
			this.m_I += massData.I;
			var r = b2Math.SubtractVV( b2Math.AddVV(sd.localPosition, massData.center), this.m_center );
			this.m_I += massData.mass * b2Math.b2Dot(r, r);
		}

		if (this.m_mass > 0.0)
		{
			this.m_invMass = 1.0 / this.m_mass;
		}
		else
		{
			this.m_invMass = 0.0;
		}

		if (this.m_I > 0.0 && bd.preventRotation == false)
		{
			this.m_invI = 1.0 / this.m_I;
		}
		else
		{
			this.m_I = 0.0;
			this.m_invI = 0.0;
		}

		// Compute the center of mass velocity.
		this.m_linearVelocity = b2Math.AddVV(bd.linearVelocity, b2Math.b2CrossFV(bd.angularVelocity, this.m_center));
		this.m_angularVelocity = bd.angularVelocity;

		this.m_jointList = null;
		this.m_contactList = null;
		this.m_prev = null;
		this.m_next = null;

		// Create the shapes.
		this.m_shapeList = null;
		for (i = 0; i < this.m_shapeCount; ++i)
		{
			sd = bd.shapes[i];
			var shape = b2Shape.Create(sd, this, this.m_center);
			shape.m_next = this.m_shapeList;
			this.m_shapeList = shape;
		}

		this.m_sleepTime = 0.0;
		if (bd.allowSleep)
		{
			this.m_flags |= b2Body.e_allowSleepFlag;
		}
		if (bd.isSleeping)
		{
			this.m_flags |= b2Body.e_sleepFlag;
		}

		if ((this.m_flags & b2Body.e_sleepFlag) != 0 || this.m_invMass == 0.0)
		{
			this.m_linearVelocity.Set(0.0, 0.0);
			this.m_angularVelocity = 0.0;
		}

		this.m_userData = bd.userData;
	}

	function SetOriginPosition(position: b2Vec2, rotation: number): void {
		if (this.IsFrozen())
		{
			return;
		}

		this.m_rotation = rotation;
		this.m_R.Set(this.m_rotation);
		this.m_position = b2Math.AddVV(position , b2Math.b2MulMV(this.m_R, this.m_center));

		this.m_position0.SetV(this.m_position);
		this.m_rotation0 = this.m_rotation;

		for (var s = this.m_shapeList; s != null; s = s.m_next)
		{
			s.Synchronize(this.m_position, this.m_R, this.m_position, this.m_R);
		}

		this.m_world.m_broadPhase.Commit();
	}

	function GetOriginPosition(): b2Vec2 {
		return b2Math.SubtractVV(this.m_position, b2Math.b2MulMV(this.m_R, this.m_center));
	}

	function SetCenterPosition(position: b2Vec2, rotation: number): void {
		if (this.IsFrozen())
		{
			return;
		}

		this.m_rotation = rotation;
		this.m_R.Set(this.m_rotation);
		this.m_position.SetV( position );

		this.m_position0.SetV(this.m_position);
		this.m_rotation0 = this.m_rotation;

		for (var s = this.m_shapeList; s != null; s = s.m_next)
		{
			s.Synchronize(this.m_position, this.m_R, this.m_position, this.m_R);
		}

		this.m_world.m_broadPhase.Commit();
	}

	function GetCenterPosition(): b2Vec2 {
		return this.m_position;
	}

	// Get the rotation in radians.
	function GetRotation(): number{
		return this.m_rotation;
	}

	function GetRotationMatrix(): b2Mat22{
		return this.m_R;
	}

	// Set/Get the linear velocity of the center of mass.
	function SetLinearVelocity(v: b2Vec2): void {
		this.m_linearVelocity.SetV(v);
	}
	function GetLinearVelocity(): b2Vec2 {
		return this.m_linearVelocity;
	}

	function SetAngularVelocity(w: number): void{
		this.m_angularVelocity = w;
	}
	function GetAngularVelocity(): number{
		return this.m_angularVelocity;
	}


	function ApplyForce(force: b2Vec2, point: b2Vec2): void	{
		if (this.IsSleeping() == false)
		{
			this.m_force.Add( force );
			this.m_torque += b2Math.b2CrossVV(b2Math.SubtractVV(point, this.m_position), force);
		}
	}

	function ApplyTorque(torque: number): void {
		if (this.IsSleeping() == false)
		{
			this.m_torque += torque;
		}
	}

	function ApplyImpulse(impulse: b2Vec2, point: b2Vec2): void {
		if (this.IsSleeping() == false)
		{
			this.m_linearVelocity.Add( b2Math.MulFV(this.m_invMass, impulse) );
			this.m_angularVelocity += ( this.m_invI * b2Math.b2CrossVV( b2Math.SubtractVV(point, this.m_position), impulse)  );
		}
	}

	function GetMass(): number {
		return this.m_mass;
	}
	function GetInertia(): number {
		return this.m_I;
	}


	function GetWorldPoint(localPoint: b2Vec2): b2Vec2 {
		return b2Math.AddVV(this.m_position , b2Math.b2MulMV(this.m_R, localPoint));
	}

	function GetWorldVector(localVector: b2Vec2): b2Vec2 {
		return b2Math.b2MulMV(this.m_R, localVector);
	}

	// Returns a local point relative to the center of mass given a world point.
	function GetLocalPoint(worldPoint: b2Vec2): b2Vec2{
		return b2Math.b2MulTMV(this.m_R, b2Math.SubtractVV(worldPoint, this.m_position));
	}

	// Returns a local vector given a world vector.
	function GetLocalVector(worldVector: b2Vec2): b2Vec2 {
		return b2Math.b2MulTMV(this.m_R, worldVector);
	}


	function IsStatic(): boolean {
		return (this.m_flags & b2Body.e_staticFlag) == b2Body.e_staticFlag;
	}

	function IsFrozen(): boolean {
		return (this.m_flags & b2Body.e_frozenFlag) == b2Body.e_frozenFlag;
	}

	// Is this body sleeping (not simulating).
	function IsSleeping(): boolean {
		return (this.m_flags & b2Body.e_sleepFlag) == b2Body.e_sleepFlag;
	}


	function AllowSleeping(flag: boolean) :void {
		if (flag)
		{
			this.m_flags |= b2Body.e_allowSleepFlag;
		}
		else
		{
			this.m_flags &= ~b2Body.e_allowSleepFlag;
			this.WakeUp();
		}
	}

	function WakeUp(): void {
		this.m_flags &= ~b2Body.e_sleepFlag;
		this.m_sleepTime = 0.0;
	}

	function GetShapeList(): b2Shape {
		return this.m_shapeList;
	}

	function GetContactList(): b2ContactNode {
		return this.m_contactList;
	}

	function GetJointList(): variant {
		return this.m_jointList;
	}

	// Get the next body in the world's body list.
	function GetNext(): b2Body {
		return this.m_next;
	}

	function GetUserData(): variant {
		return this.m_userData;
	}

	function Destroy(): void {
		var s = this.m_shapeList;
		while (s != null)
		{
			var s0 = s;
			s = s.m_next;

			b2Shape.Destroy(s0);
		}
	}

	function SynchronizeShapes(): void {
		//b2Mat22 R0(this.m_rotation0);
		this.sMat0.Set(this.m_rotation0);
		for (var s = this.m_shapeList; s != null; s = s.m_next)
		{
			s.Synchronize(this.m_position0, this.sMat0, this.m_position, this.m_R);
		}
	}

	function QuickSyncShapes(): void {
		for (var s = this.m_shapeList; s != null; s = s.m_next)
		{
			s.QuickSync(this.m_position, this.m_R);
		}
	}

	function IsConnected(other: variant): boolean {return false;}
	/*function IsConnected(other: variant): boolean {
		debugger;
		for (var jn = this.m_jointList; jn != null; jn = jn.next)
		{
			if (jn.other == other)
				return jn.joint.m_collideConnected == false;
		}

		return false;
	}*/


	function Freeze(): void{
		this.m_flags |= b2Body.e_frozenFlag;
		this.m_linearVelocity.SetZero();
		this.m_angularVelocity = 0.0;

		for (var s = this.m_shapeList; s != null; s = s.m_next)
		{
			s.DestroyProxy();
		}
	}

	static const e_staticFlag = 0x0001;
	static const e_frozenFlag = 0x0002;
	static const e_islandFlag = 0x0004;
	static const e_sleepFlag = 0x0008;
	static const e_allowSleepFlag = 0x0010;
	static const e_destroyFlag = 0x0020;
}
