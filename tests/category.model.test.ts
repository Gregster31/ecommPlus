import postgres from "postgres";
import Category, { CategoryProps } from "../src/models/Category";
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
    const createCategory = async (props: Partial<CategoryProps> = {}) => {
        const categoryProps: CategoryProps = {
            name: props.name || "Test Category",
        };

        return await Category.create(sql, categoryProps);
    };

    afterEach(async () => {
        try {
            await sql.unsafe(`DELETE FROM category`);
            await sql.unsafe(`ALTER SEQUENCE category_id_seq RESTART WITH 1;`);
        } catch (error) {
            console.error(error);
        }
    });

    afterAll(async () => {
        await sql.end();
    });

    test("Category was created.", async () => {
        const category = await createCategory();

        expect(category.props.name).toBe("Test Category");
    });

    test("Category was retrieved.", async () => {
        const category = await createCategory();
        const readCategory = await Category.read(sql, category.props.id!);

        expect(readCategory?.props.name).toBe("Test Category");
    });

    test("Category was updated.", async () => {
        const category = await createCategory();
        await category.update({ name: "Updated Test Category" });
        const updatedCategory = await Category.read(sql, category.props.id!);

        expect(updatedCategory?.props.name).toBe("Updated Test Category");
    });

    test("Category was deleted.", async () => {
        const category = await createCategory();
        await category.delete();
        const deletedCategory = await Category.read(sql, category.props.id!);

        expect(deletedCategory).toBeNull();
    });

    test("All categories were retrieved.", async () => {
        const category1 = await createCategory({ name: "Category 1" });
        const category2 = await createCategory({ name: "Category 2" });
        const category3 = await createCategory({ name: "Category 3" });

        const categories = await Category.readAll(sql);

        expect(categories).toBeInstanceOf(Array);
        expect(categories).toContainEqual(category1);
        expect(categories).toContainEqual(category2);
        expect(categories).toContainEqual(category3);
    });
});
