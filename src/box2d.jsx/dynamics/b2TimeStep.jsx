import "../common/*.jsx";
import "../common/math/*.jsx";
import "../collision/*.jsx";
import "../collision/shapes/*.jsx";
import "../dynamics/*.jsx";
import "../dynamics/contacts/*.jsx";

class b2TimeStep {
	var dt: number = 0;
	var inv_dt: number = 0;
	var iterations = 0;
}
