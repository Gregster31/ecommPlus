import postgres from "postgres";
import Request from "../router/Request";
import Response, { StatusCode } from "../router/Response";
import Router from "../router/Router";
import Cart, { CartProps, CartItemProps } from "../models/Cart";

export default class CartController {
  private sql: postgres.Sql<any>;

  constructor(sql: postgres.Sql<any>) {
    this.sql = sql;
  }

  registerRoutes(router: Router) {
    router.get("/cart", this.getCart);
    router.post("/cart/items", this.addItemToCart);
    router.put("/cart/items/:productId", this.updateCartItem);
    router.delete("/cart/items/:productId", this.removeItemFromCart);
    router.delete("/cart", this.clearCart);
  }

  getCart = async (req: Request, res: Response) => {
    const customerId = req.getSession().get("customerId");

    try {
      let cart = await Cart.read(this.sql, customerId);

      if (!cart) {
        cart = await Cart.create(this.sql, { customer_id: customerId });
      }

      await res.send({
        statusCode: StatusCode.OK,
        message: "Cart retrieved successfully",
        template: "CartView",
        payload: { cart: cart.props, items: cart.items },
      });
    } catch (error) {
      console.error("Error while retrieving cart:", error);
      await res.send({
        statusCode: StatusCode.InternalServerError,
        template: "ErrorView",
        message: "Error while retrieving cart",
      });
    }
  };

  addItemToCart = async (req: Request, res: Response) => {
    const customerId = req.getSession().get("customerId");
    const { product_id, quantity, unit_price } = req.body;

    try {
      let cart = await Cart.read(this.sql, customerId);

      if (!cart) {
        cart = await Cart.create(this.sql, { customer_id: customerId });
      }

      await cart.addItem({ shopping_cart_id: cart.props.id, product_id, quantity, unit_price });

      await res.send({
        statusCode: StatusCode.Created,
        message: "Item added to cart successfully",
        payload: { cart: cart.props, items: cart.items },
      });
    } catch (error) {
      console.error("Error while adding item to cart:", error);
      await res.send({
        statusCode: StatusCode.InternalServerError,
        template: "ErrorView",
        message: "Error while adding item to cart",
      });
    }
  };

  updateCartItem = async (req: Request, res: Response) => {
    const customerId = req.getSession().get("customerId");
    const productId = parseInt(req.body.productId, 10);
    const { quantity } = req.body;

    try {
      const cart = await Cart.read(this.sql, customerId);

      if (!cart) {
        await res.send({
          statusCode: StatusCode.NotFound,
          template: "ErrorView",
          message: "Cart not found",
        });
        return;
      }

      const success = await cart.updateItem(productId, quantity);

      if (success) {
        await res.send({
          statusCode: StatusCode.OK,
          message: "Cart item updated successfully",
          payload: { cart: cart.props, items: cart.items },
        });
      } else {
        await res.send({
          statusCode: StatusCode.InternalServerError,
          template: "ErrorView",
          message: "Error while updating cart item",
        });
      }
    } catch (error) {
      console.error("Error while updating cart item:", error);
      await res.send({
        statusCode: StatusCode.InternalServerError,
        template: "ErrorView",
        message: "Error while updating cart item",
      });
    }
  };

  removeItemFromCart = async (req: Request, res: Response) => {
    const customerId = req.getSession().get("customerId");
    const productId = parseInt(req.body.productId, 10);

    try {
      const cart = await Cart.read(this.sql, customerId);

      if (!cart) {
        await res.send({
          statusCode: StatusCode.NotFound,
          template: "ErrorView",
          message: "Cart not found",
        });
        return;
      }

      const success = await cart.removeItem(productId);

      if (success) {
        await res.send({
          statusCode: StatusCode.NoContent,
          message: "Cart item removed successfully",
        });
      } else {
        await res.send({
          statusCode: StatusCode.InternalServerError,
          template: "ErrorView",
          message: "Error while removing cart item",
        });
      }
    } catch (error) {
      console.error("Error while removing cart item:", error);
      await res.send({
        statusCode: StatusCode.InternalServerError,
        template: "ErrorView",
        message: "Error while removing cart item",
      });
    }
  };

  clearCart = async (req: Request, res: Response) => {
    const customerId = req.getSession().get("customerId");

    try {
      const cart = await Cart.read(this.sql, customerId);

      if (!cart) {
        await res.send({
          statusCode: StatusCode.NotFound,
          template: "ErrorView",
          message: "Cart not found",
        });
        return;
      }

      const success = await cart.clearCart();

      if (success) {
        await res.send({
          statusCode: StatusCode.NoContent,
          message: "Cart cleared successfully",
        });
      } else {
        await res.send({
          statusCode: StatusCode.InternalServerError,
          template: "ErrorView",
          message: "Error while clearing cart",
        });
      }
    } catch (error) {
      console.error("Error while clearing cart:", error);
      await res.send({
        statusCode: StatusCode.InternalServerError,
        template: "ErrorView",
        message: "Error while clearing cart",
      });
    }
  };
}
