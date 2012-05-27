class b2Settings {
	static var USHRT_MAX = 0x0000ffff;
	static var b2_pi = Math.PI;
	static var b2_massUnitsPerKilogram = 1.0;
	static var b2_timeUnitsPerSecond = 1.0;
	static var b2_lengthUnitsPerMeter = 30.0;
	static var b2_maxManifoldPoints = 2;
	static var b2_maxShapesPerBody = 64;
	static var b2_maxPolyVertices = 16;
	static var b2_maxProxies = 1024;
	static var b2_maxPairs = 8 * b2Settings.b2_maxProxies;
	static var b2_linearSlop = 0.005 * b2Settings.b2_lengthUnitsPerMeter;
	static var b2_angularSlop = 2.0 / 180.0 * b2Settings.b2_pi;
	static var b2_velocityThreshold = 1.0 * b2Settings.b2_lengthUnitsPerMeter / b2Settings.b2_timeUnitsPerSecond;
	static var b2_maxLinearCorrection = 0.2 * b2Settings.b2_lengthUnitsPerMeter;
	static var b2_maxAngularCorrection = 8.0 / 180.0 * b2Settings.b2_pi;
	static var b2_contactBaumgarte = 0.2;
	static var b2_timeToSleep = 0.5 * b2Settings.b2_timeUnitsPerSecond;
	static var b2_linearSleepTolerance = 0.01 * b2Settings.b2_lengthUnitsPerMeter / b2Settings.b2_timeUnitsPerSecond;
	static var b2_angularSleepTolerance = 2.0 / 180.0 / b2Settings.b2_timeUnitsPerSecond;
	static function b2Assert(a: boolean) : void {
		if(!a) {
			debugger;
		}
	}
}
