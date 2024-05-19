import postgres from "postgres";
import { describe, test, expect, beforeEach, afterEach } from "vitest";
import Customer, { CustomerProps } from "../src/models/Customer";
import { StatusCode } from "../src/router/Response";
import { HttpResponse, clearCookieJar, makeHttpRequest } from "./client";
import { createUTCDate } from "../src/utils";

describe("Customer HTTP operations", () => {
    const sql = postgres({
        database: "ECommDB",
    });

    const createCustomer = async (props: Partial<CustomerProps> = {}) => {
        const customerProps: CustomerProps = {
            email: props.email || "test@example.com",
            firstName: props.firstName || "John",
            lastName: props.lastName || "Doe",
            dateOfBirth: props.dateOfBirth || new Date('2000-01-01'),
            phoneNumber: props.phoneNumber || "1234567890",
            password: props.password || "password",
            userName: props.userName || "johndoe",
            isAdmin: props.isAdmin || false,
        };

        return await Customer.create(sql, customerProps);
    };

    const login = async (email: string = "test@example.com", password: string = "password") => {
        await makeHttpRequest("POST", "/login", { email, password });
    };
    

    afterEach(async () => {
        const tables = ["customer"];

        try {
            for (const table of tables) {
                await sql.unsafe(`DELETE FROM ${table}`);
                await sql.unsafe(`ALTER SEQUENCE ${table}_id_seq RESTART WITH 1;`);
            }
        } catch (error) {
            console.error(error);
        }

        await makeHttpRequest("GET", "/logout");
        clearCookieJar();
    });

    test("Customer was created.", async () => {
        const { statusCode, body }: HttpResponse = await makeHttpRequest("POST", "/customers", {
            email: "newcustomer@example.com",
            firstName: "Jane",
            lastName: "Doe",
            dateOfBirth: new Date('1990-01-01'),
            phoneNumber: "0987654321",
            password: "newpassword",
            userName: "janedoe",
            isAdmin: false,
        });

        expect(statusCode).toBe(StatusCode.Created);
        expect(body.message).toBe("Customer created successfully!");
        expect(body.payload.customer.email).toBe("newcustomer@example.com");
        expect(body.payload.customer.firstName).toBe("Jane");
    });

    test("Customer login was successful.", async () => {
        await createCustomer();
        const { statusCode, body }: HttpResponse = await makeHttpRequest("POST", "/login", {
            email: "test@example.com",
            password: "password",
        });

        expect(statusCode).toBe(StatusCode.OK);
        expect(body.message).toBe("Logged in successfully!");
    });

    test("Customer login failed with wrong credentials.", async () => {
        const { statusCode, body }: HttpResponse = await makeHttpRequest("POST", "/login", {
            email: "test@example.com",
            password: "wrongpassword",
        });

        expect(statusCode).toBe(StatusCode.Unauthorized);
        expect(body.message).toBe("Invalid credentials.");
    });

    test("Customer details were retrieved.", async () => {
        await login();
        const customer = await createCustomer({ email: "anothercustomer@example.com" });

        const { statusCode, body }: HttpResponse = await makeHttpRequest("GET", `/customers/${customer.props.id}`);

        expect(statusCode).toBe(StatusCode.OK);
        expect(body.message).toBe("Customer retrieved successfully!");
        expect(body.payload.customer.email).toBe("anothercustomer@example.com");
    });

    test("Customer was updated.", async () => {
        await login();
        const customer = await createCustomer({ email: "updatablecustomer@example.com" });

        const { statusCode, body }: HttpResponse = await makeHttpRequest("PUT", `/customers/${customer.props.id}`, {
            firstName: "UpdatedFirstName",
        });

        expect(statusCode).toBe(StatusCode.OK);
        expect(body.message).toBe("Customer updated successfully!");
        expect(body.payload.customer.firstName).toBe("UpdatedFirstName");
    });

    test("Customer was deleted.", async () => {
        await login();
        const customer = await createCustomer({ email: "deletablecustomer@example.com" });

        const { statusCode, body }: HttpResponse = await makeHttpRequest("DELETE", `/customers/${customer.props.id}`);

        expect(statusCode).toBe(StatusCode.OK);
        expect(body.message).toBe("Customer deleted successfully!");
    });

    test("Customer was not retrieved due to invalid ID.", async () => {
        await login();
        const { statusCode, body }: HttpResponse = await makeHttpRequest("GET", "/customers/abc");

        expect(statusCode).toBe(StatusCode.BadRequest);
        expect(body.message).toBe("Invalid ID");
    });

    test("Customer was not found.", async () => {
        await login();
        const { statusCode, body }: HttpResponse = await makeHttpRequest("GET", "/customers/999");

        expect(statusCode).toBe(StatusCode.NotFound);
        expect(body.message).toBe("Customer not found");
    });
    
});
