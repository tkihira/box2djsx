import "../../common/*.jsx";
import "../../common/math/*.jsx";
import "../../collision/*.jsx";
import "../../collision/shapes/*.jsx";
import "../../dynamics/*.jsx";
import "../../dynamics/contacts/*.jsx";

class b2NullContact extends b2Contact {
	function constructor(s1: b2Shape, s2: b2Shape) {
		super(s1, s2);
	}
	function constructor() {
		super();
	}

	override function Evaluate(): void {}
	override function GetManifolds(): b2Manifold[] {return null;}
}
