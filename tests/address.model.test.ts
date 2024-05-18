import postgres from "postgres";
import Address, { AddressProps } from "../src/models/Address";
import Customer, { CustomerProps } from "../src/models/Customer";
import { test, describe, expect, afterEach, afterAll } from "vitest";

describe("Address CRUD operations", () => {
    const sql = postgres({
        database: "ECommDB",
    });

    /**
     * Helper function to create an Address with default or provided properties.
     * @param props The properties of the Address.
     * @returns A new Address object that has been persisted in the DB.
     */
	async function createCustomer(): Promise<Customer> {
		const customerProps: CustomerProps = {
			email: "test@example.com",
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
		let customer = await createCustomer();
	
		if (!customer.props.id) {
			throw new Error("Customer ID is not defined.");
		}
	
		const addressProps: AddressProps = {
			streetNumber: props.streetNumber || 123,
			civicNumber: props.civicNumber || 456,
			streetName: props.streetName || "Test Street",
			city: props.city || "Test City",
			province: props.province || "TS",
			country: props.country || "TC",
			postalCode: props.postalCode || "123456",
			customerId: customer.props.id,
		};
	
		return await Address.create(sql, addressProps);
	};

    afterEach(async () => {
        try {
            await sql.unsafe(`DELETE FROM address`);
            await sql.unsafe(`ALTER SEQUENCE address_id_seq RESTART WITH 1;`);
			await sql.unsafe("DELETE FROM customer");        
        	await sql.unsafe("ALTER SEQUENCE customer_id_seq RESTART WITH 1;");
        } catch (error) {
            console.error(error);
        }
    });

    afterAll(async () => {
        await sql.end();
    });

    test("Address was created.", async () => {
        const address = await createAddress();

        expect(address.props.streetNumber).toBe(123);
        expect(address.props.civicNumber).toBe(456);
        expect(address.props.streetName).toBe("Test Street");
        expect(address.props.city).toBe("Test City");
        expect(address.props.province).toBe("TS");
        expect(address.props.country).toBe("TC");
        expect(address.props.postalCode).toBe("123456");
        expect(address.props.customerId).toBe(1);
    });

    test("Address was retrieved.", async () => {
        const address = await createAddress();
        const readAddress = await Address.read(sql, address.props.id!);

        expect(readAddress?.props.streetNumber).toBe(123);
        expect(readAddress?.props.civicNumber).toBe(456);
        expect(readAddress?.props.streetName).toBe("Test Street");
        expect(readAddress?.props.city).toBe("Test City");
        expect(readAddress?.props.province).toBe("TS");
        expect(readAddress?.props.country).toBe("TC");
        expect(readAddress?.props.postalCode).toBe("123456");
        expect(readAddress?.props.customerId).toBe(1);
    });

    test("Address was updated.", async () => {
        const address = await createAddress();
        await address.update({ streetName: "Updated Street Name" });
        const updatedAddress = await Address.read(sql, address.props.id!);

        expect(updatedAddress?.props.streetName).toBe("Updated Street Name");
    });

    test("Address was deleted.", async () => {
        const address = await createAddress();
        await address.delete();
        const deletedAddress = await Address.read(sql, address.props.id!);

        expect(deletedAddress).toBeNull();
    });
});
