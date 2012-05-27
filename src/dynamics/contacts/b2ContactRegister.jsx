import "common/*.jsx";
import "common/math/*.jsx";
import "collision/*.jsx";
import "collision/shapes/*.jsx";
import "dynamics/*.jsx";
import "dynamics/contacts/*.jsx";

class b2ContactRegister {
	var createFcn: function(:b2Shape, :b2Shape, :variant):b2Contact = null;
	var destroyFcn: function(:b2Contact, :variant):void = null;
	var primary: boolean = false;
}
