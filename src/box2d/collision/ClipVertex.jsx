import "../common/*.jsx";
import "../common/math/*.jsx";
import "../collision/*.jsx";
import "../collision/shapes/*.jsx";

class ClipVertex {
	var v: b2Vec2;
	var id: b2ContactID;
	function constructor() {
		this.v = new b2Vec2();
		this.id = new b2ContactID();
	}
}
