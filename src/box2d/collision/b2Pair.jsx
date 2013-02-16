import "../common/b2Settings.jsx";

class b2Pair {
	var userData: variant;
	var proxyId1 = 0;
	var proxyId2 = 0;
	var next = 0;
	var status = 0;

	function SetBuffered(): void	{ this.status |= b2Pair.e_pairBuffered; }
	function ClearBuffered(): void	{ this.status &= ~b2Pair.e_pairBuffered; }
	function IsBuffered(): boolean	{ return (this.status & b2Pair.e_pairBuffered) == b2Pair.e_pairBuffered; }

	function SetRemoved(): void		{ this.status |= b2Pair.e_pairRemoved; }
	function ClearRemoved(): void	{ this.status &= ~b2Pair.e_pairRemoved; }
	function IsRemoved(): boolean	{ return (this.status & b2Pair.e_pairRemoved) == b2Pair.e_pairRemoved; }

	function SetFinal(): void		{ this.status |= b2Pair.e_pairFinal; }
	function IsFinal(): boolean		{ return (this.status & b2Pair.e_pairFinal) == b2Pair.e_pairFinal; }

	static var b2_nullPair = b2Settings.USHRT_MAX;
	static var b2_nullProxy = b2Settings.USHRT_MAX;
	static var b2_tableCapacity = b2Settings.b2_maxPairs;
	static var b2_tableMask = b2Pair.b2_tableCapacity - 1;
	static const e_pairBuffered = 0x0001;
	static const e_pairRemoved = 0x0002;
	static const e_pairFinal = 0x0004;

}
