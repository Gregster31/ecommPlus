import postgres from "postgres";
import Customer, { CustomerProps, DuplicateEmailError, InvalidCredentialsError } from "../src/models/Customer";
import { test, describe, expect, afterEach, afterAll } from "vitest";
import { createUTCDate } from "../src/utils";

describe("Category CRUD operations", () => {
    const sql = postgres({
        database: "ECommDB",
    });

    /**
     * Helper function to create a Category with default or provided properties.
     * @param props The properties of the Category.
     * @returns A new Category object that has been persisted in the DB.
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
	

    afterEach(async () => {
		try {
			await sql.unsafe("DELETE FROM customer");
	
			await sql.unsafe("ALTER SEQUENCE customer_id_seq RESTART WITH 1;");
		} catch (error) {
			console.error("Error cleaning up database:", error);
		}
	});

    afterAll(async () => {
        await sql.end();
    });

    test("Customer was created.", async () => {
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
	
		const customer = await Customer.create(sql, customerProps);
		expect(customer.props.email).toBe(customerProps.email);
		expect(customer.props.firstName).toBe(customerProps.firstName);
	});
	
	test("Creating customer with duplicate email throws error.", async () => {
		await createCustomer();
		const customerProps: CustomerProps = {
			email: "test@example.com",
			firstName: "Jane",
			lastName: "Doe",
			dateOfBirth: new Date("1995-01-01"),
			phoneNumber: "9876543210",
			password: "password456",
			userName: "janedoe",
			isAdmin: false,
		};
	
		await expect(Customer.create(sql, customerProps)).rejects.toThrow(DuplicateEmailError);
	});	
	
	test("Customer can login with correct credentials.", async () => {
		await createCustomer();
		const email = "test@example.com";
		const password = "password123";
	
		const customer = await Customer.login(sql, email, password);
		expect(customer.props.email).toBe(email);
	});
	
	test("Login with incorrect credentials throws error.", async () => {
		const email = "test@example.com";
		const password = "incorrectpassword";
	
		await expect(Customer.login(sql, email, password)).rejects.toThrow(InvalidCredentialsError);
	});
	
	test("Customer information can be updated.", async () => {
		const customer = await createCustomer();
	
		const updateProps: Partial<CustomerProps> = {
			firstName: "UpdatedFirstName",
		};
	
		await customer.update(updateProps);
	
		const updatedCustomer = await Customer.read(sql, customer.props.id!);
		expect(updatedCustomer?.props.firstName).toBe(updateProps.firstName);
	});
	
	test("Customer can be deleted.", async () => {
		const customer = await createCustomer();
	
		await customer.delete();
	
		const deletedCustomer = await Customer.read(sql, customer.props.id!);
		expect(deletedCustomer).toBeNull();
	});
	
});
