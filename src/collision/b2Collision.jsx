import "common/*.jsx";
import "common/math/*.jsx";
import "collision/*.jsx";

class b2Collision {
	static var b2_nullFeature = 0x000000ff;
	static function ClipSegmentToLine(vOut: ClipVertex[], vIn: ClipVertex[], normal: b2Vec2, offset: number): number {
		// Start with no output points
		var numOut = 0;

		var vIn0 = vIn[0].v;
		var vIn1 = vIn[1].v;

		// Calculate the distance of end points to the line
		var distance0 = b2Math.b2Dot(normal, vIn[0].v) - offset;
		var distance1 = b2Math.b2Dot(normal, vIn[1].v) - offset;

		// If the points are behind the plane
		if (distance0 <= 0.0) vOut[numOut++] = vIn[0];
		if (distance1 <= 0.0) vOut[numOut++] = vIn[1];

		// If the points are on different sides of the plane
		if (distance0 * distance1 < 0.0)
		{
			// Find intersection point of edge and plane
			var interp = distance0 / (distance0 - distance1);
			// expanded for performance
			var tVec = vOut[numOut].v;
			tVec.x = vIn0.x + interp * (vIn1.x - vIn0.x);
			tVec.y = vIn0.y + interp * (vIn1.y - vIn0.y);
			if (distance0 > 0.0)
			{
				vOut[numOut].id = vIn[0].id;
			}
			else
			{
				vOut[numOut].id = vIn[1].id;
			}
			++numOut;
		}

		return numOut;
	}

	/*
	static function EdgeSeparation(poly1: b2Polygon, edge1: , poly2)
	{
		var vert1s = poly1.m_vertices;
		var count2 = poly2.m_vertexCount;
		var vert2s = poly2.m_vertices;

		// Convert normal from into poly2's frame.
		//b2Settings.b2Assert(edge1 < poly1.m_vertexCount);

		//var normal = b2Math.b2MulMV(poly1.m_R, poly1->m_normals[edge1]);
		var normalX = poly1.m_normals[edge1].x;
		var normalY = poly1.m_normals[edge1].y;
		var tX = normalX;
		var tMat = poly1.m_R;
		normalX = tMat.col1.x * tX + tMat.col2.x * normalY;
		normalY = tMat.col1.y * tX + tMat.col2.y * normalY;
		// ^^^^^^^ normal.MulM(poly1.m_R);

		//var normalLocal2 = b2Math.b2MulTMV(poly2.m_R, normal);
		var normalLocal2X = normalX;
		var normalLocal2Y = normalY;
		tMat = poly2.m_R;
		tX = normalLocal2X * tMat.col1.x + normalLocal2Y * tMat.col1.y;
		normalLocal2Y = normalLocal2X * tMat.col2.x + normalLocal2Y * tMat.col2.y;
		normalLocal2X = tX;
		// ^^^^^ normalLocal2.MulTM(poly2.m_R);

		// Find support vertex on poly2 for -normal.
		var vertexIndex2 = 0;
		var minDot = Number.MAX_VALUE;
		for (var i = 0; i < count2; ++i)
		{
			//var dot = b2Math.b2Dot(vert2s[i], normalLocal2);
			var tVec = vert2s[i];
			var dot = tVec.x * normalLocal2X + tVec.y * normalLocal2Y;
			if (dot < minDot)
			{
				minDot = dot;
				vertexIndex2 = i;
			}
		}

		//b2Vec2 v1 = poly1->m_position + b2Mul(poly1->m_R, vert1s[edge1]);
		tMat = poly1.m_R;
		var v1X = poly1.m_position.x + (tMat.col1.x * vert1s[edge1].x + tMat.col2.x * vert1s[edge1].y)
		var v1Y = poly1.m_position.y + (tMat.col1.y * vert1s[edge1].x + tMat.col2.y * vert1s[edge1].y)

		//b2Vec2 v2 = poly2->m_position + b2Mul(poly2->m_R, vert2s[vertexIndex2]);
		tMat = poly2.m_R;
		var v2X = poly2.m_position.x + (tMat.col1.x * vert2s[vertexIndex2].x + tMat.col2.x * vert2s[vertexIndex2].y)
		var v2Y = poly2.m_position.y + (tMat.col1.y * vert2s[vertexIndex2].x + tMat.col2.y * vert2s[vertexIndex2].y)

		//var separation = b2Math.b2Dot( b2Math.SubtractVV( v2, v1 ) , normal);
		v2X -= v1X;
		v2Y -= v1Y;
		//var separation = b2Math.b2Dot( v2 , normal);
		var separation = v2X * normalX + v2Y * normalY;
		return separation;
	}
	*/
}
