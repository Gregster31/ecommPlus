import Category, { CategoryProps } from "../models/Category";
import postgres from "postgres";
import Request from "../router/Request";
import Response, { StatusCode } from "../router/Response";
import Router from "../router/Router";
import { snakeToCamel } from "../utils";
import Product from "../models/Products";

export default class CategoryController {
    private sql: postgres.Sql<any>;

    constructor(sql: postgres.Sql<any>) {
        this.sql = sql;
    }

    registerRoutes(router: Router) {
        router.get("/categories/new", this.getNewCategoryForm);
        router.post("/categories", this.createCategory);
		router.get("/categories/:id/edit", this.getEditCategoryForm);
        router.get("/categories/:id", this.getProductCategory);
        router.put("/categories/:id", this.updateCategory);
        router.delete("/categories/:id", this.deleteCategory);
        router.get("/categories", this.getCategoryList);
    }

    getNewCategoryForm = async (req: Request, res: Response) => {
		let session = req.getSession();
		// let userId = session.get("userId");
		// let user = await User.read(this.sql, userId);
		// let isAdmin = user?.props.isAdmin;
		// let isLoggedIn = session.get("isLoggedIn");
		// if (!req.session.get("userId")) {
		// 	await res.send({
		// 		statusCode: StatusCode.Unauthorized,
		// 		message: "Unauthorized",
		// 		redirect: "/login",
		// 	});
		// 	return;
		// } else {
			await res.send({
				statusCode: StatusCode.OK,
				message: "New Category form",
				template: "NewCategoryFormView",
				payload: { title: "New Category"},
			});
		// }
	};

    getEditCategoryForm = async (req: Request, res: Response) => {
		// if (!req.session.get("userId")) {
		// 	await res.send({
		// 		statusCode: StatusCode.Unauthorized,
		// 		message: "Unauthorized",
		// 		redirect: "/login",
		// 	});
		// 	return;
		// }
		const id = req.getId();
		let category: Category | null = null;
		// let session = req.getSession();
		// let isLoggedIn = session.get("isLoggedIn");
		// let userId = session.get("userId");
		// let user = await User.read(this.sql, userId);
		// let isAdmin = user?.props.isAdmin;
		try {
			category = await Category.read(this.sql, id);
		} catch (error) {
			const message = `Error while getting category list: ${error}`;
			console.error(message);
			await res.send({
				statusCode: StatusCode.NotFound,
				template: "ErrorView",
				message: "Not found",
				payload: { error: message},
			});
		}						
		await res.send({
			statusCode: StatusCode.OK,
			message: "Edit todo form",
			template: "EditCategoryFormView",
			payload: {
				category: category?.props,				
			},
		});
	};

    createCategory = async (req: Request, res: Response) => {
        const categoryProps: CategoryProps = {
            name: req.body.name
        };

        try {
            const category = await Category.create(this.sql, categoryProps);
            await res.send({
                statusCode: StatusCode.Created,
                message: "Category created successfully!",
                redirect: `/categories`
            });
        } catch (error) {
            console.error("Error while creating category:", error);
            await res.send({
                statusCode: StatusCode.InternalServerError,
                template: "ErrorView",
                message: "Error while creating category"
            });
        }
    };

    getProductCategory = async (req: Request, res: Response) => {
        const categoryId = req.getId();
        console.log("-------------------------")
        console.log(categoryId)
        console.log("-------------------------")

        try {
            const products = await Product.readAllByCategory(this.sql, categoryId);            

            if (!products) {
                await res.send({
                    statusCode: StatusCode.NotFound,
                    message: "Category Products not found",
                });
                return;
            }            
            
            await res.send({
                statusCode: StatusCode.Redirect,
                template: `ProductList`,
				message: "",
                payload: {
                    products: products,
                }
            });
        } catch (error) {
            console.error("Error while fetching category products:", error);
            await res.send({
                statusCode: StatusCode.InternalServerError,
                template: "ErrorView",
                message: "Error while fetching category products"
            });
        }
    };

    updateCategory = async (req: Request, res: Response) => {
        const id = req.getId();
        const categoryProps: Partial<CategoryProps> = {
            name: req.body.name
        };

        try {
            const category = await Category.read(this.sql, id);
            if (!category) {
                await res.send({
                    statusCode: StatusCode.NotFound,
                    message: "Category not found"
                });
                return;
            }

            await category.update(categoryProps);
            await res.send({
                statusCode: StatusCode.OK,
                redirect: `/categories`,
                message: "Category updated successfully!"
            });
        } catch (error) {
            console.error("Error while updating category:", error);
            await res.send({
                statusCode: StatusCode.InternalServerError,
                template: "ErrorView",
                message: "Error while updating category"
            });
        }
    };

    deleteCategory = async (req: Request, res: Response) => {
        const id = req.getId();

        try {
            const category = await Category.read(this.sql, id);
            if (!category) {
                await res.send({
                    statusCode: StatusCode.NotFound,
                    message: "Category not found"
                });
                return;
            }

            await category.delete();
            await res.send({
                statusCode: StatusCode.OK,
                message: "Category deleted successfully!",
                redirect: "/categories"
            });
        } catch (error) {
            console.error("Error while deleting category:", error);
            await res.send({
                statusCode: StatusCode.InternalServerError,
                template: "ErrorView",
                message: "Error while deleting category"
            });
        }
    };

    getCategoryList = async (req: Request, res: Response) => {
        try {
            const categories = await Category.readAll(this.sql);
            let categoriesList = categories.map((category) => {
				return {...category.props};
			});	
            await res.send({
                statusCode: StatusCode.OK,
                message: "Categories retrieved successfully!",
                template: "CategoriesList",
                payload: {categories: categoriesList}
            });
        } catch (error) {
            console.error("Error while fetching category list:", error);
            await res.send({
                statusCode: StatusCode.InternalServerError,
                template: "ErrorView",
                message: "Error while fetching category list"
            });
        }
    };
}
