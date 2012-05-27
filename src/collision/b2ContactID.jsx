import "common/*.jsx";
import "common/math/*.jsx";
import "collision/*.jsx";
import "collision/shapes/*.jsx";

class b2ContactID {
	var _key = 0;
	var features: Features;
	function constructor() {
		this.features = new Features();
		this.features._m_id = this;
	}
	function Set(id: b2ContactID): void{
		this.set_key(id._key);
	}
	function Copy(): b2ContactID {
		var id = new b2ContactID();
		id.set_key(this._key);
		return id;
	}
	function get_key(): number{
		return this._key;
	}
	function set_key(value: number): void {
		this._key = value;
		this.features._referenceFace = this._key & 0x000000ff;
		this.features._incidentEdge = ((this._key & 0x0000ff00) >> 8) & 0x000000ff;
		this.features._incidentVertex = ((this._key & 0x00ff0000) >> 16) & 0x000000ff;
		this.features._flip = ((this._key & 0xff000000) >> 24) & 0x000000ff;
	}
}
