import postgres from "postgres";
import axios from "axios";

const sql = postgres({
  database: "ECommDB", // Change
});

const main = async () => {
  const url = "https://fakestoreapi.com/products/"; // Change
  const response = await axios.get(url);

  console.log(response.data);

  try {
    // await sql`
    //   INSERT INTO todos ("title", "description")
    //   VALUES (${response.data.name}, ${response.data.name})
    // `;
    await sql`
    INSERT INTO product ("title", "description", "date", "price", "inventory")
    VALUES (${response.data.title}, ${response.data.description}, NOW(), ${response.data.price}, 0)
    `;

    console.log("Successfully inserted! CTRL+C to exit.");
  } catch (error) {
    console.error(error);
  }
};

main();