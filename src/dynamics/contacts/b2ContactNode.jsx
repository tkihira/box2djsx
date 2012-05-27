import "common/*.jsx";
import "common/math/*.jsx";
import "collision/*.jsx";
import "collision/shapes/*.jsx";
import "dynamics/*.jsx";
import "dynamics/contacts/*.jsx";

class b2ContactNode {
	var other: variant;
	var contact: variant;
	var prev: b2ContactNode;
	var next: b2ContactNode;
}
