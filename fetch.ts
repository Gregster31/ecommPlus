import postgres from "postgres";
import axios from "axios";

const sql = postgres({
  database: "ECommDB", // Change
});

const main = async () => {
  const url = "https://fakestoreapi.com/products/"; // Change
  const response = await axios.get(url);
  
  // console.log(response.data);

  try {
    response.data.forEach(async (product: any) => {
      console.log(product)
      await sql`
      INSERT INTO category ("name")
      VALUES (${product.category})
      `;
      await sql`
      INSERT INTO product ("title", "description", "date", "price", "inventory", "url")
      VALUES (${product.title}, ${product.description}, NOW(), ${product.price}, 0, ${product.image})
      `;

    });


    console.log("Successfully inserted! CTRL+C to exit.");
  } catch (error) {
    console.error(error);
  }
};

main();