import "common/*.jsx";
import "common/math/*.jsx";
import "collision/*.jsx";
import "collision/shapes/*.jsx";
import "dynamics/*.jsx";

class b2Manifold {
	var points: b2ContactPoint[];
	var normal: b2Vec2;
	var pointCount: number;
	
	function constructor (){
		this.points = []: b2ContactPoint[]; this.points.length = (b2Settings.b2_maxManifoldPoints);
		for (var i = 0; i < b2Settings.b2_maxManifoldPoints; i++){
			this.points[i] = new b2ContactPoint();
		}
		this.normal = new b2Vec2();
	}
}
