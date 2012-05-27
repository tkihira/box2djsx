class b2Bound {
	var value: number;
	var proxyId: number;
	var stabbingCount: number;
	
	function constructor() {
		this.value = 0;
		this.proxyId = 0;
		this.stabbingCount = 0;
	}
	function IsLower(): boolean { return (this.value & 1) == 0; }
	function IsUpper(): boolean { return (this.value & 1) == 1; }
	function Swap(b: b2Bound): void {
		var tempValue = this.value;
		var tempProxyId = this.proxyId;
		var tempStabbingCount = this.stabbingCount;

		this.value = b.value;
		this.proxyId = b.proxyId;
		this.stabbingCount = b.stabbingCount;

		b.value = tempValue;
		b.proxyId = tempProxyId;
		b.stabbingCount = tempStabbingCount;
	}
}
