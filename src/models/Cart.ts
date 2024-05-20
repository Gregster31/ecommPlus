import postgres from "postgres";
import { camelToSnake, convertToCase, snakeToCamel } from "../utils";

export interface CartProps {
    id?: number;
    customer_id: number;
    order_id?: number;
    created_at?: Date;
    updated_at?: Date;
}

export interface CartItemProps {
    id?: number;
    shopping_cart_id?: number;
    product_id: number;
    quantity: number;
    unit_price: number;
    added_at?: Date;
    title?: string;
    url?: string;
    description?: string;
    product_price?: number;
}


export default class Cart {
    constructor(
        private sql: postgres.Sql<any>,
        public props: CartProps,
        public items: CartItemProps[] = []
    ) {}

    static async create(sql: postgres.Sql<any>, props: CartProps) {
        const connection = await sql.reserve();

        const [row] = await connection<CartProps[]>`
            INSERT INTO shopping_cart
            ${sql(convertToCase(camelToSnake, props))}
            RETURNING *
        `;

        await connection.release();

        return new Cart(sql, convertToCase(snakeToCamel, row) as CartProps);
    }

    static async readByCustomerId(sql: postgres.Sql<any>, customer_id: number) {
        const connection = await sql.reserve();
    
        const [cartRow] = await connection<CartProps[]>`
            SELECT * FROM shopping_cart WHERE customer_id = ${customer_id}
        `;
    
        if (!cartRow) {
            await connection.release();
            return null;
        }
    
        const itemRows = await connection`
            SELECT sci.*, p.title, p.url, p.description, p.price AS product_price
            FROM shopping_cart_item sci
            JOIN product p ON sci.product_id = p.id
            WHERE sci.shopping_cart_id = ${cartRow.id}
        `;
    
        await connection.release();
    
        return new Cart(
            sql,
            convertToCase(snakeToCamel, cartRow) as CartProps,
            itemRows.map(row => convertToCase(snakeToCamel, row) as CartItemProps)
        );
    }
    

    async addItem(itemProps: CartItemProps) {
        const connection = await this.sql.reserve();

        const [row] = await connection<CartItemProps[]>`
            INSERT INTO shopping_cart_item
            ${this.sql(convertToCase(camelToSnake, itemProps))}
            RETURNING *
        `;

        await connection.release();

        this.items.push(convertToCase(snakeToCamel, row) as CartItemProps);
    }

    async removeItem(product_id: number) {
        const connection = await this.sql.reserve();

        const result = await connection`
            DELETE FROM shopping_cart_item
            WHERE shopping_cart_id = ${this.props.id} AND product_id = ${product_id}
        `;

        await connection.release();

        if (result.count === 1) {
            this.items = this.items.filter(item => item.product_id !== product_id);
            return true;
        }

        return false;
    }

    async updateItem(product_id: number, quantity: number) {
        const connection = await this.sql.reserve();

        const [row] = await connection<CartItemProps[]>`
            UPDATE shopping_cart_item
            SET quantity = ${quantity}
            WHERE shopping_cart_id = ${this.props.id} AND product_id = ${product_id}
            RETURNING *
        `;

        await connection.release();

        if (row) {
            this.items = this.items.map(item => 
                item.product_id === product_id ? { ...item, quantity } : item
            );
            return true;
        }

        return false;
    }

    async clearCart() {
        const connection = await this.sql.reserve();

        const result = await connection`
            DELETE FROM shopping_cart_item WHERE shopping_cart_id = ${this.props.id}
        `;

        await connection.release();

        if (result.count > 0) {
            this.items = [];
            return true;
        }

        return false;
    }

    async delete() {
        const connection = await this.sql.reserve();

        const result = await connection`
            DELETE FROM shopping_cart WHERE id = ${this.props.id}
        `;

        await connection.release();

        return result.count === 1;
    }
}
