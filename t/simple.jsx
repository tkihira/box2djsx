import "test-case.jsx";

import "../src/box2d/common/*.jsx";
import "../src/box2d/common/math/*.jsx";
import "../src/box2d/collision/*.jsx";
import "../src/box2d/collision/shapes/*.jsx";
import "../src/box2d/dynamics/*.jsx";
import "../src/box2d/dynamics/contacts/*.jsx";

class _Test extends TestCase {
  function testHello() : void {
    var aabb  = new b2AABB();
    aabb.minVertex.Set(-100, -100);
    aabb.maxVertex.Set( 100,  100);

    var gravity = new b2Vec2(0, 300);

    var world = new b2World(aabb, gravity, true);

    this.pass("create world");
  }
}

// vim: set tabstop=2 shiftwidth=2 expandtab:
