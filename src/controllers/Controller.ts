import postgres from "postgres";
import Request from "../router/Request";
import Response, { StatusCode } from "../router/Response";
import Router from "../router/Router";
import Product, { ProductProps } from '../models/Products';
import { title } from "process";

/**
 * Controller for handling Todo CRUD operations.
 * Routes are registered in the `registerRoutes` method.
 * Each method should be called when a request is made to the corresponding route.
 */
export default class Controller {
	private sql: postgres.Sql<any>;

	constructor(sql: postgres.Sql<any>) {
		this.sql = sql;
	}

	/**
	 * To register a route, call the corresponding method on
	 * the router instance based on the HTTP method of the route.
	 *
	 * @param router Router instance to register routes on.
	 *
	 * @example router.get("/todos", this.getTodoList);
	 */
	registerRoutes(router: Router) {
		router.get("/", this.getHomeView)
		router.get("/productList", this.getProductList);
		router.get("/login", this.getLoginForm);
		router.get("/register", this.getRegistrationForm);
		router.get("/shoppingCart", this.getShoppingCart);
		router.get("/historyPurchase", this.getHistoryPurchase);
		router.get("/product", this.productView);

		// Any routes that include a `:id` parameter should be registered last.
	}

	getHomeView = async (req: Request, res: Response) => {
		let products: Product[] = [];
		products = await Product.readAll(this.sql);
		// Only take the first 4 products (Featured products in HomeView)
		let firstFourProducts = await products.slice(0,4);

		await res.send({
			statusCode: StatusCode.OK,
			message: "productList received",
			template: `HomeView`,
			payload: {
				title: "Home",
				products: firstFourProducts,
			}
    	});
	};

	getProductList = async (req: Request, res: Response) => {
		await res.send({
			statusCode: StatusCode.OK,
			message: "productList received",
			template: `ProductList`,
			payload: {title: "All Products"}
    	});
	};

	getLoginForm = async (req: Request, res: Response) => {
		await res.send({
			statusCode: StatusCode.OK,
			message: "Login form retrieved",
			template: "LoginForm",
			payload: { error: req.getSearchParams().get("error"), title: "Login"},
		});
	};

	getRegistrationForm = async (req: Request, res: Response) => {
		await res.send({
			statusCode: StatusCode.OK,
			message: "Registration form retrieved",
			template: "RegistrationForm",
			// Print out the error from URL
			payload: {error: req.getSearchParams().get("error"), title: "Registration"}
		});
	};

	getHistoryPurchase = async (req: Request, res: Response) => {
		await res.send({
			statusCode: StatusCode.OK,
			message: "History retrieved",
			template: "History",
			payload: { error: req.getSearchParams().get("error"), title: "History"},
		});
	};

	productView = async (req: Request, res: Response) => {
		await res.send({
			statusCode: StatusCode.OK,
			message: "Product retrieved",
			template: "ProductView",
			// Print out the error from URL
			payload: {error: req.getSearchParams().get("error"), title: "Product"}
		});
	};

	getShoppingCart = async (req: Request, res: Response) => {
		await res.send({
			statusCode: StatusCode.OK,
			message: "Shopping Cart retrieved",
			template: "ShoppingCart",
			payload: { error: req.getSearchParams().get("error"), title: "ShoppingCart"},
		});
	};
}
