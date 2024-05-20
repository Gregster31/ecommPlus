import postgres from "postgres";
import axios from "axios";

const sql = postgres({
  database: "ECommDB", // Change
});

const main = async () => {
  const url = "https://fakestoreapi.com/products/"; // Change
  const response = await axios.get(url);
  
  try {
    for (const product of response.data) {
      // Insert category if not exists
      console.log(product)
      await sql`
        INSERT INTO category ("name")
        VALUES (${product.category})
        ON CONFLICT (name) DO NOTHING;
      `;

      // Fetch category id
      let categoryIdQuery = await sql`
        SELECT id FROM category WHERE name = ${product.category};
      `;

      if (categoryIdQuery.length > 0 && categoryIdQuery[0].id !== undefined && !isNaN(categoryIdQuery[0].id)) {
        let categoryId = categoryIdQuery[0].id;

        // Insert product with category_id
        await sql`
          INSERT INTO product ("title", "description", "price", "inventory", "url", "category_id")
          VALUES (${product.title}, ${product.description}, ${product.price}, 0, ${product.image}, ${categoryId});
        `;
        console.log(`Product "${product.title}" inserted successfully.`);
      } else {
        console.error(`Invalid category ID for product: ${product.title}`);
      }
    }
    console.log("Successfully inserted! CTRL+C to exit.");
  } catch (error) {
    console.error(error);
  }
};

main();
