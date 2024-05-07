DROP DATABASE IF EXISTS "MyDB";
CREATE DATABASE "MyDB";

\c MyDB;

DROP TYPE IF EXISTS order_status;
CREATE TYPE order_status AS ENUM ('incomplete', 'complete');

DROP TABLE IF EXISTS "customer";
CREATE TABLE "customer" (
    "id" SERIAL PRIMARY KEY,
    "email" VARCHAR(50) NOT NULL UNIQUE,
    "first_name" VARCHAR(50) NOT NULL,
    "last_name" VARCHAR(50) NOT NULL,
    "date_of_birth" TIMESTAMP NOT NULL,
    "phone_number" CHAR(10) NOT NULL,
    "password" Text NOT NULL,
    "user_name" VARCHAR(20) NOT NULL,
    "is_admin" BOOLEAN DEFAULT FALSE
);

DROP TABLE IF EXISTS "order";
CREATE TABLE "order" (
    "id" SERIAL PRIMARY KEY,
    "order_date" TIMESTAMP NOT NULL,
    "total_price" DECIMAL NOT NULL,
    status order_status NOT NULL DEFAULT 'incomplete',
    completed_at TIMESTAMP,
    "customer_id" INTEGER REFERENCES customer(id) ON DELETE CASCADE,
    "address_id" INTEGER REFERENCES address(id) ON DELETE CASCADE
);

DROP TABLE IF EXISTS "address";
CREATE TABLE "address" (
    "id" SERIAL PRIMARY KEY,
    "street_number" INTEGER NOT NULL UNIQUE,
    "civic_number" INTEGER,
    "street_name" VARCHAR(50) NOT NULL,
    "city" VARCHAR(50) NOT NULL,
    "province" CHAR(2) NOT NULL,
    "country" CHAR(2) NOT NULL,
    "postal_code" CHAR(6) NOT NULL,
    "customer_id" INTEGER REFERENCES customer(id) ON DELETE CASCADE
);

DROP TABLE IF EXISTS "order_detail";
CREATE TABLE "order_detail" (
    "order_id" INTEGER REFERENCES "order"(id) ON DELETE CASCADE,
    "product_id" INTEGER REFERENCES "product"(id) ON DELETE CASCADE,
    "unit_price" DECIMAL NOT NULL,
    PRIMARY KEY ("order_id", "product_id")
);

DROP TABLE IF EXISTS "product";
CREATE TABLE "product" (
    "id" SERIAL PRIMARY KEY,
    "title" VARCHAR(50) NOT NULL,
    "description" VARCHAR(100) NOT NULL,
    "date" TIMESTAMP NOT NULL,
    "price" DECIMAL NOT NULL,
    "inventory" INTEGER NOT NULL,
    "category_id" INTEGER REFERENCES "category"(id) ON DELETE CASCADE
);

DROP TABLE IF EXISTS "category";
CREATE TABLE "category" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(50) NOT NULL
);

DROP TABLE IF EXISTS "payment";
CREATE TABLE "payment" (
    "credit_card_number" SERIAL PRIMARY KEY,
    "customer_id" INTEGER REFERENCES "customer"(id) ON DELETE CASCADE,
    "order_id" INTEGER REFERENCES "order"(id) ON DELETE CASCADE
);
