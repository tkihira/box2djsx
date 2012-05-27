import "common/*.jsx";
import "common/math/*.jsx";
import "collision/*.jsx";
import "collision/shapes/*.jsx";
import "dynamics/*.jsx";
import "dynamics/contacts/*.jsx";

class b2Island {
	var m_allocator: variant;

	var m_bodies: b2Body[];
	var m_contacts: b2Contact[];
	var m_joints: variant[];

	var m_bodyCount: number;
	var m_jointCount: number;
	var m_contactCount: number;

	var m_bodyCapacity: number;
	var m_contactCapacity: number;
	var m_jointCapacity: number;

	var m_positionError: variant = null;
	
	function constructor(bodyCapacity: number, contactCapacity: number, jointCapacity: number, allocator: variant)
	{
		var i = 0;

		this.m_bodyCapacity = bodyCapacity;
		this.m_contactCapacity = contactCapacity;
		this.m_jointCapacity	 = jointCapacity;
		this.m_bodyCount = 0;
		this.m_contactCount = 0;
		this.m_jointCount = 0;


		//this.m_bodies = (b2Body**)allocator->Allocate(bodyCapacity * sizeof(b2Body*));
		this.m_bodies = []: b2Body[]; this.m_bodies.length = (bodyCapacity);
		for (i = 0; i < bodyCapacity; i++)
			this.m_bodies[i] = null;

		//this.m_contacts = (b2Contact**)allocator->Allocate(contactCapacity	 * sizeof(b2Contact*));
		this.m_contacts = []: b2Contact[]; this.m_contacts.length = (contactCapacity);
		for (i = 0; i < contactCapacity; i++)
			this.m_contacts[i] = null;

		//this.m_joints = (b2Joint**)allocator->Allocate(jointCapacity * sizeof(b2Joint*));
		this.m_joints = []: variant[]; this.m_joints.length = (jointCapacity);
		for (i = 0; i < jointCapacity; i++)
			this.m_joints[i] = null;

		this.m_allocator = allocator;
	}
	
	function Clear(): void
	{
		this.m_bodyCount = 0;
		this.m_contactCount = 0;
		this.m_jointCount = 0;
	}
	
	function Solve(step: b2TimeStep, gravity: b2Vec2): void {
		var i = 0;
		var b;

		for (i = 0; i < this.m_bodyCount; ++i)
		{
			b = this.m_bodies[i];

			if (b.m_invMass == 0.0)
				continue;

			b.m_linearVelocity.Add( b2Math.MulFV (step.dt, b2Math.AddVV(gravity, b2Math.MulFV( b.m_invMass, b.m_force ) ) ) );
			b.m_angularVelocity += step.dt * b.m_invI * b.m_torque;

			//b.m_linearVelocity *= b.m_linearDamping;
			b.m_linearVelocity.Multiply(b.m_linearDamping);
			b.m_angularVelocity *= b.m_angularDamping;

			// Store positions for conservative advancement.
			b.m_position0.SetV(b.m_position);
			b.m_rotation0 = b.m_rotation;
		}

		var contactSolver = new b2ContactSolver(this.m_contacts, this.m_contactCount, this.m_allocator);

		// Pre-solve
		contactSolver.PreSolve();

		for (i = 0; i < this.m_jointCount; ++i)
		{
			debugger;
			//this.m_joints[i].PrepareVelocitySolver();
		}

		// this.Solve velocity constraints.
		for (i = 0; i < step.iterations; ++i)
		{
			contactSolver.SolveVelocityConstraints();

			for (var j = 0; j < this.m_jointCount; ++j)
			{
				debugger;
				//this.m_joints[j].SolveVelocityConstraints(step);
			}
		}

		// Integrate positions.
		for (i = 0; i < this.m_bodyCount; ++i)
		{
			b = this.m_bodies[i];

			if (b.m_invMass == 0.0)
				continue;

			//b.m_position.Add( b2Math.MulFV (step.dt, b.m_linearVelocity) );
			b.m_position.x += step.dt * b.m_linearVelocity.x;
			b.m_position.y += step.dt * b.m_linearVelocity.y;
			b.m_rotation += step.dt * b.m_angularVelocity;

			b.m_R.Set(b.m_rotation);
		}

		for (i = 0; i < this.m_jointCount; ++i)
		{
			debugger;
			//this.m_joints[i].PreparePositionSolver();
		}

		// this.Solve position constraints.
		if (b2World.s_enablePositionCorrection)
		{
			for (b2Island.m_positionIterationCount = 0; b2Island.m_positionIterationCount < step.iterations; ++b2Island.m_positionIterationCount)
			{
				var contactsOkay = contactSolver.SolvePositionConstraints(b2Settings.b2_contactBaumgarte);

				var jointsOkay = true;
				for (i = 0; i < this.m_jointCount; ++i)
				{
					debugger;
					//var jointOkay = this.m_joints[i].SolvePositionConstraints();
					//jointsOkay = jointsOkay && jointOkay;
				}

				if (contactsOkay && jointsOkay)
				{
					break;
				}
			}
		}

		// Post-solve.
		contactSolver.PostSolve();

		// Synchronize shapes and reset forces.
		for (i = 0; i < this.m_bodyCount; ++i)
		{
			b = this.m_bodies[i];

			if (b.m_invMass == 0.0)
				continue;

			b.m_R.Set(b.m_rotation);

			b.SynchronizeShapes();
			b.m_force.Set(0.0, 0.0);
			b.m_torque = 0.0;
		}
	}
	
	function UpdateSleep(dt: number): void {
		var i = 0;
		var b;

		var minSleepTime = Number.MAX_VALUE;

		var linTolSqr = b2Settings.b2_linearSleepTolerance * b2Settings.b2_linearSleepTolerance;
		var angTolSqr = b2Settings.b2_angularSleepTolerance * b2Settings.b2_angularSleepTolerance;

		for (i = 0; i < this.m_bodyCount; ++i)
		{
			b = this.m_bodies[i];
			if (b.m_invMass == 0.0)
			{
				continue;
			}

			if ((b.m_flags & b2Body.e_allowSleepFlag) == 0)
			{
				b.m_sleepTime = 0.0;
				minSleepTime = 0.0;
			}

			if ((b.m_flags & b2Body.e_allowSleepFlag) == 0 ||
				b.m_angularVelocity * b.m_angularVelocity > angTolSqr ||
				b2Math.b2Dot(b.m_linearVelocity, b.m_linearVelocity) > linTolSqr)
			{
				b.m_sleepTime = 0.0;
				minSleepTime = 0.0;
			}
			else
			{
				b.m_sleepTime += dt;
				minSleepTime = b2Math.b2Min(minSleepTime, b.m_sleepTime);
			}
		}

		if (minSleepTime >= b2Settings.b2_timeToSleep)
		{
			for (i = 0; i < this.m_bodyCount; ++i)
			{
				b = this.m_bodies[i];
				b.m_flags |= b2Body.e_sleepFlag;
			}
		}
	}
	
	function AddBody(body: b2Body): void {
		//b2Settings.b2Assert(this.m_bodyCount < this.m_bodyCapacity);
		this.m_bodies[this.m_bodyCount++] = body;
	}

	function AddContact(contact: b2Contact): void {
		//b2Settings.b2Assert(this.m_contactCount < this.m_contactCapacity);
		this.m_contacts[this.m_contactCount++] = contact;
	}

	function AddJoint(joint: variant): void {
		debugger;
		//b2Settings.b2Assert(this.m_jointCount < this.m_jointCapacity);
		//this.m_joints[this.m_jointCount++] = joint;
	}
	
	static var m_positionIterationCount = 0;
}
