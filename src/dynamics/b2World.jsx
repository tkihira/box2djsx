import "common/*.jsx";
import "common/math/*.jsx";
import "collision/*.jsx";
import "collision/shapes/*.jsx";
import "dynamics/*.jsx";
import "dynamics/contacts/*.jsx";

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
	
	// TODO: now here

	//var m_broadPhase: b2BroadPhase;
	static var s_enablePositionCorrection = true;
	static var s_enableWarmStarting = true;

}
