import postgres from "postgres";
import Category, { CategoryProps } from "../src/models/Category";
import { StatusCode } from "../src/router/Response";
import { HttpResponse, clearCookieJar, makeHttpRequest } from "./client";
import { test, describe, expect, afterEach, beforeEach } from "vitest";
import Customer, { CustomerProps } from "../src/models/Customer";
import { createUTCDate } from "../src/utils";

describe("Category HTTP operations", () => {
    const sql = postgres({
        database: "ECommDB",
    });

    async function createCustomer(): Promise<Customer> {
		const customerProps: CustomerProps = {
			email: "testA@example.com",
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

    const login = async (
        email: string = "user@email.com",
        password: string = "password",
    ) => {
        await makeHttpRequest("POST", "/login", {
            email,
            password,
        });
    };

    const createCategory = async (props: Partial<CategoryProps> = {}) => {
        const categoryProps: CategoryProps = {
            name: props.name || "Test Category",
        };

        return await Category.create(sql, categoryProps);
    };   

    afterEach(async () => {
        const tables = ["categories", "users"];

        try {
            for (const table of tables) {
                await sql.unsafe(`DELETE FROM ${table}`);
                await sql.unsafe(
                    `ALTER SEQUENCE ${table}_id_seq RESTART WITH 1;`,
                );
            }
        } catch (error) {
            console.error(error);
        }

        await makeHttpRequest("GET", "/logout");
        clearCookieJar();
    });

    test("New Category form was retrieved successfully.", async () => {
        const { statusCode, body }: HttpResponse = await makeHttpRequest(
            "GET",
            "/categories/new",
        );

        expect(statusCode).toBe(StatusCode.OK);
        expect(body.message).toBe("New Category form");
    });

    test("Category was created.", async () => {
        await login();

        const { statusCode, body }: HttpResponse = await makeHttpRequest(
            "POST",
            "/categories",
            {
                name: "Test Category",
            },
        );

        expect(statusCode).toBe(StatusCode.Created);
        expect(body.message).toBe("Category created successfully!");
    });

    test("Category was not created due to missing name.", async () => {
        await login();

        const { statusCode, body }: HttpResponse = await makeHttpRequest(
            "POST",
            "/categories",
            {},
        );

        expect(statusCode).toBe(StatusCode.BadRequest);
        expect(body.message).toBe("Error while creating category");
    });

    test("Category was retrieved.", async () => {
        await login();
        const category = await createCategory();

        const { statusCode, body }: HttpResponse = await makeHttpRequest(
            "GET",
            `/categories/${category.props.id}`,
        );

        expect(statusCode).toBe(StatusCode.Redirect);
        expect(body.payload.products).toBeInstanceOf(Array);
    });

    test("Category was updated.", async () => {
        await login();
        const category = await createCategory();

        const { statusCode, body }: HttpResponse = await makeHttpRequest(
            "PUT",
            `/categories/${category.props.id}`,
            {
                name: "Updated Category",
            },
        );

        expect(statusCode).toBe(StatusCode.OK);
        expect(body.message).toBe("Category updated successfully!");
    });

    test("Category was deleted.", async () => {
        await login();
        const category = await createCategory();

        const { statusCode, body }: HttpResponse = await makeHttpRequest(
            "DELETE",
            `/categories/${category.props.id}`,
        );

        expect(statusCode).toBe(StatusCode.OK);
        expect(body.message).toBe("Category deleted successfully!");
    });

    test("Category list was retrieved.", async () => {
        await login();
        await createCategory();

        const { statusCode, body }: HttpResponse = await makeHttpRequest(
            "GET",
            "/categories",
        );

        expect(statusCode).toBe(StatusCode.OK);
        expect(body.message).toBe("Categories retrieved successfully!");
        expect(body.payload.categories).toBeInstanceOf(Array);
    });
});
