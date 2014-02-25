import "../common/*.jsx";
import "../common/math/*.jsx";
import "../collision/*.jsx";

class b2BroadPhase {
	var m_pairManager: b2PairManager;

	var m_proxyPool: b2Proxy[];
	var m_freeProxy: number;

	var m_bounds: b2Bound[][];

	var m_queryResults: number[];
	var m_queryResultCount: number;

	var m_worldAABB: b2AABB;
	var m_quantizationFactor: b2Vec2;
	var m_proxyCount: number;
	var m_timeStamp: number;

	function constructor(worldAABB: b2AABB, callback: b2PairCallback){
		// initialize instance variables for references
		this.m_queryResults = []: number[]; this.m_queryResults.length = b2Settings.b2_maxProxies;
		this.m_pairManager = new b2PairManager();
		this.m_proxyPool = []: b2Proxy[]; this.m_proxyPool.length = b2Settings.b2_maxPairs;
		this.m_bounds = []: b2Bound[][]; this.m_bounds.length = 2*b2Settings.b2_maxProxies;
		this.m_queryResults = []: number[]; this.m_queryResults.length = b2Settings.b2_maxProxies;
		this.m_quantizationFactor = new b2Vec2();

		//b2Settings.b2Assert(worldAABB.IsValid());
		var i = 0;

		this.m_pairManager.Initialize(this, callback);

		this.m_worldAABB = worldAABB;

		this.m_proxyCount = 0;

		// query results
		for (i = 0; i < b2Settings.b2_maxProxies; i++){
			this.m_queryResults[i] = 0;
		}

		// bounds array
		this.m_bounds = []: b2Bound[][];
		for (i = 0; i < 2; i++){
			this.m_bounds[i] = []: b2Bound[];
			this.m_bounds[i].length = 2*b2Settings.b2_maxProxies;
			for (var j = 0; j < 2*b2Settings.b2_maxProxies; j++){
				this.m_bounds[i][j] = new b2Bound();
			}
		}

		//var d = b2Math.SubtractVV(worldAABB.maxVertex, worldAABB.minVertex);
		var dX = worldAABB.maxVertex.x;
		var dY = worldAABB.maxVertex.y;
		dX -= worldAABB.minVertex.x;
		dY -= worldAABB.minVertex.y;

		this.m_quantizationFactor.x = b2Settings.USHRT_MAX / dX;
		this.m_quantizationFactor.y = b2Settings.USHRT_MAX / dY;

		var tProxy;
		for (i = 0; i < b2Settings.b2_maxProxies - 1; ++i)
		{
			tProxy = new b2Proxy();
			this.m_proxyPool[i] = tProxy;
			tProxy.SetNext(i + 1);
			tProxy.timeStamp = 0;
			tProxy.overlapCount = b2BroadPhase.b2_invalid;
			tProxy.userData = null;
		}
		tProxy = new b2Proxy();
		this.m_proxyPool[b2Settings.b2_maxProxies-1] = tProxy;
		tProxy.SetNext(b2Pair.b2_nullProxy);
		tProxy.timeStamp = 0;
		tProxy.overlapCount = b2BroadPhase.b2_invalid;
		tProxy.userData = null;
		this.m_freeProxy = 0;

		this.m_timeStamp = 1;
		this.m_queryResultCount = 0;
	}

	function InRange(aabb: b2AABB): boolean {
		//var d = b2Math.b2MaxV(b2Math.SubtractVV(aabb.minVertex, this.m_worldAABB.maxVertex), b2Math.SubtractVV(this.m_worldAABB.minVertex, aabb.maxVertex));
		var dX;
		var dY;
		var d2X;
		var d2Y;

		dX = aabb.minVertex.x;
		dY = aabb.minVertex.y;
		dX -= this.m_worldAABB.maxVertex.x;
		dY -= this.m_worldAABB.maxVertex.y;

		d2X = this.m_worldAABB.minVertex.x;
		d2Y = this.m_worldAABB.minVertex.y;
		d2X -= aabb.maxVertex.x;
		d2Y -= aabb.maxVertex.y;

		dX = b2Math.b2Max(dX, d2X);
		dY = b2Math.b2Max(dY, d2Y);

		return b2Math.b2Max(dX, dY) < 0.0;
	}

	function GetProxy(proxyId: number): b2Proxy {
		if (proxyId == b2Pair.b2_nullProxy || this.m_proxyPool[proxyId].IsValid() == false)
		{
			return null;
		}

		return this.m_proxyPool[ proxyId ];
	}

	function CreateProxy(aabb: b2AABB, userData: variant): number {
		var index = 0;
		var proxy;

		//b2Settings.b2Assert(this.m_proxyCount < b2_maxProxies);
		//b2Settings.b2Assert(this.m_freeProxy != b2Pair.b2_nullProxy);

		var proxyId = this.m_freeProxy;
		proxy = this.m_proxyPool[ proxyId ];
		this.m_freeProxy = proxy.GetNext();

		proxy.overlapCount = 0;
		proxy.userData = userData;

		var boundCount = 2 * this.m_proxyCount;

		var lowerValues = []: number[];
		var upperValues = []: number[];
		this.ComputeBounds(lowerValues, upperValues, aabb);

		for (var axis = 0; axis < 2; ++axis)
		{
			var bounds = this.m_bounds[axis];
			var lowerIndex = 0;
			var upperIndex = 0;
			var lowerIndexOut = [lowerIndex];
			var upperIndexOut = [upperIndex];
			this.Query(lowerIndexOut, upperIndexOut, lowerValues[axis], upperValues[axis], bounds, boundCount, axis);
			lowerIndex = lowerIndexOut[0];
			upperIndex = upperIndexOut[0];

			// Replace memmove calls
			//memmove(bounds + upperIndex + 2, bounds + upperIndex, (edgeCount - upperIndex) * sizeof(b2Bound));
			var tArr = []: b2Bound[];
			var j = 0;
			var tEnd = boundCount - upperIndex;
			var tBound1;
			var tBound2;
			// make temp array
			for (j = 0; j < tEnd; j++){
				tArr[j] = new b2Bound();
				tBound1 = tArr[j];
				tBound2 = bounds[upperIndex+j];
				tBound1.value = tBound2.value;
				tBound1.proxyId = tBound2.proxyId;
				tBound1.stabbingCount = tBound2.stabbingCount;
			}
			// move temp array back in to bounds
			tEnd = tArr.length;
			var tIndex = upperIndex+2;
			for (j = 0; j < tEnd; j++){
				//bounds[tIndex+j] = tArr[j];
				tBound2 = tArr[j];
				tBound1 = bounds[tIndex+j];
				tBound1.value = tBound2.value;
				tBound1.proxyId = tBound2.proxyId;
				tBound1.stabbingCount = tBound2.stabbingCount;
			}
			//memmove(bounds + lowerIndex + 1, bounds + lowerIndex, (upperIndex - lowerIndex) * sizeof(b2Bound));
			// make temp array
			tArr = []: b2Bound[];
			tEnd = upperIndex - lowerIndex;
			for (j = 0; j < tEnd; j++){
				tArr[j] = new b2Bound();
				tBound1 = tArr[j];
				tBound2 = bounds[lowerIndex+j];
				tBound1.value = tBound2.value;
				tBound1.proxyId = tBound2.proxyId;
				tBound1.stabbingCount = tBound2.stabbingCount;
			}
			// move temp array back in to bounds
			tEnd = tArr.length;
			tIndex = lowerIndex+1;
			for (j = 0; j < tEnd; j++){
				//bounds[tIndex+j] = tArr[j];
				tBound2 = tArr[j];
				tBound1 = bounds[tIndex+j];
				tBound1.value = tBound2.value;
				tBound1.proxyId = tBound2.proxyId;
				tBound1.stabbingCount = tBound2.stabbingCount;
			}

			// The upper index has increased because of the lower bound insertion.
			++upperIndex;

			// Copy in the new bounds.
			bounds[lowerIndex].value = lowerValues[axis];
			bounds[lowerIndex].proxyId = proxyId;
			bounds[upperIndex].value = upperValues[axis];
			bounds[upperIndex].proxyId = proxyId;

			bounds[lowerIndex].stabbingCount = lowerIndex == 0 ? 0 : bounds[lowerIndex-1].stabbingCount;
			bounds[upperIndex].stabbingCount = bounds[upperIndex-1].stabbingCount;

			// Adjust the stabbing count between the new bounds.
			for (index = lowerIndex; index < upperIndex; ++index)
			{
				bounds[index].stabbingCount++;
			}

			// Adjust the all the affected bound indices.
			for (index = lowerIndex; index < boundCount + 2; ++index)
			{
				var proxy2 = this.m_proxyPool[ bounds[index].proxyId ];
				if (bounds[index].IsLower())
				{
					proxy2.lowerBounds[axis] = index;
				}
				else
				{
					proxy2.upperBounds[axis] = index;
				}
			}
		}

		++this.m_proxyCount;

		//b2Settings.b2Assert(this.m_queryResultCount < b2Settings.b2_maxProxies);

		for (var i = 0; i < this.m_queryResultCount; ++i)
		{
			//b2Settings.b2Assert(this.m_queryResults[i] < b2_maxProxies);
			//b2Settings.b2Assert(this.m_proxyPool[this.m_queryResults[i]].IsValid());

			this.m_pairManager.AddBufferedPair(proxyId, this.m_queryResults[i]);
		}

		this.m_pairManager.Commit();

		// Prepare for next query.
		this.m_queryResultCount = 0;
		this.IncrementTimeStamp();

		return proxyId;
	}

	function DestroyProxy(proxyId: number): void {

		//b2Settings.b2Assert(0 < this.m_proxyCount && this.m_proxyCount <= b2_maxProxies);

		var proxy = this.m_proxyPool[ proxyId ];
		//b2Settings.b2Assert(proxy.IsValid());

		var boundCount = 2 * this.m_proxyCount;

		for (var axis = 0; axis < 2; ++axis)
		{
			var bounds = this.m_bounds[axis];

			var lowerIndex = proxy.lowerBounds[axis];
			var upperIndex = proxy.upperBounds[axis];
			var lowerValue = bounds[lowerIndex].value;
			var upperValue = bounds[upperIndex].value;

			// replace memmove calls
			//memmove(bounds + lowerIndex, bounds + lowerIndex + 1, (upperIndex - lowerIndex - 1) * sizeof(b2Bound));
			var tArr = []: b2Bound[];
			var j = 0;
			var tEnd = upperIndex - lowerIndex - 1;
			var tBound1;
			var tBound2;
			// make temp array
			for (j = 0; j < tEnd; j++){
				tArr[j] = new b2Bound();
				tBound1 = tArr[j];
				tBound2 = bounds[lowerIndex+1+j];
				tBound1.value = tBound2.value;
				tBound1.proxyId = tBound2.proxyId;
				tBound1.stabbingCount = tBound2.stabbingCount;
			}
			// move temp array back in to bounds
			tEnd = tArr.length;
			var tIndex = lowerIndex;
			for (j = 0; j < tEnd; j++){
				//bounds[tIndex+j] = tArr[j];
				tBound2 = tArr[j];
				tBound1 = bounds[tIndex+j];
				tBound1.value = tBound2.value;
				tBound1.proxyId = tBound2.proxyId;
				tBound1.stabbingCount = tBound2.stabbingCount;
			}
			//memmove(bounds + upperIndex-1, bounds + upperIndex + 1, (edgeCount - upperIndex - 1) * sizeof(b2Bound));
			// make temp array
			tArr = []: b2Bound[];
			tEnd = boundCount - upperIndex - 1;
			for (j = 0; j < tEnd; j++){
				tArr[j] = new b2Bound();
				tBound1 = tArr[j];
				tBound2 = bounds[upperIndex+1+j];
				tBound1.value = tBound2.value;
				tBound1.proxyId = tBound2.proxyId;
				tBound1.stabbingCount = tBound2.stabbingCount;
			}
			// move temp array back in to bounds
			tEnd = tArr.length;
			tIndex = upperIndex-1;
			for (j = 0; j < tEnd; j++){
				//bounds[tIndex+j] = tArr[j];
				tBound2 = tArr[j];
				tBound1 = bounds[tIndex+j];
				tBound1.value = tBound2.value;
				tBound1.proxyId = tBound2.proxyId;
				tBound1.stabbingCount = tBound2.stabbingCount;
			}

			// Fix bound indices.
			tEnd = boundCount - 2;
			for (var index = lowerIndex; index < tEnd; ++index)
			{
				var proxy2 = this.m_proxyPool[ bounds[index].proxyId ];
				if (bounds[index].IsLower())
				{
					proxy2.lowerBounds[axis] = index;
				}
				else
				{
					proxy2.upperBounds[axis] = index;
				}
			}

			// Fix stabbing count.
			tEnd = upperIndex - 1;
			for (var index2 = lowerIndex; index2 < tEnd; ++index2)
			{
				bounds[index2].stabbingCount--;
			}

			// this.Query for pairs to be removed. lowerIndex and upperIndex are not needed.
			// make lowerIndex and upper output using an array and do this for others if compiler doesn't pick them up
			this.Query([0], [0], lowerValue, upperValue, bounds, boundCount - 2, axis);
		}

		//b2Settings.b2Assert(this.m_queryResultCount < b2Settings.b2_maxProxies);

		for (var i = 0; i < this.m_queryResultCount; ++i)
		{
			//b2Settings.b2Assert(this.m_proxyPool[this.m_queryResults[i]].IsValid());

			this.m_pairManager.RemoveBufferedPair(proxyId, this.m_queryResults[i]);
		}

		this.m_pairManager.Commit();

		// Prepare for next query.
		this.m_queryResultCount = 0;
		this.IncrementTimeStamp();

		// Return the proxy to the pool.
		proxy.userData = null;
		proxy.overlapCount = b2BroadPhase.b2_invalid;
		proxy.lowerBounds[0] = b2BroadPhase.b2_invalid;
		proxy.lowerBounds[1] = b2BroadPhase.b2_invalid;
		proxy.upperBounds[0] = b2BroadPhase.b2_invalid;
		proxy.upperBounds[1] = b2BroadPhase.b2_invalid;

		proxy.SetNext(this.m_freeProxy);
		this.m_freeProxy = proxyId;
		--this.m_proxyCount;
	}

	function MoveProxy(proxyId: number, aabb: b2AABB): void {
		var axis = 0;
		var index = 0;
		var bound;
		var prevBound;
		var nextBound;
		var nextProxyId = 0;
		var nextProxy;

		if (proxyId == b2Pair.b2_nullProxy || b2Settings.b2_maxProxies <= proxyId)
		{
			//b2Settings.b2Assert(false);
			return;
		}

		if (aabb.IsValid() == false)
		{
			//b2Settings.b2Assert(false);
			return;
		}

		var boundCount = 2 * this.m_proxyCount;

		var proxy = this.m_proxyPool[ proxyId ];
		// Get new bound values
		var newValues = new b2BoundValues();
		this.ComputeBounds(newValues.lowerValues, newValues.upperValues, aabb);

		// Get old bound values
		var oldValues = new b2BoundValues();
		for (axis = 0; axis < 2; ++axis)
		{
			oldValues.lowerValues[axis] = this.m_bounds[axis][proxy.lowerBounds[axis]].value;
			oldValues.upperValues[axis] = this.m_bounds[axis][proxy.upperBounds[axis]].value;
		}

		for (axis = 0; axis < 2; ++axis)
		{
			var bounds = this.m_bounds[axis];

			var lowerIndex = proxy.lowerBounds[axis];
			var upperIndex = proxy.upperBounds[axis];

			var lowerValue = newValues.lowerValues[axis];
			var upperValue = newValues.upperValues[axis];

			var deltaLower = lowerValue - bounds[lowerIndex].value;
			var deltaUpper = upperValue - bounds[upperIndex].value;

			bounds[lowerIndex].value = lowerValue;
			bounds[upperIndex].value = upperValue;

			//
			// Expanding adds overlaps
			//

			// Should we move the lower bound down?
			if (deltaLower < 0)
			{
				index = lowerIndex;
				while (index > 0 && lowerValue < bounds[index-1].value)
				{
					bound = bounds[index];
					prevBound = bounds[index - 1];

					var prevProxyId = prevBound.proxyId;
					var prevProxy = this.m_proxyPool[ prevBound.proxyId ];

					prevBound.stabbingCount++;

					if (prevBound.IsUpper() == true)
					{
						if (this.TestOverlap(newValues, prevProxy))
						{
							this.m_pairManager.AddBufferedPair(proxyId, prevProxyId);
						}

						prevProxy.upperBounds[axis]++;
						bound.stabbingCount++;
					}
					else
					{
						prevProxy.lowerBounds[axis]++;
						bound.stabbingCount--;
					}

					proxy.lowerBounds[axis]--;

					// swap
					//var temp = bound;
					//bound = prevEdge;
					//prevEdge = temp;
					bound.Swap(prevBound);
					//b2Math.b2Swap(bound, prevEdge);
					--index;
				}
			}

			// Should we move the upper bound up?
			if (deltaUpper > 0)
			{
				index = upperIndex;
				while (index < boundCount-1 && bounds[index+1].value <= upperValue)
				{
					bound = bounds[ index ];
					nextBound = bounds[ index + 1 ];
					nextProxyId = nextBound.proxyId;
					nextProxy = this.m_proxyPool[ nextProxyId ];

					nextBound.stabbingCount++;

					if (nextBound.IsLower() == true)
					{
						if (this.TestOverlap(newValues, nextProxy))
						{
							this.m_pairManager.AddBufferedPair(proxyId, nextProxyId);
						}

						nextProxy.lowerBounds[axis]--;
						bound.stabbingCount++;
					}
					else
					{
						nextProxy.upperBounds[axis]--;
						bound.stabbingCount--;
					}

					proxy.upperBounds[axis]++;
					// swap
					//var temp = bound;
					//bound = nextEdge;
					//nextEdge = temp;
					bound.Swap(nextBound);
					//b2Math.b2Swap(bound, nextEdge);
					index++;
				}
			}

			//
			// Shrinking removes overlaps
			//

			// Should we move the lower bound up?
			if (deltaLower > 0)
			{
				index = lowerIndex;
				while (index < boundCount-1 && bounds[index+1].value <= lowerValue)
				{
					bound = bounds[ index ];
					nextBound = bounds[ index + 1 ];

					nextProxyId = nextBound.proxyId;
					nextProxy = this.m_proxyPool[ nextProxyId ];

					nextBound.stabbingCount--;

					if (nextBound.IsUpper())
					{
						if (this.TestOverlap(oldValues, nextProxy))
						{
							this.m_pairManager.RemoveBufferedPair(proxyId, nextProxyId);
						}

						nextProxy.upperBounds[axis]--;
						bound.stabbingCount--;
					}
					else
					{
						nextProxy.lowerBounds[axis]--;
						bound.stabbingCount++;
					}

					proxy.lowerBounds[axis]++;
					// swap
					//var temp = bound;
					//bound = nextEdge;
					//nextEdge = temp;
					bound.Swap(nextBound);
					//b2Math.b2Swap(bound, nextEdge);
					index++;
				}
			}

			// Should we move the upper bound down?
			if (deltaUpper < 0)
			{
				index = upperIndex;
				while (index > 0 && upperValue < bounds[index-1].value)
				{
					bound = bounds[index];
					prevBound = bounds[index - 1];

					prevProxyId = prevBound.proxyId;
					prevProxy = this.m_proxyPool[ prevProxyId ];

					prevBound.stabbingCount--;

					if (prevBound.IsLower() == true)
					{
						if (this.TestOverlap(oldValues, prevProxy))
						{
							this.m_pairManager.RemoveBufferedPair(proxyId, prevProxyId);
						}

						prevProxy.lowerBounds[axis]++;
						bound.stabbingCount--;
					}
					else
					{
						prevProxy.upperBounds[axis]++;
						bound.stabbingCount++;
					}

					proxy.upperBounds[axis]--;
					// swap
					//var temp = bound;
					//bound = prevEdge;
					//prevEdge = temp;
					bound.Swap(prevBound);
					//b2Math.b2Swap(bound, prevEdge);
					index--;
				}
			}
		}
	}

	function Commit(): void{
		this.m_pairManager.Commit();
	}

	function QueryAABB(aabb: b2AABB, userData: variant[], maxCount: number): number {
		var lowerValues = []: number[];
		var upperValues = []: number[];
		this.ComputeBounds(lowerValues, upperValues, aabb);

		var lowerIndex = 0;
		var upperIndex = 0;
		var lowerIndexOut = [lowerIndex];
		var upperIndexOut = [upperIndex];
		this.Query(lowerIndexOut, upperIndexOut, lowerValues[0], upperValues[0], this.m_bounds[0], 2*this.m_proxyCount, 0);
		this.Query(lowerIndexOut, upperIndexOut, lowerValues[1], upperValues[1], this.m_bounds[1], 2*this.m_proxyCount, 1);

		//b2Settings.b2Assert(this.m_queryResultCount < b2Settings.b2_maxProxies);

		var count = 0;
		for (var i = 0; i < this.m_queryResultCount && count < maxCount; ++i, ++count)
		{
			//b2Settings.b2Assert(this.m_queryResults[i] < b2Settings.b2_maxProxies);
			var proxy = this.m_proxyPool[ this.m_queryResults[i] ];
			//b2Settings.b2Assert(proxy.IsValid());
			userData[i] = proxy.userData;
		}

		// Prepare for next query.
		this.m_queryResultCount = 0;
		this.IncrementTimeStamp();

		return count;
	}

	function Validate(): void {
		for (var axis = 0; axis < 2; ++axis)
		{
			var bounds = this.m_bounds[axis];

			var boundCount = 2 * this.m_proxyCount;
			var stabbingCount = 0;

			for (var i = 0; i < boundCount; ++i)
			{
				var bound = bounds[i];
				//b2Settings.b2Assert(i == 0 || bounds[i-1].value <= bound->value);
				//b2Settings.b2Assert(bound->proxyId != b2_nullProxy);
				//b2Settings.b2Assert(this.m_proxyPool[bound->proxyId].IsValid());

				if (bound.IsLower() == true)
				{
					//b2Settings.b2Assert(this.m_proxyPool[bound.proxyId].lowerBounds[axis] == i);
					stabbingCount++;
				}
				else
				{
					//b2Settings.b2Assert(this.m_proxyPool[bound.proxyId].upperBounds[axis] == i);
					stabbingCount--;
				}

				//b2Settings.b2Assert(bound.stabbingCount == stabbingCount);
			}
		}

	}


	function ComputeBounds(lowerValues: number[], upperValues: number[], aabb: b2AABB): void
	{
		//b2Settings.b2Assert(aabb.maxVertex.x > aabb.minVertex.x);
		//b2Settings.b2Assert(aabb.maxVertex.y > aabb.minVertex.y);

		//var minVertex = b2Math.b2ClampV(aabb.minVertex, this.m_worldAABB.minVertex, this.m_worldAABB.maxVertex);
		var minVertexX = aabb.minVertex.x;
		var minVertexY = aabb.minVertex.y;
		minVertexX = b2Math.b2Min(minVertexX, this.m_worldAABB.maxVertex.x);
		minVertexY = b2Math.b2Min(minVertexY, this.m_worldAABB.maxVertex.y);
		minVertexX = b2Math.b2Max(minVertexX, this.m_worldAABB.minVertex.x);
		minVertexY = b2Math.b2Max(minVertexY, this.m_worldAABB.minVertex.y);

		//var maxVertex = b2Math.b2ClampV(aabb.maxVertex, this.m_worldAABB.minVertex, this.m_worldAABB.maxVertex);
		var maxVertexX = aabb.maxVertex.x;
		var maxVertexY = aabb.maxVertex.y;
		maxVertexX = b2Math.b2Min(maxVertexX, this.m_worldAABB.maxVertex.x);
		maxVertexY = b2Math.b2Min(maxVertexY, this.m_worldAABB.maxVertex.y);
		maxVertexX = b2Math.b2Max(maxVertexX, this.m_worldAABB.minVertex.x);
		maxVertexY = b2Math.b2Max(maxVertexY, this.m_worldAABB.minVertex.y);

		// Bump lower bounds downs and upper bounds up. This ensures correct sorting of
		// lower/upper bounds that would have equal values.
		// TODO_ERIN implement fast float to uint16 conversion.
		lowerValues[0] = /*uint*/(this.m_quantizationFactor.x * (minVertexX - this.m_worldAABB.minVertex.x)) & (b2Settings.USHRT_MAX - 1);
		upperValues[0] = (/*uint*/(this.m_quantizationFactor.x * (maxVertexX - this.m_worldAABB.minVertex.x))& 0x0000ffff) | 1;

		lowerValues[1] = /*uint*/(this.m_quantizationFactor.y * (minVertexY - this.m_worldAABB.minVertex.y)) & (b2Settings.USHRT_MAX - 1);
		upperValues[1] = (/*uint*/(this.m_quantizationFactor.y * (maxVertexY - this.m_worldAABB.minVertex.y))& 0x0000ffff) | 1;
	}

	/*function TestOverlapValidate(p1, p2): boolean{

		for (var axis = 0; axis < 2; ++axis)
		{
			var bounds = this.m_bounds[axis];

			//b2Settings.b2Assert(p1.lowerBounds[axis] < 2 * this.m_proxyCount);
			//b2Settings.b2Assert(p1.upperBounds[axis] < 2 * this.m_proxyCount);
			//b2Settings.b2Assert(p2.lowerBounds[axis] < 2 * this.m_proxyCount);
			//b2Settings.b2Assert(p2.upperBounds[axis] < 2 * this.m_proxyCount);

			if (bounds[p1.lowerBounds[axis]].value > bounds[p2.upperBounds[axis]].value)
				return false;

			if (bounds[p1.upperBounds[axis]].value < bounds[p2.lowerBounds[axis]].value)
				return false;
		}

		return true;
	}*/

	function TestOverlap(b: b2BoundValues, p: b2Proxy): boolean
	{
		for (var axis = 0; axis < 2; ++axis)
		{
			var bounds = this.m_bounds[axis];

			//b2Settings.b2Assert(p.lowerBounds[axis] < 2 * this.m_proxyCount);
			//b2Settings.b2Assert(p.upperBounds[axis] < 2 * this.m_proxyCount);

			if (b.lowerValues[axis] > bounds[p.upperBounds[axis]].value)
				return false;

			if (b.upperValues[axis] < bounds[p.lowerBounds[axis]].value)
				return false;
		}

		return true;
	}


	function Query(lowerQueryOut: number[], upperQueryOut: number[], lowerValue: number, upperValue: number, bounds: b2Bound[], boundCount: number, axis: number): void {

		var lowerQuery = b2BroadPhase.BinarySearch(bounds, boundCount, lowerValue);
		var upperQuery = b2BroadPhase.BinarySearch(bounds, boundCount, upperValue);

		// Easy case: lowerQuery <= lowerIndex(i) < upperQuery
		// Solution: search query range for min bounds.
		for (var j = lowerQuery; j < upperQuery; ++j)
		{
			if (bounds[j].IsLower())
			{
				this.IncrementOverlapCount(bounds[j].proxyId);
			}
		}

		// Hard case: lowerIndex(i) < lowerQuery < upperIndex(i)
		// Solution: use the stabbing count to search down the bound array.
		if (lowerQuery > 0)
		{
			var i = lowerQuery - 1;
			var s = bounds[i].stabbingCount;

			// Find the s overlaps.
			while (s != 0)
			{
				//b2Settings.b2Assert(i >= 0);

				if (bounds[i].IsLower())
				{
					var proxy = this.m_proxyPool[ bounds[i].proxyId ];
					if (lowerQuery <= proxy.upperBounds[axis])
					{
						this.IncrementOverlapCount(bounds[i].proxyId);
						--s;
					}
				}
				--i;
			}
		}

		lowerQueryOut[0] = lowerQuery;
		upperQueryOut[0] = upperQuery;
	}

	function IncrementOverlapCount(proxyId: number): void{
		var proxy = this.m_proxyPool[ proxyId ];
		if (proxy.timeStamp < this.m_timeStamp)
		{
			proxy.timeStamp = this.m_timeStamp;
			proxy.overlapCount = 1;
		}
		else
		{
			proxy.overlapCount = 2;
			//b2Settings.b2Assert(this.m_queryResultCount < b2Settings.b2_maxProxies);
			this.m_queryResults[this.m_queryResultCount] = proxyId;
			++this.m_queryResultCount;
		}
	}

	function IncrementTimeStamp(): void {
		if (this.m_timeStamp == b2Settings.USHRT_MAX)
		{
			for (var i = 0; i < b2Settings.b2_maxProxies; ++i)
			{
				this.m_proxyPool[i].timeStamp = 0;
			}
			this.m_timeStamp = 1;
		}
		else
		{
			++this.m_timeStamp;
		}
	}


	static const s_validate = false;
	static const b2_invalid = b2Settings.USHRT_MAX;
	static const b2_nullEdge = b2Settings.USHRT_MAX;

	static function BinarySearch(bounds: b2Bound[], count: number, value: number): number {
		var low = 0;
		var high = count - 1;
		while (low <= high)
		{
			var mid = Math.floor((low + high) / 2);
			if (bounds[mid].value > value)
			{
				high = mid - 1;
			}
			else if (bounds[mid].value < value)
			{
				low = mid + 1;
			}
			else
			{
				return /*uint*/(mid);
			}
		}

		return /*uint*/(low);
	}
}
