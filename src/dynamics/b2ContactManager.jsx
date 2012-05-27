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
	
	// TODO: now here

}
