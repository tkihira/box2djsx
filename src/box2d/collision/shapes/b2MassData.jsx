import "common/*.jsx";
import "common/math/*.jsx";
import "collision/*.jsx";
import "collision/shapes/*.jsx";

class b2MassData {
	var mass: number;
	var I: number;
	var center: b2Vec2;

	function constructor() {
		this.mass = 0.0;
		this.I = 0.0;
		this.center = new b2Vec2(0, 0);
	}
}
