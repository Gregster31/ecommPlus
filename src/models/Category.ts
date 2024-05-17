import postgres from 'postgres';
import { camelToSnake, convertToCase, snakeToCamel } from '../utils';
import { ProductProps } from './Products';

export interface CategoryProps {
    id?: number;
    name: string;
}

export default class Category {
    constructor(
        private sql: postgres.Sql<any>,
        public props: CategoryProps,
    ) {}

    static async create(sql: postgres.Sql<any>, props: CategoryProps) {
        const connection = await sql.reserve();

        const [row] = await connection<CategoryProps[]>`
            INSERT INTO category
                ${sql(convertToCase(camelToSnake, props))}
            RETURNING *
        `;

        await connection.release();

        return new Category(sql, convertToCase(snakeToCamel, row) as CategoryProps);
    }

    static async read(sql: postgres.Sql<any>, id: number) {
        const connection = await sql.reserve();

        const [row] = await connection<CategoryProps[]>`
            SELECT * FROM category WHERE id = ${id}`

        await connection.release();

        return new Category(sql, convertToCase(snakeToCamel, row) as CategoryProps);
    }

    static async readAll(sql: postgres.Sql<any>) {
        const connection = await sql.reserve();

        const rows = await connection<CategoryProps[]>`
            SELECT * FROM category
        `;

        await connection.release();

        return rows.map(
            (row) => new Category(sql, convertToCase(snakeToCamel, row) as CategoryProps),
        );
    }

    async update(updateProps: Partial<CategoryProps>) {
        const connection = await this.sql.reserve();

        const [row] = await connection`
            UPDATE category
            SET
                ${this.sql(convertToCase(camelToSnake, updateProps))}
            WHERE
                id = ${this.props.id}
            RETURNING *
        `;

        await connection.release();

        this.props = { ...this.props, ...convertToCase(snakeToCamel, row) };
    }

    async delete() {
        const connection = await this.sql.reserve();

        const result = await connection`
            DELETE FROM category
            WHERE id = ${this.props.id}
        `;

        await connection.release();

        return result.count === 1;
    }
}
