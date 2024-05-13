import postgres from "postgres";
import {
    camelToSnake,
    convertToCase,
    createUTCDate,
    snakeToCamel,
} from "../utils";

export interface ProductProps {
    id?: number;
    title: string;
    description: string;
    url: string;
    date?: Date;
    price: number;
    inventory: number;
    category_id: number;
}

export default class Product {
    constructor(
        private sql: postgres.Sql<any>,
        public props: ProductProps,
    ) {}

    static async create(sql: postgres.Sql<any>, props: ProductProps) {
        const connection = await sql.reserve();

        const [row] = await connection<ProductProps[]>`
            INSERT INTO product
            ${sql(convertToCase(camelToSnake, props))}
            RETURNING *
        `;

        await connection.release();

        return new Product(sql, convertToCase(snakeToCamel, row) as ProductProps);
    }

    static async read(sql: postgres.Sql<any>, id: number) {
        const connection = await sql.reserve();

        const [row] = await connection<ProductProps[]>`
            SELECT * FROM product WHERE id = ${id}
        `;

        await connection.release();

        if (!row) {
            return null;
        }

        return new Product(sql, convertToCase(snakeToCamel, row) as ProductProps);
    }

    static async readAll(sql: postgres.Sql<any>) {
        let connection = await sql.reserve();
        
        const rows = await connection<ProductProps[]>`
            SELECT * FROM product
        `;

        await connection.release();

        return rows.map(row => new Product(sql, convertToCase(snakeToCamel, row) as ProductProps));
    }

    async update(updateProps: Partial<ProductProps>) {
        const connection = await this.sql.reserve();

        const [row] = await connection`
            UPDATE product
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
            DELETE FROM product WHERE id = ${this.props.id}
        `;

        await connection.release();

        return result.count === 1;
    }
}