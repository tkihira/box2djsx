import "test-case.jsx";

import "box2d.jsx/common/*.jsx";
import "box2d.jsx/common/math/*.jsx";
import "box2d.jsx/collision/*.jsx";
import "box2d.jsx/collision/shapes/*.jsx";
import "box2d.jsx/dynamics/*.jsx";
import "box2d.jsx/dynamics/contacts/*.jsx";

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
