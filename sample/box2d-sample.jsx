import "../src/box2d/common/*.jsx";
import "../src/box2d/common/math/*.jsx";
import "../src/box2d/collision/*.jsx";
import "../src/box2d/collision/shapes/*.jsx";
import "../src/box2d/dynamics/*.jsx";
import "../src/box2d/dynamics/contacts/*.jsx";

import 'js/web.jsx';
import "console.jsx";


class _Main {
	static const PROFILER_URL = "http://localhosrt:5001/post-profile";

	static var seed = 0;
	static function random(): number {
		_Main.seed = (_Main.seed * 713 + 17) & 0xFF;
		return _Main.seed / 256;
	}
	static function drawWorld(world: b2World, context: CanvasRenderingContext2D): void {
		for (var b = world.m_bodyList; b != null; b = b.m_next) {
			for (var s = b.GetShapeList(); s != null; s = s.GetNext()) {
				_Main.drawShape(s, context);
			}
		}
	}
	static function drawShape(shape: b2Shape, context: CanvasRenderingContext2D): void {
	context.strokeStyle = '#ffffff';
	context.beginPath();
	switch (shape.m_type) {
		case b2Shape.e_circleShape:
			{
				var circle = shape as b2CircleShape;
				var pos = circle.m_position;
				var r = circle.m_radius;
				var segments = 16.0;
				var theta = 0.0;
				var dtheta = 2.0 * Math.PI / segments;
				// draw circle
				context.moveTo(pos.x + r, pos.y);
				for (var i = 0; i < segments; i++) {
					var d = new b2Vec2(r * Math.cos(theta), r * Math.sin(theta));
					var v = b2Math.AddVV(pos, d);
					context.lineTo(v.x, v.y);
					theta += dtheta;
				}
				context.lineTo(pos.x + r, pos.y);

				// draw radius
				context.moveTo(pos.x, pos.y);
				var ax = circle.m_R.col1;
				var pos2 = new b2Vec2(pos.x + r * ax.x, pos.y + r * ax.y);
				context.lineTo(pos2.x, pos2.y);
			}
			break;
		case b2Shape.e_polyShape:
			{
				var poly = shape as b2PolyShape;
				var tV = b2Math.AddVV(poly.m_position, b2Math.b2MulMV(poly.m_R, poly.m_vertices[0]));
				context.moveTo(tV.x, tV.y);
				for (var i = 0; i < poly.m_vertexCount; i++) {
					var v = b2Math.AddVV(poly.m_position, b2Math.b2MulMV(poly.m_R, poly.m_vertices[i]));
					context.lineTo(v.x, v.y);
				}
				context.lineTo(tV.x, tV.y);
			}
			break;
		}
		context.stroke();
	}
	static function createWorld(): b2World {
		var worldAABB = new b2AABB();
		worldAABB.minVertex.Set(-1000, -1000);
		worldAABB.maxVertex.Set(1000, 1000);

		var gravity = new b2Vec2(0, 300);

		var doSleep = true;
		var world = new b2World(worldAABB, gravity, doSleep);

		_Main.createGround(world);
		_Main.createBox(world, 0, 0, 10, 1000);
		_Main.createBox(world, 320, 0, 10, 1000);
		return world;
	}
	static function createGround(world: b2World): b2Body {
		var groundSd = new b2BoxDef();
		groundSd.extents.Set(1000, 10);
		groundSd.restitution = 0.2;
		groundSd.friction = 0.2;

		var groundBd = new b2BodyDef();
		groundBd.AddShape(groundSd);
		groundBd.position.Set(-500, 400);
		return world.CreateBody(groundBd);
	}
	static function createBox(world: b2World, x: number, y: number, width: number, height: number): b2Body {
		var boxSd = new b2BoxDef();
		boxSd.extents.Set(width, height);

		var boxBd = new b2BodyDef();
		boxBd.AddShape(boxSd);
		boxBd.position.Set(x,y);
		return world.CreateBody(boxBd);
	}
	static function createMy(world: b2World, x: number, y: number, r: number): b2Body {
		var ballSd = new b2PolyDef();
		ballSd.density = 1.0;
		ballSd.restitution = 0.8;
		var v = 3 + ((_Main.random() * 5) | 0);
		ballSd.vertexCount = v;
		for(var i = 0; i < v; i++) {
			//var r = 5;
			ballSd.vertices[i].Set(r * Math.cos(Math.PI * 2 / v * i), r * Math.sin(Math.PI * 2 / v * i));
		}
		//ballSd.restitution = 0.2;
		//ballSd.friction = ;
		var ballBd = new b2BodyDef();
		ballBd.AddShape(ballSd);
		ballBd.position.Set(x,y);

		var body = world.CreateBody(ballBd);

		/*var mass = new b2MassData();
		mass.mass = body.GetMass();
		mass.center = new b2Vec2(0, 0);
		console.log(
		body.SetMass(mass);*/
		//body.SetCenterPosition(new b2Vec2(0, 0), new b2Vec2(0, 0));

		return body;
	}

	static function main(args : string[]) :void {
		dom.window.setTimeout(function():void { dom.window.scrollTo(0, 0); }, 100);
		var canvas = dom.id("canvas") as HTMLCanvasElement;
		var ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

		var world = _Main.createWorld();

		var count = 50;
		for(var i = 0; i < count; i++) {
			_Main.createMy(world, i * (270 / count) + 25, -200 + _Main.random() * 300, 15 + _Main.random() * 10);
		}

		var frame = 0;
		var frameTotal = 0;
		dom.window.setTimeout(function () {
			if (JSX.profilerIsRunning()) {
				JSX.postProfileResults(_Main.PROFILER_URL);
			}
			console.log("ave. fps:" + (frameTotal / 10) as string + " in the first 10 sec.");
		}, 10000);
		var last = Date.now();
		function tick(): void {
			frame++;
			frameTotal++;
			dom.window.setTimeout(tick, 0);
			world.Step(1 / 60, 1);

			ctx.fillStyle = "#000";
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			_Main.drawWorld(world, ctx);
			var now = Date.now();
			if(now - last > 1000) {
				(dom.id("fps") as HTMLDivElement).innerHTML = "fps:" + frame as string;
				frame = 0;
				last = now;
			}
		};
		tick();
	}
}
