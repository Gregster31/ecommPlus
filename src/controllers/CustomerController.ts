import postgres from "postgres";
import Request from "../router/Request";
import Response, { StatusCode } from "../router/Response";
import Router from "../router/Router";
import Customer, { CustomerProps } from "../models/Custotmer";

export default class CustomerController {
  private sql: postgres.Sql<any>;

  constructor(sql: postgres.Sql<any>) {
    this.sql = sql;
  }

  registerRoutes(router: Router) {
    router.post("/customers", this.addCustomer);
    router.get("/customers/:id", this.getCustomer);
    router.get("/customers", this.getAllCustomers);
    router.put("/customers/:id", this.updateCustomer);
    router.delete("/customers/:id", this.deleteCustomer);
  }

  addCustomer = async (req: Request, res: Response) => {
    const {
      email,
      firstName,
      lastName,
      dateOfBirth,
      phoneNumber,
      password,
      userName,
      isAdmin,
    } = req.body;    
    try {
      const customer = await Customer.create(this.sql, {
        email,
        firstName,
        lastName,
        dateOfBirth,
        phoneNumber,
        password,
        userName,
        isAdmin,
      });
      await res.send({
        statusCode: StatusCode.Created,
        message: "Customer created successfully",
        redirect: "/login",
        payload: { customer: customer.props },
      });
    } catch (error) {
      console.error("Error while creating customer:", error);
      await res.send({
        statusCode: StatusCode.InternalServerError,
        template: "ErrorView",
        message: "Error while creating customer",
      });
    }
  };

  getCustomer = async (req: Request, res: Response) => {
    const customerId = req.getId();
    try {
      const customer = await Customer.read(this.sql, customerId);
      if (!customer) {
        await res.send({
          statusCode: StatusCode.NotFound,
          template: "ErrorView",
          message: "Customer not found",
        });
        return;
      }

      await res.send({
        statusCode: StatusCode.OK,
        message: "Customer retrieved successfully",
        payload: { customer: customer.props },
      });
    } catch (error) {
      console.error("Error while retrieving customer:", error);
      await res.send({
        statusCode: StatusCode.InternalServerError,
        template: "ErrorView",
        message: "Error while retrieving customer",
      });
    }
  };

  getAllCustomers = async (req: Request, res: Response) => {
    let customer: Customer[] = [];
    try {
      customer = await Customer.readAll(this.sql);
    } catch (error) {
      console.error("Error while retrieving customers:", error);
      await res.send({
        statusCode: StatusCode.InternalServerError,
        template: "ErrorView",
        message: "Error while retrieving customers",
      });
    }
  };

  updateCustomer = async (req: Request, res: Response) => {
    const id = req.getId();
    if (isNaN(id)) {
      await res.send({
        statusCode: StatusCode.BadRequest,
        template: "ErrorView",
        message: "Invalid ID",
        payload: { error: "Invalid ID" },
      });
      return;
    }
    const customerProps: Partial<CustomerProps> = {};
    if (req.body.email) {
      customerProps.email = req.body.email;
    }

    if (req.body.firstName) {
      customerProps.firstName = req.body.firstName;
    }

    if (req.body.lastName) {
      customerProps.lastName = req.body.lastName;
    }

    if (req.body.dateOfBirth) {
      customerProps.dateOfBirth = req.body.dateOfBirth;
    }

    if (req.body.phoneNumber) {
      customerProps.phoneNumber = req.body.phoneNumber;
    }

    if (req.body.password) {
      customerProps.password = req.body.password;
    }

    if (req.body.userName) {
      customerProps.userName = req.body.userName;
    }

    try {
      const customer = await Customer.read(this.sql, id);
      if (customer) {
        await customer.update(customerProps);
        await res.send({
          statusCode: StatusCode.OK,
          message: "Todo updated successfully!",
          template: "ShowView",
          payload: { customer: customer.props},
        });
      } else {
        await res.send({
          statusCode: StatusCode.NotFound,
          template: "ErrorView",
          message: "Not found",
          payload: { error: "Not found"},
        });
      }
    } catch (error) {
      console.error("Error while updating customer:", error);
      await res.send({
        statusCode: StatusCode.InternalServerError,
        template: "ErrorView",
        message: "Error while updating customer",
        payload: { error: "Error while updating customer" },
      });
    }
  };

  deleteCustomer = async (req: Request, res: Response) => {
	const id = req.getId();
	if (isNaN(id)) {
		await res.send({
			statusCode: StatusCode.BadRequest,
			template: "ErrorView",
			message: "Invalid ID",
			payload: { error: "Invalid ID"},
		});
		return;
	}
	try {
		const customer = await Customer.read(this.sql, id);
		if (await customer?.delete()) {
			const redirectUrl = `/customers`;
			await res.send({
				statusCode: StatusCode.OK,
				message: "Customer deleted successfully!",
				redirect: redirectUrl,
				payload: { customer: customer?.props},
			});
		} else {
			await res.send({
				statusCode: StatusCode.InternalServerError,
				template: "ErrorView",
				message: "Error while deleting todo.",
				payload: { error: "Error while deleting customer."},
			});
		}
	}
	catch (error) {
		console.error("Error while deleting customer:", error);
		await res.send({
		  statusCode: StatusCode.InternalServerError,
		  template: "ErrorView",
		  message: "Error while deleting customer",
		  payload: { error: "Error while deleting customer" },
		});
	  }
  };
}
