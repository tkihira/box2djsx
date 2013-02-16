import "../common/*.jsx";
import "../common/math/*.jsx";
import "../collision/*.jsx";
import "../collision/shapes/*.jsx";
import "../dynamics/*.jsx";

class b2ContactPoint {
	var position: b2Vec2;
	var separation: number;
	var normalImpulse: number = 0;
	var tangentImpulse: number = 0;
	var id: b2ContactID;
	function constructor() {
		this.position = new b2Vec2();
		this.id = new b2ContactID();
		this.separation = 0;
	}
}
