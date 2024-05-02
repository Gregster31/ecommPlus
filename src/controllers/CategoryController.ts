import Category, { CategoryProps } from "../models/Category";
import postgres from "postgres";
import Request from "../router/Request";
import Response, { StatusCode } from "../router/Response";
import Router from "../router/Router";
import { snakeToCamel } from "../utils";

export default class CategoryController {
    private sql: postgres.Sql<any>;

    constructor(sql: postgres.Sql<any>) {
        this.sql = sql;
    }

    registerRoutes(router: Router) {
        router.post("/categories", this.createCategory);
        router.get("/categories/:id", this.getProductCategory);
        router.put("/categories/:id", this.updateCategory);
        router.delete("/categories/:id", this.deleteCategory);
        router.get("/categories", this.getCategoryList);
    }

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
            const products = await this.getProductByCategoryID(id);
            
            await res.send({
                statusCode: StatusCode.Redirect,
                redirect: `/products/category/${category.props.id}`,
				message: " ",
                payload: products
            });
        } catch (error) {
            console.error("Error while fetching category:", error);
            await res.send({
                statusCode: StatusCode.InternalServerError,
                template: "ErrorView",
                message: "Error while fetching category"
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
                redirect: `/categories/${category.props.id}`,
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
                message: "Category deleted successfully!"
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
                payload: categoriesList
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

    //TODO but in another controller//
    private getProductByCategoryID = async (categoryID: number) => {        
    };
}
