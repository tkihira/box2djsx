import "common/math/b2Vec2.jsx";

class b2AABB {
	var minVertex: b2Vec2;
	var maxVertex: b2Vec2;
	
	function constructor() {
		this.minVertex = new b2Vec2();
		this.maxVertex = new b2Vec2();
	}
	
	function IsValid(): boolean {
		//var d = b2Math.SubtractVV(this.maxVertex, this.minVertex);
		var dX = this.maxVertex.x;
		var dY = this.maxVertex.y;
		dX = this.maxVertex.x;
		dY = this.maxVertex.y;
		dX -= this.minVertex.x;
		dY -= this.minVertex.y;
		var valid = dX >= 0.0 && dY >= 0.0;
		valid = valid && this.minVertex.IsValid() && this.maxVertex.IsValid();
		return valid;
	}
}
