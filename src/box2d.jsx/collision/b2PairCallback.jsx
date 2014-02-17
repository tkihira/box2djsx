import "../common/*.jsx";
import "../common/math/*.jsx";
import "../collision/*.jsx";
import "../collision/shapes/*.jsx";
import "../dynamics/*.jsx";
import "../dynamics/contacts/*.jsx";

class b2PairCallback {
	function PairAdded(proxyUserData1: variant, proxyUserData2: variant): variant { return null; }
	function PairRemoved(proxyUserData1: variant, proxyUserData2: variant, pairUserData: variant): void {}
}
