import postgres from "postgres";
import Router from "../router/Router";
import Request from "../router/Request";
import Response, { StatusCode } from "../router/Response";
import Customer, { CustomerProps } from "../models/Custotmer";
import { Session } from "inspector";
import Cookie from "../auth/Cookie";
import { error } from "console";
import Category from "../models/Category";

export default class AuthController {
	private sql: postgres.Sql<any>;

	constructor(sql: postgres.Sql<any>) {
		this.sql = sql;
	}

	registerRoutes(router: Router) {
		router.get("/register", this.getRegistrationForm);
		router.get("/login", this.getLoginForm);
		router.post("/login", this.login);
		router.get("/logout", this.logout);
	}

	/**
	 * TODO: Render the registration form.
	 */
	getRegistrationForm = async (req: Request, res: Response) => {
		let session = req.getSession();
		res.setCookie(new Cookie("session_id", session.id));
		const categories = await Category.readAll(this.sql);
		let categoriesList = categories.map((category) => {
			return {...category.props};
		});
		const errorMessage = req.getSearchParams().get("error") || "";
		const successMessage = req.getSearchParams().get("success") || "";
		if (errorMessage !== "") {
			await res.send({
				statusCode: StatusCode.OK,
				template: "Register",
				message: errorMessage,
				payload: { 
					message: errorMessage,
					categories: categoriesList,
				 },
			});
			return;
		} else {
			await res.send({
				statusCode: StatusCode.OK,
				template: "Register",
				message: successMessage,
				payload: { message: successMessage },
			});
		}
	};

	/**
	 * TODO: Render the login form.
	 */
	getLoginForm = async (req: Request, res: Response) => {
		let session = req.getSession();
		res.setCookie(new Cookie("session_id", session.id));
		let email= req.findCookie("email")?.value || "";		
		const errorMessage = req.getSearchParams().get("error") || "";
		try {
			if (errorMessage !== "") {
				await res.send({
					statusCode: StatusCode.BadRequest,
					message: "Login form",
					template: "LoginFormView",
					payload: { title: "Login", message: errorMessage + "." },
				});
			} else {				
				await res.send({
					statusCode: StatusCode.OK,
					message: "Login form",
					template: "LoginForm",
					payload: { title: "Login", email},
				});
				return;
			}
		} catch {
			await res.send({
				statusCode: StatusCode.InternalServerError,
				message: "Internal server error",
				template: "ErrorView",
				payload: { error: "Internal server error" },
			});
		}
	};

	/**
	 * TODO: Handle login form submission.
	 */
	login = async (req: Request, res: Response) => {
		let session = req.getSession();
		res.setCookie(new Cookie("session_id", session.id));
		const { email, password, remember } = req.body;
		try {
			if (!email) {
				await res.send({
					statusCode: StatusCode.BadRequest,
					message: "Email is required.",
					redirect: "/login?error=Email is required",
				});
				return;
			} else if (!password) {
				await res.send({
					statusCode: StatusCode.BadRequest,
					message: "Password is required.",
					redirect: "/login?error=Password is required",
				});
				return;
			}
			const user = await Customer.login(this.sql, email, password);
			if (user) {
				let session = req.getSession();
				session.set("isLoggedIn", true);
				session.set("userId", user.props.id);				
				const isLoggedIn = true;
				res.setCookie(new Cookie("session_id", session.id));
				if(remember === "on"){
					session.set("email", email);
					res.setCookie(new Cookie("email", session.get("email")));
				}				
				await res.send({
					statusCode: StatusCode.OK,
					redirect: "/product",
					message: "Logged in successfully!",
					payload: { user: user.props, isLoggedIn },
				});
			}
		} catch (error) {
			await res.send({
				statusCode: StatusCode.BadRequest,				
				message: "Invalid credentials.",
				redirect: "/login?error=Invalid credentials",
			});
		}
	};

	/**
	 * TODO: Handle logout.
	 */
	logout = async (req: Request, res: Response) => {
		let session = req.getSession();
		session.destroy();
		try {
			await res.send({
				statusCode: StatusCode.OK,
				redirect: "/",
				message: "Logged out successfully",
			});
		} catch {
			await res.send({
				statusCode: StatusCode.InternalServerError,
				template: "ErrorView",
				message: "Server error",
				payload: { error: "Server error" },
			});
		}
	};
}
