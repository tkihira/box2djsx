import "../common/*.jsx";
import "../common/math/*.jsx";
import "../collision/*.jsx";
import "../collision/shapes/*.jsx";
import "../dynamics/*.jsx";
import "../dynamics/contacts/*.jsx";

class b2World {
	var m_blockAllocator: variant = null;
	var m_stackAllocator: variant = null;

	var m_broadPhase: b2BroadPhase;
	var m_contactManager: b2ContactManager;

	var m_bodyList: b2Body;
	var m_contactList: b2Contact;
	var m_jointList: variant;

	var m_bodyCount: number;
	var m_contactCount: number;
	var m_jointCount: number;

	// These bodies will be destroyed at the next time this.step.
	var m_bodyDestroyList: b2Body;

	var m_gravity: b2Vec2;
	var m_allowSleep: boolean;

	var m_groundBody: b2Body;

	var m_listener: variant;
	var m_filter: b2CollisionFilter;

	var m_positionIterationCount = 0;

	var step: b2TimeStep;

	function constructor(worldAABB: b2AABB, gravity: b2Vec2, doSleep: boolean){
		// initialize instance variables for references
		this.step = new b2TimeStep();
		this.m_contactManager = new b2ContactManager();
		//


		this.m_listener = null;
		this.m_filter = b2CollisionFilter.b2_defaultFilter;

		this.m_bodyList = null;
		this.m_contactList = null;
		this.m_jointList = null;

		this.m_bodyCount = 0;
		this.m_contactCount = 0;
		this.m_jointCount = 0;

		this.m_bodyDestroyList = null;

		this.m_allowSleep = doSleep;

		this.m_gravity = gravity;

		this.m_contactManager.m_world = this;
		this.m_broadPhase = new b2BroadPhase(worldAABB, this.m_contactManager);

		var bd = new b2BodyDef();
		this.m_groundBody = this.CreateBody(bd);
	}

	function SetListener(listener: variant): void {
		this.m_listener = listener;
	}

	function SetFilter(filter: b2CollisionFilter): void {
		this.m_filter = filter;
	}

	function CreateBody(def: b2BodyDef): b2Body {
		//void* mem = this.m_blockAllocator.Allocate(sizeof(b2Body));
		var b = new b2Body(def, this);
		b.m_prev = null;

		b.m_next = this.m_bodyList;
		if (this.m_bodyList != null)
		{
			this.m_bodyList.m_prev = b;
		}
		this.m_bodyList = b;
		++this.m_bodyCount;

		return b;
	}

	function DestroyBody(b: b2Body): void{

		if ((b.m_flags & b2Body.e_destroyFlag) != 0)
		{
			return;
		}

		// Remove from normal body list.
		if (b.m_prev != null)
		{
			b.m_prev.m_next = b.m_next;
		}

		if (b.m_next != null)
		{
			b.m_next.m_prev = b.m_prev;
		}

		if (b == this.m_bodyList)
		{
			this.m_bodyList = b.m_next;
		}

		b.m_flags |= b2Body.e_destroyFlag;
		//b2Settings.b2Assert(this.m_bodyCount > 0);
		--this.m_bodyCount;

		//b->~b2Body();
		//b.Destroy();
		// Add to the deferred destruction list.
		b.m_prev = null;
		b.m_next = this.m_bodyDestroyList;
		this.m_bodyDestroyList = b;
	}

	function CleanBodyList(): void {
		this.m_contactManager.m_destroyImmediate = true;

		var b = this.m_bodyDestroyList;
		while (b != null)
		{
			//b2Settings.b2Assert((b.m_flags & b2Body.e_destroyFlag) != 0);

			// Preserve the next pointer.
			var b0 = b;
			b = b.m_next;

			// Delete the attached joints
			var jn = b0.m_jointList;
			while (jn != null)
			{
				debugger;
				/*var jn0 = jn;
				jn = jn.next;

				if (this.m_listener)
				{
					this.m_listener.NotifyJointDestroyed(jn0.joint);
				}

				this.DestroyJoint(jn0.joint);
				*/
			}

			b0.Destroy();
			//this.m_blockAllocator.Free(b0, sizeof(b2Body));
		}

		// Reset the list.
		this.m_bodyDestroyList = null;

		this.m_contactManager.m_destroyImmediate = false;
	}

	/*CreateJoint: function(def){
		var j = b2Joint.Create(def, this.m_blockAllocator);

		// Connect to the world list.
		j.m_prev = null;
		j.m_next = this.m_jointList;
		if (this.m_jointList)
		{
			this.m_jointList.m_prev = j;
		}
		this.m_jointList = j;
		++this.m_jointCount;

		// Connect to the bodies
		j.m_node1.joint = j;
		j.m_node1.other = j.m_body2;
		j.m_node1.prev = null;
		j.m_node1.next = j.m_body1.m_jointList;
		if (j.m_body1.m_jointList) j.m_body1.m_jointList.prev = j.m_node1;
		j.m_body1.m_jointList = j.m_node1;

		j.m_node2.joint = j;
		j.m_node2.other = j.m_body1;
		j.m_node2.prev = null;
		j.m_node2.next = j.m_body2.m_jointList;
		if (j.m_body2.m_jointList) j.m_body2.m_jointList.prev = j.m_node2;
		j.m_body2.m_jointList = j.m_node2;

		// If the joint prevents collisions, then reset collision filtering.
		if (def.collideConnected == false)
		{
			// Reset the proxies on the body with the minimum number of shapes.
			var b = def.body1.m_shapeCount < def.body2.m_shapeCount ? def.body1 : def.body2;
			for (var s = b.m_shapeList; s; s = s.m_next)
			{
				s.ResetProxy(this.m_broadPhase);
			}
		}

		return j;
	}

	DestroyJoint: function(j)
	{

		var collideConnected = j.m_collideConnected;

		// Remove from the world.
		if (j.m_prev)
		{
			j.m_prev.m_next = j.m_next;
		}

		if (j.m_next)
		{
			j.m_next.m_prev = j.m_prev;
		}

		if (j == this.m_jointList)
		{
			this.m_jointList = j.m_next;
		}

		// Disconnect from island graph.
		var body1 = j.m_body1;
		var body2 = j.m_body2;

		// Wake up touching bodies.
		body1.WakeUp();
		body2.WakeUp();

		// Remove from body 1
		if (j.m_node1.prev)
		{
			j.m_node1.prev.next = j.m_node1.next;
		}

		if (j.m_node1.next)
		{
			j.m_node1.next.prev = j.m_node1.prev;
		}

		if (j.m_node1 == body1.m_jointList)
		{
			body1.m_jointList = j.m_node1.next;
		}

		j.m_node1.prev = null;
		j.m_node1.next = null;

		// Remove from body 2
		if (j.m_node2.prev)
		{
			j.m_node2.prev.next = j.m_node2.next;
		}

		if (j.m_node2.next)
		{
			j.m_node2.next.prev = j.m_node2.prev;
		}

		if (j.m_node2 == body2.m_jointList)
		{
			body2.m_jointList = j.m_node2.next;
		}

		j.m_node2.prev = null;
		j.m_node2.next = null;

		b2Joint.Destroy(j, this.m_blockAllocator);

		//b2Settings.b2Assert(this.m_jointCount > 0);
		--this.m_jointCount;

		// If the joint prevents collisions, then reset collision filtering.
		if (collideConnected == false)
		{
			// Reset the proxies on the body with the minimum number of shapes.
			var b = body1.m_shapeCount < body2.m_shapeCount ? body1 : body2;
			for (var s = b.m_shapeList; s; s = s.m_next)
			{
				s.ResetProxy(this.m_broadPhase);
			}
		}
	}
	*/

	function GetGroundBody(): b2Body {
		return this.m_groundBody;
	}

	function Step(dt: number, iterations: number): void {

		var b;
		var other;


		this.step.dt = dt;
		this.step.iterations	= iterations;
		if (dt > 0.0)
		{
			this.step.inv_dt = 1.0 / dt;
		}
		else
		{
			this.step.inv_dt = 0.0;
		}

		this.m_positionIterationCount = 0;

		// Handle deferred contact destruction.
		this.m_contactManager.CleanContactList();

		// Handle deferred body destruction.
		this.CleanBodyList();

		// Update contacts.
		this.m_contactManager.Collide();

		// Size the island for the worst case.
		var island = new b2Island(this.m_bodyCount, this.m_contactCount, this.m_jointCount, this.m_stackAllocator);

		// Clear all the island flags.
		for (b = this.m_bodyList; b != null; b = b.m_next)
		{
			b.m_flags &= ~b2Body.e_islandFlag;
		}
		for (var c = this.m_contactList; c != null; c = c.m_next)
		{
			c.m_flags &= ~b2Contact.e_islandFlag;
		}
		/*for (var j = this.m_jointList; j != null; j = j.m_next)
		{
			debugger;
			//j.m_islandFlag = false;
		}
		*/

		// Build and simulate all awake islands.
		// var stackSize = this.m_bodyCount;
		//var stack = (b2Body**)this.m_stackAllocator.Allocate(stackSize * sizeof(b2Body*));
		var stack = []: b2Body[]; stack.length = (this.m_bodyCount);
		for (var k = 0; k < this.m_bodyCount; k++)
			stack[k] = null;

		for (var seed = this.m_bodyList; seed != null; seed = seed.m_next)
		{
			if ((seed.m_flags & (b2Body.e_staticFlag | b2Body.e_islandFlag | b2Body.e_sleepFlag | b2Body.e_frozenFlag)) != 0)
			{
				continue;
			}

			// Reset island and stack.
			island.Clear();
			var stackCount = 0;
			stack[stackCount++] = seed;
			seed.m_flags |= b2Body.e_islandFlag;;

			// Perform a depth first search (DFS) on the constraint graph.
			while (stackCount > 0)
			{
				// Grab the next body off the stack and add it to the island.
				b = stack[--stackCount];
				island.AddBody(b);

				// Make sure the body is awake.
				b.m_flags &= ~b2Body.e_sleepFlag;

				// To keep islands, we don't
				// propagate islands across static bodies.
				if ((b.m_flags & b2Body.e_staticFlag) != 0)
				{
					continue;
				}

				// Search all contacts connected to this body.
				for (var cn = b.m_contactList; cn != null; cn = cn.next)
				{
					if ((cn.contact.m_flags & b2Contact.e_islandFlag) != 0)
					{
						continue;
					}

					island.AddContact(cn.contact);
					cn.contact.m_flags |= b2Contact.e_islandFlag;

					other = cn.other;
					if ((other.m_flags & b2Body.e_islandFlag) != 0)
					{
						continue;
					}

					//b2Settings.b2Assert(stackCount < stackSize);
					stack[stackCount++] = other;
					other.m_flags |= b2Body.e_islandFlag;
				}

				// Search all joints connect to this body.
				/*for (var jn = b.m_jointList; jn != null; jn = jn.next)
				{
					debugger;
					if (jn.joint.m_islandFlag == true)
					{
						continue;
					}

					island.AddJoint(jn.joint);
					jn.joint.m_islandFlag = true;

					other = jn.other;
					if (other.m_flags & b2Body.e_islandFlag)
					{
						continue;
					}

					//b2Settings.b2Assert(stackCount < stackSize);
					stack[stackCount++] = other;
					other.m_flags |= b2Body.e_islandFlag;
				}*/
			}

			island.Solve(this.step, this.m_gravity);

			this.m_positionIterationCount = b2Math.b2Max(this.m_positionIterationCount, b2Island.m_positionIterationCount);

			if (this.m_allowSleep)
			{
				island.UpdateSleep(dt);
			}

			// Post solve cleanup.
			for (var i = 0; i < island.m_bodyCount; ++i)
			{
				// Allow static bodies to participate in other islands.
				b = island.m_bodies[i];
				if ((b.m_flags & b2Body.e_staticFlag) != 0)
				{
					b.m_flags &= ~b2Body.e_islandFlag;
				}

				// Handle newly frozen bodies.
				if (b.IsFrozen() && this.m_listener != null)
				{
					debugger;
					/*
					var response = this.m_listener.NotifyBoundaryViolated(b);
					if (response == b2WorldListener.b2_destroyBody)
					{
						this.DestroyBody(b);
						b = null;
						island.m_bodies[i] = null;
					}
					*/
				}
			}
		}

		this.m_broadPhase.Commit();

		//this.m_stackAllocator.Free(stack);
	}

	//function Query(aabb: b2AABB, shapes: b2Shpae[], maxCount: number): number{
	function Query(aabb: b2AABB, shapes: variant[], maxCount: number): number{

		//void** results = (void**)this.m_stackAllocator.Allocate(maxCount * sizeof(void*));
		var results = []: variant[];
		var count = this.m_broadPhase.QueryAABB(aabb, results, maxCount);

		for (var i = 0; i < count; ++i)
		{
			shapes[i] = results[i];
		}

		//this.m_stackAllocator.Free(results);
		return count;
	}
	function GetBodyList(): b2Body {
		return this.m_bodyList;
	}
	function GetJointList(): variant {
		return this.m_jointList;
	}
	function GetContactList(): b2Contact {
		return this.m_contactList;
	}


	//var m_broadPhase: b2BroadPhase;
	static var s_enablePositionCorrection = true;
	static var s_enableWarmStarting = true;
}
