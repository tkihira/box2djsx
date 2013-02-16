import "../common/*.jsx";
import "../common/math/*.jsx";
import "../collision/*.jsx";

class b2PairManager {
	var m_broadPhase: b2BroadPhase;
	var m_callback: b2PairCallback;
	var m_pairs: b2Pair[];
	var m_freePair = 0;
	var m_pairCount: number;

	var m_pairBuffer: b2BufferedPair[];
	var m_pairBufferCount = 0;

	var m_hashTable: number[];

	function constructor() {
		var i = 0;
		//b2Settings.b2Assert(b2Math.b2IsPowerOfTwo(b2Pair.b2_tableCapacity) == true);
		//b2Settings.b2Assert(b2Pair.b2_tableCapacity >= b2Settings.b2_maxPairs);
		this.m_hashTable = []: number[]; this.m_hashTable.length = b2Pair.b2_tableCapacity;
		for (i = 0; i < b2Pair.b2_tableCapacity; ++i)
		{
			this.m_hashTable[i] = b2Pair.b2_nullPair;
		}
		this.m_pairs = []: b2Pair[]; this.m_pairs.length = b2Settings.b2_maxPairs;
		for (i = 0; i < b2Settings.b2_maxPairs; ++i)
		{
			this.m_pairs[i] = new b2Pair();
		}
		this.m_pairBuffer = []: b2BufferedPair[];this.m_pairBuffer.length = b2Settings.b2_maxPairs;
		for (i = 0; i < b2Settings.b2_maxPairs; ++i)
		{
			this.m_pairBuffer[i] = new b2BufferedPair();
		}

		for (i = 0; i < b2Settings.b2_maxPairs; ++i)
		{
			this.m_pairs[i].proxyId1 = b2Pair.b2_nullProxy;
			this.m_pairs[i].proxyId2 = b2Pair.b2_nullProxy;
			this.m_pairs[i].userData = null;
			this.m_pairs[i].status = 0;
			this.m_pairs[i].next = (i + 1);
		}
		this.m_pairs[b2Settings.b2_maxPairs-1].next = b2Pair.b2_nullPair;
		this.m_pairCount = 0;
	}

	function Initialize(broadPhase: b2BroadPhase, callback: b2PairCallback): void {
		this.m_broadPhase = broadPhase;
		this.m_callback = callback;
	}

	function AddBufferedPair(proxyId1: number, proxyId2: number): void {
		//b2Settings.b2Assert(id1 != b2_nullProxy && id2 != b2_nullProxy);
		//b2Settings.b2Assert(this.m_pairBufferCount < b2_maxPairs);

		var pair = this.AddPair(proxyId1, proxyId2);

		// If this pair is not in the pair buffer ...
		if (pair.IsBuffered() == false)
		{
			// This must be a newly added pair.
			//b2Settings.b2Assert(pair.IsFinal() == false);

			// Add it to the pair buffer.
			pair.SetBuffered();
			this.m_pairBuffer[this.m_pairBufferCount].proxyId1 = pair.proxyId1;
			this.m_pairBuffer[this.m_pairBufferCount].proxyId2 = pair.proxyId2;
			++this.m_pairBufferCount;

			//b2Settings.b2Assert(this.m_pairBufferCount <= this.m_pairCount);
		}

		// Confirm this pair for the subsequent call to this.Commit.
		pair.ClearRemoved();

		if (b2BroadPhase.s_validate)
		{
			this.ValidateBuffer();
		}
	}

	function RemoveBufferedPair(proxyId1: number, proxyId2: number): void {
		//b2Settings.b2Assert(id1 != b2_nullProxy && id2 != b2_nullProxy);
		//b2Settings.b2Assert(this.m_pairBufferCount < b2_maxPairs);

		var pair = this.Find(proxyId1, proxyId2);

		if (pair == null)
		{
			// The pair never existed. This is legal (due to collision filtering).
			return;
		}

		// If this pair is not in the pair buffer ...
		if (pair.IsBuffered() == false)
		{
			// This must be an old pair.
			//b2Settings.b2Assert(pair.IsFinal() == true);

			pair.SetBuffered();
			this.m_pairBuffer[this.m_pairBufferCount].proxyId1 = pair.proxyId1;
			this.m_pairBuffer[this.m_pairBufferCount].proxyId2 = pair.proxyId2;
			++this.m_pairBufferCount;

			//b2Settings.b2Assert(this.m_pairBufferCount <= this.m_pairCount);
		}

		pair.SetRemoved();

		if (b2BroadPhase.s_validate)
		{
			this.ValidateBuffer();
		}
	}

	function Commit(): void {
		var i = 0;

		var removeCount = 0;

		var proxies = this.m_broadPhase.m_proxyPool;

		for (i = 0; i < this.m_pairBufferCount; ++i)
		{
			var pair = this.Find(this.m_pairBuffer[i].proxyId1, this.m_pairBuffer[i].proxyId2);
			//b2Settings.b2Assert(pair.IsBuffered());
			pair.ClearBuffered();

			//b2Settings.b2Assert(pair.proxyId1 < b2Settings.b2_maxProxies && pair.proxyId2 < b2Settings.b2_maxProxies);

			var proxy1 = proxies[ pair.proxyId1 ];
			var proxy2 = proxies[ pair.proxyId2 ];

			//b2Settings.b2Assert(proxy1.IsValid());
			//b2Settings.b2Assert(proxy2.IsValid());

			if (pair.IsRemoved())
			{
				// It is possible a pair was added then removed before a commit. Therefore,
				// we should be careful not to tell the user the pair was removed when the
				// the user didn't receive a matching add.
				if (pair.IsFinal() == true)
				{
					this.m_callback.PairRemoved(proxy1.userData, proxy2.userData, pair.userData);
				}

				// Store the ids so we can actually remove the pair below.
				this.m_pairBuffer[removeCount].proxyId1 = pair.proxyId1;
				this.m_pairBuffer[removeCount].proxyId2 = pair.proxyId2;
				++removeCount;
			}
			else
			{
				//b2Settings.b2Assert(this.m_broadPhase.TestOverlap(proxy1, proxy2) == true);

				if (pair.IsFinal() == false)
				{
					pair.userData = this.m_callback.PairAdded(proxy1.userData, proxy2.userData);
					pair.SetFinal();
				}
			}
		}

		for (i = 0; i < removeCount; ++i)
		{
			this.RemovePair(this.m_pairBuffer[i].proxyId1, this.m_pairBuffer[i].proxyId2);
		}

		this.m_pairBufferCount = 0;

		if (b2BroadPhase.s_validate)
		{
			this.ValidateTable();
		}
	}

	function AddPair(proxyId1: number, proxyId2: number): b2Pair {

		if (proxyId1 > proxyId2){
			var temp = proxyId1;
			proxyId1 = proxyId2;
			proxyId2 = temp;
			//b2Math.b2Swap(p1, p2);
		}

		var hash = b2PairManager.Hash(proxyId1, proxyId2) & b2Pair.b2_tableMask;

		//var pairIndex = this.FindHash(proxyId1, proxyId2, hash);
		var pair = pair = this.FindHash(proxyId1, proxyId2, hash);

		if (pair != null)
		{
			return pair;
		}

		//b2Settings.b2Assert(this.m_pairCount < b2Settings.b2_maxPairs && this.m_freePair != b2_nullPair);

		var pIndex = this.m_freePair;
		pair = this.m_pairs[pIndex];
		this.m_freePair = pair.next;

		pair.proxyId1 = proxyId1;
		pair.proxyId2 = proxyId2;
		pair.status = 0;
		pair.userData = null;
		pair.next = this.m_hashTable[hash];

		this.m_hashTable[hash] = pIndex;

		++this.m_pairCount;

		return pair;
	}

	function RemovePair(proxyId1: number, proxyId2: number): variant{

		//b2Settings.b2Assert(this.m_pairCount > 0);

		if (proxyId1 > proxyId2){
			var temp = proxyId1;
			proxyId1 = proxyId2;
			proxyId2 = temp;
			//b2Math.b2Swap(proxyId1, proxyId2);
		}

		var hash = b2PairManager.Hash(proxyId1, proxyId2) & b2Pair.b2_tableMask;

		var node = this.m_hashTable[hash];
		var pNode: b2Pair = null;

		while (node != b2Pair.b2_nullPair)
		{
			if (b2PairManager.Equals(this.m_pairs[node], proxyId1, proxyId2))
			{
				var index = node;

				//*node = this.m_pairs[*node].next;
				if (pNode != null){
					pNode.next = this.m_pairs[node].next;
				}
				else{
					this.m_hashTable[hash] = this.m_pairs[node].next;
				}

				var pair = this.m_pairs[ index ];
				var userData = pair.userData;

				// Scrub
				pair.next = this.m_freePair;
				pair.proxyId1 = b2Pair.b2_nullProxy;
				pair.proxyId2 = b2Pair.b2_nullProxy;
				pair.userData = null;
				pair.status = 0;

				this.m_freePair = index;
				--this.m_pairCount;
				return userData;
			}
			else
			{
				//node = &this.m_pairs[*node].next;
				pNode = this.m_pairs[node];
				node = pNode.next;
			}
		}

		//b2Settings.b2Assert(false);
		return null;
	}

	function Find(proxyId1: number, proxyId2: number): b2Pair {

		if (proxyId1 > proxyId2){
			var temp = proxyId1;
			proxyId1 = proxyId2;
			proxyId2 = temp;
			//b2Math.b2Swap(proxyId1, proxyId2);
		}

		var hash = b2PairManager.Hash(proxyId1, proxyId2) & b2Pair.b2_tableMask;

		return this.FindHash(proxyId1, proxyId2, hash);
	}

	function FindHash(proxyId1: number, proxyId2: number, hash: number): b2Pair {
		var index = this.m_hashTable[hash];

		while( index != b2Pair.b2_nullPair && b2PairManager.Equals(this.m_pairs[index], proxyId1, proxyId2) == false)
		{
			index = this.m_pairs[index].next;
		}

		if ( index == b2Pair.b2_nullPair )
		{
			return null;
		}

		//b2Settings.b2Assert(index < b2_maxPairs);

		return this.m_pairs[ index ];
	}

	function ValidateBuffer(): void {
		// DEBUG
	}

	function ValidateTable(): void {
		// DEBUG
	}

	static function Hash(proxyId1: number, proxyId2: number): number
	{
		var key = ((proxyId2 << 16) & 0xffff0000) | proxyId1;
		key = ~key + ((key << 15) & 0xFFFF8000);
		key = key ^ ((key >> 12) & 0x000fffff);
		key = key + ((key << 2) & 0xFFFFFFFC);
		key = key ^ ((key >> 4) & 0x0fffffff);
		key = key * 2057;
		key = key ^ ((key >> 16) & 0x0000ffff);
		return key;
	}
	static function Equals(pair: b2Pair, proxyId1: number, proxyId2: number): boolean
	{
		return (pair.proxyId1 == proxyId1 && pair.proxyId2 == proxyId2);
	}
	static function EqualsPair(pair1: b2Pair, pair2: b2Pair): boolean
	{
		return pair1.proxyId1 == pair2.proxyId1 && pair1.proxyId2 == pair2.proxyId2;
	}
}
