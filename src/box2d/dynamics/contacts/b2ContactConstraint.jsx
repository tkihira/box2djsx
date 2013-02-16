import "../../common/*.jsx";
import "../../common/math/*.jsx";
import "../../collision/*.jsx";
import "../../collision/shapes/*.jsx";
import "../../dynamics/*.jsx";
import "../../dynamics/contacts/*.jsx";

class b2ContactConstraint {
	var points: b2ContactConstraintPoint[];
	var normal: b2Vec2;
	var manifold: b2Manifold = null;
	var body1: b2Body = null;
	var body2: b2Body = null;
	var friction: number = 0;
	var restitution: number = 0;
	var pointCount = 0;

	function constructor() {
		// initialize instance variables for references
		this.normal = new b2Vec2();
		//

		this.points = []: b2ContactConstraintPoint[]; this.points.length = (b2Settings.b2_maxManifoldPoints);
		for (var i = 0; i < b2Settings.b2_maxManifoldPoints; i++){
			this.points[i] = new b2ContactConstraintPoint();
		}
	}
}
