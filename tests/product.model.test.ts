import postgres from "postgres";
import Product, { ProductProps } from "../src/models/Products";
import Category, { CategoryProps } from "../src/models/Category";
import { test, describe, expect, afterEach, afterAll } from "vitest";
import { createUTCDate } from "../src/utils";

describe("Product CRUD operations", () => {
    const sql = postgres({
        database: "ECommDB",
    });

	const createCategory = async (props: Partial<CategoryProps> = {}) => {
        const categoryProps: CategoryProps = {
            name: props.name || "Test Category",
        };

        return await Category.create(sql, categoryProps);
    };

    /**
     * Helper function to create a Product with default or provided properties.
     * @param props The properties of the Product.
     * @default title: "Test Product"
     * @default description: "This is a test product"
     * @default url: "http://example.com/test-product.jpg"
     * @default date: The current date/time
     * @default price: 100.00
     * @default inventory: 10
     * @default category_id: 1
     * @returns A new Product object that has been persisted in the DB.
     */
    const createProduct = async (props: Partial<ProductProps> = {}) => {
		    const productProps: ProductProps = {
            title: props.title || "Test Product",
            description: props.description || "This is a test product",
            url: props.url || "http://example.com/test-product.jpg",
            price: props.price || 100.00,
            inventory: props.inventory || 10,
            category_id: props.category_id || 1,
        };

        return await Product.create(sql, productProps);
    };

    afterEach(async () => {
        const tables = ["product"];

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
    });

    afterAll(async () => {
        await sql.end();
    });

    test("Product was created.", async () => {
        const product = await createProduct({ title: "Test Product 2" });

        expect(product.props.title).toBe("Test Product 2");
        expect(product.props.description).toBe("This is a test product");
        expect(product.props.price).toBe("100");
        expect(product.props.inventory).toBe(10);
    });

    test("Product was retrieved.", async () => {
        const product = await createProduct();

        const readProduct = await Product.read(sql, product.props.id!);

        expect(readProduct?.props.title).toBe("Test Product");
        expect(readProduct?.props.description).toBe("This is a test product");
        expect(readProduct?.props.price).toBe("100");
        expect(readProduct?.props.inventory).toBe(10);
    });

    test("Products were listed.", async () => {
        const product1 = await createProduct();
        const product2 = await createProduct();
        const product3 = await createProduct();

        const products = await Product.readAll(sql);

        expect(products).toBeInstanceOf(Array);
        expect(products).toContainEqual(product1);
        expect(products).toContainEqual(product2);
        expect(products).toContainEqual(product3);
    });

    test("Products were listed by category.", async () => {
        const product1 = await createProduct({ category_id: 1 });
        const product2 = await createProduct({ category_id: 2 });
        const product3 = await createProduct({ category_id: 1 });

        const productsByCategory1 = await Product.readAllByCategory(sql, 1);

        expect(productsByCategory1).toBeInstanceOf(Array);
        expect(productsByCategory1).toContainEqual(product1);
        expect(productsByCategory1).toContainEqual(product3);
        expect(productsByCategory1).not.toContainEqual(product2);
    });

    test("Product was updated.", async () => {
        const product = await createProduct();

        await product.update({ title: "Updated Test Product" });

        const updatedProduct = await Product.read(sql, product.props.id!);

        expect(updatedProduct).not.toBeNull();
        expect(updatedProduct?.props.title).toBe("Updated Test Product");
    });

    test("Product was deleted.", async () => {
        const product = await createProduct();

        await product.delete();

        const deletedProduct = await Product.read(sql, product.props.id!);

        expect(deletedProduct).toBeNull();
    });
});
