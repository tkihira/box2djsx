import "common/*.jsx";
import "common/math/*.jsx";
import "collision/*.jsx";
import "collision/shapes/*.jsx";

class Features {
	var _referenceFace = 0;
	var _incidentEdge = 0;
	var _incidentVertex = 0;
	var _flip = 0;
	var _m_id: b2ContactID = null;
	
	function set_referenceFace(value: number): void {
		this._referenceFace = value;
		this._m_id._key = (this._m_id._key & 0xffffff00) | (this._referenceFace & 0x000000ff);
	}
	function get_referenceFace(): number {
		return this._referenceFace;
	}
	function set_incidentEdge(value: number): void{
		this._incidentEdge = value;
		this._m_id._key = (this._m_id._key & 0xffff00ff) | ((this._incidentEdge << 8) & 0x0000ff00);
	}
	function get_incidentEdge(): number {
		return this._incidentEdge;
	}
	function set_incidentVertex(value: number): void {
		this._incidentVertex = value;
		this._m_id._key = (this._m_id._key & 0xff00ffff) | ((this._incidentVertex << 16) & 0x00ff0000);
	}
	function get_incidentVertex(): number {
		return this._incidentVertex;
	}
	function set_flip(value: number): void {
		this._flip = value;
		this._m_id._key = (this._m_id._key & 0x00ffffff) | ((this._flip << 24) & 0xff000000);
	}
	function get_flip(): number {
		return this._flip;
	}
}
