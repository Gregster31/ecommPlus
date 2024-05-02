import postgres from "postgres";
import { camelToSnake, convertToCase, snakeToCamel } from "../utils";

export interface AddressProps {
    id?: number;
    streetNumber: number;
    civicNumber?: number;
    streetName: string;
    city: string;
    province: string;
    country: string;
    postalCode: string;
    customerId: number;
}

export default class Address {
    constructor(
        private sql: postgres.Sql<any>,
        public props: AddressProps,
    ) {}

    static async create(sql: postgres.Sql<any>, props: AddressProps) {
        const connection = await sql.reserve();

        const [row] = await connection<AddressProps[]>`
            INSERT INTO address
                ${sql(convertToCase(camelToSnake, props))}
            RETURNING *
        `;

        await connection.release();

        return new Address(sql, convertToCase(snakeToCamel, row) as AddressProps);
    }

    static async read(sql: postgres.Sql<any>, id: number) {
        const connection = await sql.reserve();

        const [row] = await connection<AddressProps[]>`
            SELECT * FROM address WHERE id = ${id}
        `;

        await connection.release();

        if (!row) {
            return null;
        }

        return new Address(sql, convertToCase(snakeToCamel, row) as AddressProps);
    }

    static async readAll(sql: postgres.Sql<any>, customerId: number): Promise<Address[]> {
        const connection = await sql.reserve();

        const rows = await connection<AddressProps[]>`
            SELECT * FROM address WHERE customer_id = ${customerId}
        `;

        await connection.release();

        return rows.map((row) => new Address(sql, convertToCase(snakeToCamel, row) as AddressProps));
    }

    async update(updateProps: Partial<AddressProps>) {
        const connection = await this.sql.reserve();

        const [row] = await connection`
            UPDATE address
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
            DELETE FROM address
            WHERE id = ${this.props.id}
        `;

        await connection.release();

        return result.count === 1;
    }
}
