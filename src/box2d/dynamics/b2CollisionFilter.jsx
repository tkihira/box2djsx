import "../common/*.jsx";
import "../common/math/*.jsx";
import "../collision/*.jsx";
import "../collision/shapes/*.jsx";
import "../dynamics/*.jsx";

class b2CollisionFilter {
	function ShouldCollide(shape1: b2Shape, shape2:b2Shape): boolean {
		if (shape1.m_groupIndex == shape2.m_groupIndex && shape1.m_groupIndex != 0)
		{
			return shape1.m_groupIndex > 0;
		}

		var collide = (shape1.m_maskBits & shape2.m_categoryBits) != 0 && (shape1.m_categoryBits & shape2.m_maskBits) != 0;
		return collide;
	}
	static var b2_defaultFilter = new b2CollisionFilter();
}
