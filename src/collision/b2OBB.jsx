import "common/*.jsx";
import "common/math/*.jsx";
import "collision/*.jsx";
import "collision/shapes/*.jsx";
import "dynamics/*.jsx";

class b2OBB {
	var R: b2Mat22;
	var center: b2Vec2;
	var extents: b2Vec2;
	
	function constructor() {
		// initialize instance variables for references
		this.R = new b2Mat22();
		this.center = new b2Vec2();
		this.extents = new b2Vec2();
	}
}
