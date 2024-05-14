import postgres from "postgres";
import {
	camelToSnake,
	convertToCase,
	createUTCDate,
	snakeToCamel,
} from "../utils";

export interface CustomerProps {
    id?: number;
    email: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    phoneNumber: string;
    password: string;
    userName: string;
    isAdmin: boolean;
}

export class DuplicateEmailError extends Error {
	constructor() {
		super("User with this email already exists.");
	}
}

export class InvalidCredentialsError extends Error {
	constructor() {
		super("Invalid credentials.");
	}
}


export default class Customer {
    constructor(
        private sql: postgres.Sql<any>,
        public props: CustomerProps,
    ) {}

    static async create(sql: postgres.Sql<any>, props: CustomerProps) {
        const connection = await sql.reserve();

        try {
            const [row] = await connection<CustomerProps[]>`
                INSERT INTO customer
                    ${sql(convertToCase(camelToSnake, props))}
                RETURNING *
            `;

            return new Customer(sql, convertToCase(snakeToCamel, row) as CustomerProps);
        } finally {
            await connection.release();
        }
    }

    static async login(sql: postgres.Sql<any>,email: string,password: string,): Promise<Customer> 
	{
		const result = await sql`
            SELECT * FROM customer WHERE email = ${email} AND password = ${password}
        `;
        if (result.length === 0) {
            throw new InvalidCredentialsError();
        }
		return new Customer(sql, convertToCase(snakeToCamel, result[0]) as CustomerProps);
	}

    static async read(sql: postgres.Sql<any>, id: number) {
        const connection = await sql.reserve();

        try {
            const [row] = await connection<CustomerProps[]>`
                SELECT * FROM
                customer WHERE id = ${id}
            `;

            if (!row) {
                return null;
            }

            return new Customer(sql, convertToCase(snakeToCamel, row) as CustomerProps);
        } finally {
            await connection.end();
        }
    }

	static async readAll(
		sql: postgres.Sql<any>,
	): Promise<Customer[]> {
		const connection = await sql.reserve();
		const rows = await connection<Customer[]>`
			SELECT * FROM customer
			`;
		await connection.release();

		return rows.map(
			(row) =>
				new Customer(sql, convertToCase(snakeToCamel, row) as CustomerProps),
		);
	}

    async update(updateProps: Partial<CustomerProps>) {
        const connection = await this.sql.reserve();

        try {
            const [row] = await connection`
                UPDATE customer
                SET
                    ${this.sql(convertToCase(camelToSnake, updateProps))}
                WHERE
                    id = ${this.props.id}
                RETURNING *
            `;

            this.props = { ...this.props, ...convertToCase(snakeToCamel, row) };
        } finally {
            await connection.end();
        }
    }

    async delete() {
        const connection = await this.sql.reserve();

        try {
            await connection`
                DELETE FROM customer
                WHERE id = ${this.props.id}
            `;
        } finally {
            await connection.end();
        }
    }
}