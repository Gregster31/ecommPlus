import postgres from "postgres";
import Order, { OrderProps } from "../src/models/Order";
import Address, { AddressProps } from "../src/models/Address";
import Customer, { CustomerProps, DuplicateEmailError, InvalidCredentialsError } from "../src/models/Customer";
import { test, describe, expect, afterEach, afterAll } from "vitest";
import { createUTCDate } from "../src/utils";

describe("Order CRUD operations", () => {
    const sql = postgres({
        database: "ECommDB",
    });

    async function createCustomer(props: Partial<CustomerProps> = {}): Promise<Customer> {
		const customerProps: CustomerProps = {
			email: "test@example.com" || props.email,
			firstName: "John",
			lastName: "Doe",
			dateOfBirth: new Date("1990-01-01"),
			phoneNumber: "1234567890",
			password: "password123",
			userName: "johndoe",
			isAdmin: false,
		};
	
		 return await Customer.create(sql, customerProps);
	}

    const createAddress = async (props: Partial<AddressProps> = {}) => {

		const addressProps: AddressProps = {
			streetNumber: props.streetNumber || 123,
			civicNumber: props.civicNumber || 456,
			streetName: props.streetName || "Test Street",
			city: props.city || "Test City",
			province: props.province || "TS",
			country: props.country || "TC",
			postalCode: props.postalCode || "123456",
			customerId: props.customerId || 1,
		};
	
		return await Address.create(sql, addressProps);
	};


    /**
     * Helper function to create an Order with default or provided properties.
     * @param props The properties of the Order.
     * @default orderDate: The current date/time
     * @default totalPrice: 0
     * @default status: "incomplete"
     * @returns A new Order object that has been persisted in the DB.
     */
    const createOrder = async (props: Partial<OrderProps> = {}) => {
        const orderProps: OrderProps = {
            orderDate: props.orderDate || createUTCDate(),
            totalPrice: 22,
            status: "incomplete",
            customerId: props.customerId || 1,
            addressId: props.id || 1, // Assuming address_id 1 exists
        };

        return await Order.create(sql, orderProps);
    };

    afterEach(async () => {
        try {
            await sql`DELETE FROM "order"`;
            await sql`ALTER SEQUENCE "order_id_seq" RESTART WITH 1`;
            await sql.unsafe("DELETE FROM customer");        
        	await sql.unsafe("ALTER SEQUENCE customer_id_seq RESTART WITH 1;");
        } catch (error) {
            console.error(error);
        }
    });

    afterAll(async () => {
        await sql.end();
    });

    test("Order was created.", async () => {
        let customer = await createCustomer();
        let address = await createAddress(customer.props);
        const order = await createOrder(address.props);

        expect(order.props.totalPrice).toBe("22");
        expect(order.props.status).toBe("incomplete");        
    });

    test("Order was retrieved.", async () => {
        let customer = await createCustomer();
        let address = await createAddress(customer.props);
        const order = await createOrder(address.props);

        const readOrder = await Order.read(sql, order.props.id!);

        expect(readOrder).not.toBeNull();
        expect(readOrder?.props.totalPrice).toBe("22");
        expect(readOrder?.props.status).toBe("incomplete");        
    });

    test("Orders were listed.", async () => {
        let customer = await createCustomer();
        let address = await createAddress(customer.props);
        const order1 = await createOrder(address.props);        
        const order2 = await createOrder(address.props);
        const order3 = await createOrder(address.props);        

        const orders = await Order.readAll(sql);

        expect(orders).toContainEqual(order1);
        expect(orders).toContainEqual(order2);
        expect(orders).toContainEqual(order3);
    });

    test("Order was updated.", async () => {
        let customer = await createCustomer();
        let address = await createAddress(customer.props);
        const order = await createOrder(address.props);

        await order.update({ totalPrice: 50 });

        const updatedOrder = await Order.read(sql, order.props.id!);

        expect(updatedOrder).not.toBeNull();
        expect(updatedOrder?.props.totalPrice).toBe("50");
    });

    test("Order was deleted.", async () => {
        let customer = await createCustomer();
        let address = await createAddress(customer.props);
        const order = await createOrder(address.props);

        await order.delete();

        const deletedOrder = await Order.read(sql, order.props.id!);

        expect(deletedOrder).toBeNull();
    });

    test("Order was marked as complete.", async () => {
        let customer = await createCustomer();
        let address = await createAddress(customer.props);
        const order = await createOrder(address.props);

        expect(order.props.status).toBe("incomplete");

        await order.markComplete();

        const completedOrder = await Order.read(sql, order.props.id!);

        expect(completedOrder?.props.status).toBe("complete");
    });
});
