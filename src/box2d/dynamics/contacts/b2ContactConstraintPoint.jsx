import "common/*.jsx";
import "common/math/*.jsx";
import "collision/*.jsx";
import "collision/shapes/*.jsx";
import "dynamics/*.jsx";
import "dynamics/contacts/*.jsx";

class b2ContactConstraintPoint {
	var localAnchor1: b2Vec2;
	var localAnchor2: b2Vec2;
	
	var normalImpulse: number = 0;
	var tangentImpulse: number = 0;
	var positionImpulse: number = 0;
	var normalMass: number = 0;
	var tangentMass: number = 0;
	var separation: number = 0;
	var velocityBias: number = 0;
	
	function constructor() {
		// initialize instance variables for references
		this.localAnchor1 = new b2Vec2();
		this.localAnchor2 = new b2Vec2();
	}
}
