import postgres from "postgres";
import Request from "../router/Request";
import Response, { StatusCode } from "../router/Response";
import Router from "../router/Router";
import Product, { ProductProps } from "../models/Products";

export default class ProductController {
  private sql: postgres.Sql<any>;

  constructor(sql: postgres.Sql<any>) {
    this.sql = sql;
  }

  registerRoutes(router: Router) {
    router.post("/products", this.createProduct);
    router.get("/products", this.getProductList);
    router.get("/products/new", this.getNewProductForm);
    router.get("/products/:id", this.getProduct);
    router.get("/products/:id/edit", this.getEditProductForm);
    router.put("/products/:id", this.updateProduct);
    router.delete("/products/:id", this.deleteProduct);
    // router.post("/products/:id/categories/:categoryId", this.addProductCategory);
    // router.put("/products/:id/categories/:categoryId", this.updateProductCategory);
    // router.delete("/products/:id/categories/:categoryId", this.deleteProductCategory);
  }

  getNewProductForm = async (req: Request, res: Response) => {
    // const session = req.getSession();
    // const isLoggedIn = session.get("isLoggedIn");

    // if (!isLoggedIn) {
    //   await res.send({
    //     statusCode: StatusCode.Unauthorized,
    //     message: "Unauthorized",
    //     redirect: "/login",
    //   });
    //   return;
    // }

    await res.send({
      statusCode: StatusCode.OK,
      message: "New Product form",
      template: "NewProductFormView",
      payload: { title: "New Product" },
    });
  };

  getEditProductForm = async (req: Request, res: Response) => {
    // const session = req.getSession();
    // const isLoggedIn = session.get("isLoggedIn");
    const id = req.getId();

    // if (!isLoggedIn) {
    //   await res.send({
    //     statusCode: StatusCode.Unauthorized,
    //     message: "Unauthorized",
    //     redirect: "/login",
    //   });
    //   return;
    // }

    try {
      const product = await Product.read(this.sql, id);

      if (!product) {
        await res.send({
          statusCode: StatusCode.NotFound,
          template: "ErrorView",
          message: "Product not found",
        });
        return;
      }

      await res.send({
        statusCode: StatusCode.OK,
        message: "Edit Product form",
        template: "EditProductFormView",
        payload: { product: product.props },
      });
    } catch (error) {
      console.error("Error while getting product:", error);
      await res.send({
        statusCode: StatusCode.InternalServerError,
        template: "ErrorView",
        message: "Error while getting product",
        payload: { error: "Error while getting product" },
      });
    }
  };

  createProduct = async (req: Request, res: Response) => {
    const productProps: ProductProps = {
      title: req.body.title,
      description: req.body.description,
      url: req.body.url,
      price: req.body.price,
      inventory: req.body.inventory,
      category_id: req.body.category_id,
    };
    try {
      const product = await Product.create(this.sql, productProps);

      await res.send({
        statusCode: StatusCode.Created,
        message: "Product created successfully",
        redirect: `/products/${product.props.id}`,
        payload: { product: product.props },
      });
    } catch (error) {
      console.error("Error while creating product:", error);
      await res.send({
        statusCode: StatusCode.InternalServerError,
        template: "ErrorView",
        message: "Error while creating product",
      });
    }
  };

  getProduct = async (req: Request, res: Response) => {
    const productId = req.getId();

    try {
      const product = await Product.read(this.sql, productId);

      if (!product) {
        await res.send({
          statusCode: StatusCode.NotFound,
          template: "ErrorView",
          message: "Product not found",
        });
        return;
      }

      await res.send({
        statusCode: StatusCode.OK,
        message: "Product retrieved successfully",
        template: "ProductView",
        payload: { product: product.props },
      });
    } catch (error) {
      console.error("Error while retrieving product:", error);
      await res.send({
        statusCode: StatusCode.InternalServerError,
        template: "ErrorView",
        message: "Error while retrieving product",
      });
    }
  };

  getProductList = async (req: Request, res: Response) => {
    try {
      const products = await Product.readAll(this.sql);
      await res.send({
        statusCode: StatusCode.OK,
        message: "Products retrieved successfully",
        template: "ProductList",
        payload: { products: products },
      });
    } catch (error) {
      console.error("Error while retrieving products:", error);
      await res.send({
        statusCode: StatusCode.InternalServerError,
        template: "ErrorView",
        message: "Error while retrieving products",
      });
    }
  };

  updateProduct = async (req: Request, res: Response) => {
    const id = req.getId();
    const productProps: Partial<ProductProps> = {};

    if (req.body.title) {
      productProps.title = req.body.title;
    }

    if (req.body.description) {
      productProps.description = req.body.description;
    }

    if (req.body.url) {
      productProps.url = req.body.url;
    }

    if (req.body.price) {
      productProps.price = req.body.price;
    }

    if (req.body.inventory) {
      productProps.inventory = req.body.inventory;
    }

    if (req.body.category_id) {
      productProps.category_id = req.body.category_id;
    }

    try {
      const product = await Product.read(this.sql, id);

      if (!product) {
        await res.send({
          statusCode: StatusCode.NotFound,
          template: "ErrorView",
          message: "Product not found",
        });
        return;
      }

      await product.update(productProps);
      await res.send({
        statusCode: StatusCode.OK,
        message: "Product updated successfully",
        redirect: `/products/${product.props.id}`,
        payload: { product: product.props },
      });
    } catch (error) {
      console.error("Error while updating product:", error);
      await res.send({
        statusCode: StatusCode.InternalServerError,
        template: "ErrorView",
        message: "Error while updating product",
      });
    }
  };

  deleteProduct = async (req: Request, res: Response) => {
    const id = req.getId();

    try {
      const product = await Product.read(this.sql, id);

      if (!product) {
        await res.send({
          statusCode: StatusCode.NotFound,
          template: "ErrorView",
          message: "Product not found",
        });
        return;
      }

      const success = await product.delete();

      if (success) {
        await res.send({
          statusCode: StatusCode.NoContent,
          redirect: "/products",
          message: "Product deleted successfully",
        });
      } else {
        await res.send({
          statusCode: StatusCode.InternalServerError,
          template: "ErrorView",
          message: "Error while deleting product",
        });
      }
    } catch (error) {
      console.error("Error while deleting product:", error);
      await res.send({
        statusCode: StatusCode.InternalServerError,
        template: "ErrorView",
        message: "Error while deleting product",
      });
    }
  };
}
