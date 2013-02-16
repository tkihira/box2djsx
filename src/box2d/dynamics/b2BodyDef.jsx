import "../common/*.jsx";
import "../common/math/*.jsx";
import "../collision/*.jsx";
import "../collision/shapes/*.jsx";
import "../dynamics/*.jsx";

class b2BodyDef {
	var userData: variant;

	var shapes: b2ShapeDef[];
	var position: b2Vec2;
	var rotation: number;
	var linearVelocity: b2Vec2;
	var angularVelocity: number;
	var linearDamping: number;
	var angularDamping: number;
	var allowSleep: boolean;
	var isSleeping: boolean;
	var preventRotation: boolean;

	function constructor() {
		this.shapes = []: b2ShapeDef[];
		//

		this.userData = null;
		for (var i = 0; i < b2Settings.b2_maxShapesPerBody; i++){
			this.shapes[i] = null;
		}
		this.position = new b2Vec2(0.0, 0.0);
		this.rotation = 0.0;
		this.linearVelocity = new b2Vec2(0.0, 0.0);
		this.angularVelocity = 0.0;
		this.linearDamping = 0.0;
		this.angularDamping = 0.0;
		this.allowSleep = true;
		this.isSleeping = false;
		this.preventRotation = false;
	}
	function AddShape(shape: b2ShapeDef): void {
		for (var i = 0; i < b2Settings.b2_maxShapesPerBody; ++i)
		{
			if (this.shapes[i] == null)
			{
				this.shapes[i] = shape;
				break;
			}
		}
	}
}
