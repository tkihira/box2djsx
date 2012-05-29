class b2Settings {
	static const USHRT_MAX = 0x0000ffff;
	static const b2_pi = Math.PI;
	static const b2_massUnitsPerKilogram = 1.0;
	static const b2_timeUnitsPerSecond = 1.0;
	static const b2_lengthUnitsPerMeter = 30.0;
	static const b2_maxManifoldPoints = 2;
	static const b2_maxShapesPerBody = 64;
	static const b2_maxPolyVertices = 16;
	static const b2_maxProxies = 1024;
	static const b2_maxPairs = 8 * b2Settings.b2_maxProxies;
	static const b2_linearSlop = 0.005 * b2Settings.b2_lengthUnitsPerMeter;
	static const b2_angularSlop = 2.0 / 180.0 * b2Settings.b2_pi;
	static const b2_velocityThreshold = 1.0 * b2Settings.b2_lengthUnitsPerMeter / b2Settings.b2_timeUnitsPerSecond;
	static const b2_maxLinearCorrection = 0.2 * b2Settings.b2_lengthUnitsPerMeter;
	static const b2_maxAngularCorrection = 8.0 / 180.0 * b2Settings.b2_pi;
	static const b2_contactBaumgarte = 0.2;
	static const b2_timeToSleep = 0.5 * b2Settings.b2_timeUnitsPerSecond;
	static const b2_linearSleepTolerance = 0.01 * b2Settings.b2_lengthUnitsPerMeter / b2Settings.b2_timeUnitsPerSecond;
	static const b2_angularSleepTolerance = 2.0 / 180.0 / b2Settings.b2_timeUnitsPerSecond;
	static function b2Assert(a: boolean) : void {
		if(!a) {
			debugger;
		}
	}
}
