import postgres from "postgres";
import Request from "../router/Request";
import Response, { StatusCode } from "../router/Response";
import Router from "../router/Router";
import Cart, { CartProps, CartItemProps } from "../models/Cart";
import Category from "../models/Category";

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
  }

  getCart = async (req: Request, res: Response) => {
    const categories = await Category.readAll(this.sql);
		let categoriesList = categories.map((category) => {
			return {...category.props};
		});	
    
    const customerId = req.getSession().get("userId");

    try {
      let cart = await Cart.readByCustomerId(this.sql, customerId);
      console.log("----------------")
      console.log(cart)
      console.log("----------------")


      if (!cart) {
        cart = await Cart.create(this.sql, { customer_id: customerId });
      }

      await res.send({
        statusCode: StatusCode.OK,
        message: "Cart retrieved successfully",
        template: "CartView",
        payload: { items: cart.items, categories: categoriesList },
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
    const categories = await Category.readAll(this.sql);
		let categoriesList = categories.map((category) => {
			return {...category.props};
		});	
    
    const customerId = req.getSession().get("userId");
    const { product_id, quantity, unit_price } = req.body;

    console.log(customerId)

    try {
      if (!customerId) {
        return res.send({
          statusCode: StatusCode.BadRequest,
          message: "Customer not authenticated",
          template: "ErrorView"
        });
      }

      let cart = await Cart.readByCustomerId(this.sql, customerId);
      if (!cart) {
          cart = await Cart.create(this.sql, { customer_id: customerId });
      }

      // Check if item is already in the cart, and update num if so
      const existingItem = cart.items.find(item => item.product_id === parseInt(product_id));

      if (existingItem) {
          await cart.updateItem(product_id, existingItem.quantity + parseInt(quantity));
      } else {
          await cart.addItem({ shopping_cart_id: cart.props.id, product_id, quantity, unit_price });
      }

      const updatedCart = await Cart.readByCustomerId(this.sql, customerId);
      
      let total = 120;
      updatedCart?.items.forEach(item => {
          const itemPrice = item.unit_price;
          console.log(item.product_price)
          
          if (!isNaN(itemPrice)) {
              total += itemPrice;
          }
      });
      return res.send({
          statusCode: StatusCode.Created,
          message: "Item added to cart successfully",
          payload: { items: updatedCart?.items, categories: categoriesList, total: total},
          template: "CartView"
      });
    } catch (error) {
        console.error("Error while adding item to cart:", error);
        return res.send({
            statusCode: StatusCode.InternalServerError,
            template: "ErrorView",
            message: "Error while adding item to cart",
        });
    }
};

  updateCartItem = async (req: Request, res: Response) => {
    const customerId = req.getSession().get("userId");
    const productId = parseInt(req.body.productId, 10);
    const { quantity } = req.body;

    try {
      const cart = await Cart.readByCustomerId(this.sql, customerId);

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
    const customerId = req.getSession().get("userId");
    const productId = parseInt(req.body.productId, 10);

    try {
      const cart = await Cart.readByCustomerId(this.sql, customerId);

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
}
