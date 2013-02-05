import "common/*.jsx";
import "common/math/*.jsx";
import "collision/*.jsx";
import "collision/shapes/*.jsx";
import "dynamics/*.jsx";
import "dynamics/contacts/*.jsx";

class b2Proxy {
	var lowerBounds: number[];
	var upperBounds: number[];
	var overlapCount: number;
	var timeStamp: number;

	var userData: variant;
	
	function constructor() {
		this.lowerBounds = [0, 0];
		this.upperBounds = [0, 0];
		this.overlapCount = 0;
		this.timeStamp = 0;
	}
	
	function GetNext(): number { return this.lowerBounds[0]; }
	function SetNext(next: number): void { this.lowerBounds[0] = next /*& 0x0000ffff*/; }
	function IsValid(): boolean { return this.overlapCount != b2BroadPhase.b2_invalid; }

}
