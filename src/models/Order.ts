import postgres from "postgres";
import {
    camelToSnake,
    convertToCase,
    createUTCDate,
    snakeToCamel,
} from "../utils";

export interface OrderProps {
    id?: number;
    orderDate: Date;
    totalPrice: number;
    status: "incomplete" | "complete";
    completedAt?: Date;
    customerId: number;
    addressId: number;
}

export default class Order {
    constructor(
        private sql: postgres.Sql<any>,
        public props: OrderProps,
    ) {}

    static async create(sql: postgres.Sql<any>, props: OrderProps) {
        const connection = await sql.reserve();

        const [row] = await connection<OrderProps[]>`
            INSERT INTO orders
            ${sql(convertToCase(camelToSnake, props))}
            RETURNING *
        `;

        await connection.release();

        return new Order(sql, convertToCase(snakeToCamel, row) as OrderProps);
    }

    static async read(sql: postgres.Sql<any>, id: number) {
        const connection = await sql.reserve();

        const [row] = await connection<OrderProps[]>`
            SELECT * FROM orders WHERE id = ${id}
        `;

        await connection.release();

        if (!row) {
            return null;
        }

        return new Order(sql, convertToCase(snakeToCamel, row) as OrderProps);
    }

    static async readAll(sql: postgres.Sql<any>) {
        const connection = await sql.reserve();

        const rows = await connection<OrderProps[]>`
            SELECT * FROM orders
        `;

        await connection.release();

        return rows.map(row => new Order(sql, convertToCase(snakeToCamel, row) as OrderProps));
    }

    async update(updateProps: Partial<OrderProps>) {
        const connection = await this.sql.reserve();

        const [row] = await connection`
            UPDATE orders
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
            DELETE FROM orders WHERE id = ${this.props.id}
        `;

        await connection.release();

        return result.count === 1;
    }

    async markComplete() {
		await this.update({
			status: "complete",
            completedAt: createUTCDate(),
		});
	}
}