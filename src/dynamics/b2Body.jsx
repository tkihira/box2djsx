import "common/*.jsx";
import "common/math/*.jsx";
import "collision/*.jsx";
import "collision/shapes/*.jsx";
import "dynamics/*.jsx";

class b2Body {
	var m_flags = 0;

	var m_position = new b2Vec2();
	var m_rotation: variant = null;
	var m_R = new b2Mat22(/*0*/);

	// Conservative advancement data.
	var m_position0 = new b2Vec2();
	var m_rotation0: variant = null;

	var m_linearVelocity: variant = null;
	var m_angularVelocity: variant = null;

	var m_force: variant = null;
	var m_torque: variant = null;

	var m_center: variant = null;

	var m_world: b2World = null;
	var m_prev: variant = null;
	var m_next: variant = null;

	var m_shapeList: variant = null;
	var m_shapeCount: variant = 0;

	var m_jointList: variant = null;
	var m_contactList: variant = null;

	var m_mass: variant = null;
	var m_invMass: variant = null;
	var m_I: variant = null;
	var m_invI: variant = null;

	var m_linearDamping: variant = null;
	var m_angularDamping: variant = null;

	var m_sleepTime: variant = null;

	var m_userData: variant = null;

	function Freeze(): void{}

}
