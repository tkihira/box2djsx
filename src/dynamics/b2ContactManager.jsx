import "common/*.jsx";
import "common/math/*.jsx";
import "collision/*.jsx";
import "collision/shapes/*.jsx";
import "dynamics/*.jsx";
import "dynamics/contacts/*.jsx";

class b2ContactManager extends b2PairCallback {
	var m_world: b2World;

	// This lets us provide broadphase proxy pair user data for
	// contacts that shouldn't exist.
	var m_nullContact: b2NullContact;
	var m_destroyImmediate: boolean;

	function constructor(){
		// The constructor for b2PairCallback
		//

		// initialize instance variables for references
		this.m_nullContact = new b2NullContact();

		this.m_world = null;
		this.m_destroyImmediate = false;
	}

	override function PairAdded(proxyUserData1: variant, proxyUserData2: variant): variant {
		var shape1 = proxyUserData1 as b2Shape;
		var shape2 = proxyUserData2 as b2Shape;

		var body1 = shape1.m_body;
		var body2 = shape2.m_body;

		if (body1.IsStatic() && body2.IsStatic())
		{
			return this.m_nullContact;
		}

		if (shape1.m_body == shape2.m_body)
		{
			return this.m_nullContact;
		}

		if (body2.IsConnected(body1))
		{
			return this.m_nullContact;
		}

		if (this.m_world.m_filter != null && this.m_world.m_filter.ShouldCollide(shape1, shape2) == false)
		{
			return this.m_nullContact;
		}

		// Ensure that body2 is dynamic (body1 is static or dynamic).
		if (body2.m_invMass == 0.0)
		{
			var tempShape = shape1;
			shape1 = shape2;
			shape2 = tempShape;
			//b2Math.b2Swap(shape1, shape2);
			var tempBody = body1;
			body1 = body2;
			body2 = tempBody;
			//b2Math.b2Swap(body1, body2);
		}

		// Call the factory.
		var contact = b2Contact.Create(shape1, shape2, this.m_world.m_blockAllocator);

		if (contact == null)
		{
			return this.m_nullContact;
		}
		else
		{
			// Insert into the world.
			contact.m_prev = null;
			contact.m_next = this.m_world.m_contactList;
			if (this.m_world.m_contactList != null)
			{
				this.m_world.m_contactList.m_prev = contact;
			}
			this.m_world.m_contactList = contact;
			this.m_world.m_contactCount++;
		}

		return contact;
	}
	
	override function PairRemoved(proxyUserData1: variant, proxyUserData2: variant, pairUserData: variant): void{

		if (pairUserData == null)
		{
			return;
		}

		var c = pairUserData as b2Contact;
		if (c != this.m_nullContact)
		{
			//b2Settings.b2Assert(this.m_world.m_contactCount > 0);
			if (this.m_destroyImmediate == true)
			{
				this.DestroyContact(c);
				c = null;
			}
			else
			{
				c.m_flags |= b2Contact.e_destroyFlag;
			}
		}
	}

	function DestroyContact(c: b2Contact): void{

		//b2Settings.b2Assert(this.m_world.m_contactCount > 0);

		// Remove from the world.
		if (c.m_prev != null)
		{
			c.m_prev.m_next = c.m_next;
		}

		if (c.m_next != null)
		{
			c.m_next.m_prev = c.m_prev;
		}

		if (c == this.m_world.m_contactList)
		{
			this.m_world.m_contactList = c.m_next;
		}

		// If there are contact points, then disconnect from the island graph.
		if (c.GetManifoldCount() > 0)
		{
			var body1 = c.m_shape1.m_body;
			var body2 = c.m_shape2.m_body;
			var node1 = c.m_node1;
			var node2 = c.m_node2;

			// Wake up touching bodies.
			body1.WakeUp();
			body2.WakeUp();

			// Remove from body 1
			if (node1.prev != null)
			{
				node1.prev.next = node1.next;
			}

			if (node1.next != null)
			{
				node1.next.prev = node1.prev;
			}

			if (node1 == body1.m_contactList)
			{
				body1.m_contactList = node1.next;
			}

			node1.prev = null;
			node1.next = null;

			// Remove from body 2
			if (node2.prev != null)
			{
				node2.prev.next = node2.next;
			}

			if (node2.next != null)
			{
				node2.next.prev = node2.prev;
			}

			if (node2 == body2.m_contactList)
			{
				body2.m_contactList = node2.next;
			}

			node2.prev = null;
			node2.next = null;
		}

		// Call the factory.
		b2Contact.Destroy(c, this.m_world.m_blockAllocator);
		--this.m_world.m_contactCount;
	}

	function CleanContactList(): void {
		var c = this.m_world.m_contactList;
		while (c != null)
		{
			var c0 = c;
			c = c.m_next;

			if ((c0.m_flags & b2Contact.e_destroyFlag) != 0)
			{
				this.DestroyContact(c0);
				c0 = null;
			}
		}
	}

	function Collide(): void{
		var body1;
		var body2;
		var node1;
		var node2;

		for (var c = this.m_world.m_contactList; c != null; c = c.m_next)
		{
			if (c.m_shape1.m_body.IsSleeping() &&
				c.m_shape2.m_body.IsSleeping())
			{
				continue;
			}

			var oldCount = c.GetManifoldCount();
			c.Evaluate();

			var newCount = c.GetManifoldCount();

			if (oldCount == 0 && newCount > 0)
			{
				//b2Settings.b2Assert(c.GetManifolds().pointCount > 0);

				// Connect to island graph.
				body1 = c.m_shape1.m_body;
				body2 = c.m_shape2.m_body;
				node1 = c.m_node1;
				node2 = c.m_node2;

				// Connect to body 1
				node1.contact = c;
				node1.other = body2;

				node1.prev = null;
				node1.next = body1.m_contactList;
				if (node1.next != null)
				{
					node1.next.prev = c.m_node1;
				}
				body1.m_contactList = c.m_node1;

				// Connect to body 2
				node2.contact = c;
				node2.other = body1;

				node2.prev = null;
				node2.next = body2.m_contactList;
				if (node2.next != null)
				{
					node2.next.prev = node2;
				}
				body2.m_contactList = node2;
			}
			else if (oldCount > 0 && newCount == 0)
			{
				// Disconnect from island graph.
				body1 = c.m_shape1.m_body;
				body2 = c.m_shape2.m_body;
				node1 = c.m_node1;
				node2 = c.m_node2;

				// Remove from body 1
				if (node1.prev != null)
				{
					node1.prev.next = node1.next;
				}

				if (node1.next != null)
				{
					node1.next.prev = node1.prev;
				}

				if (node1 == body1.m_contactList)
				{
					body1.m_contactList = node1.next;
				}

				node1.prev = null;
				node1.next = null;

				// Remove from body 2
				if (node2.prev != null)
				{
					node2.prev.next = node2.next;
				}

				if (node2.next != null)
				{
					node2.next.prev = node2.prev;
				}

				if (node2 == body2.m_contactList)
				{
					body2.m_contactList = node2.next;
				}

				node2.prev = null;
				node2.next = null;
			}
		}
	}
}
