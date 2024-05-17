import postgres from 'postgres';
import Order, { OrderProps } from '../models/Order';
import Request from '../router/Request';
import Response, { StatusCode } from '../router/Response';
import Router from '../router/Router';
import { createUTCDate } from '../utils';

export default class OrderController {
    private sql: postgres.Sql<any>;

    constructor(sql: postgres.Sql<any>) {
        this.sql = sql;
    }

    registerRoutes(router: Router) {
        router.get("/orders/new", this.getNewOrderForm); //done
        router.post('/orders', this.addOrder); //done
        router.get('/orders', this.getOrderList); //done
        router.get('/orders/:id', this.getOrder); //done
        router.get("/orders/:id/edit", this.getEditOrderForm);  //done      
        router.put('/orders/:id', this.updateOrder); //done
        router.put('/orders/:id/complete', this.completeOrder); //done
        router.delete('/orders/:id', this.deleteOrder); //done
    }

    getNewOrderForm = async (req: Request, res: Response) => {
		// let session = req.getSession();
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
				message: "New Order form",
				template: "NewOrderFormView",
				payload: { title: "New Order"},
			});
		// }
	};

    getEditOrderForm = async (req: Request, res: Response) => {
		// if (!req.session.get("userId")) {
		// 	await res.send({
		// 		statusCode: StatusCode.Unauthorized,
		// 		message: "Unauthorized",
		// 		redirect: "/login",
		// 	});
		// 	return;
		// }
		const id = req.getId();
		let order: Order | null = null;
		// let session = req.getSession();
		// let isLoggedIn = session.get("isLoggedIn");
		// let userId = session.get("userId");
		// let user = await User.read(this.sql, userId);
		// let isAdmin = user?.props.isAdmin;
		try {
			order = await Order.read(this.sql, id);
		} catch (error) {
			const message = `Error while getting order list: ${error}`;
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
			message: "Edit Order form",
			template: "EditOrderFormView",
			payload: {
				order: order?.props,				
			},
		});
	};


    addOrder = async (req: Request, res: Response) => {
        try {
            // const session = req.getSession();
            // const userId = session.get('userId');
            // if (!userId) {
            //     await res.send({
            //         statusCode: StatusCode.Unauthorized,
            //         message: 'Unauthorized',
            //         redirect: '/login',
            //     });
            //     return;
            // }

            const orderProps: OrderProps = {  orderDate: new Date(),
				totalPrice: req.body.total_price,
				customerId: req.body.customer_id,
				addressId: req.body.address_id,
				status: "incomplete",				
            };

            const order = await Order.create(this.sql, orderProps);

            await res.send({
                statusCode: StatusCode.Created,
                message: 'Order created successfully!',
                redirect: `/orders/${order.props.id}`,
                payload: { order: order.props },
            });
        } catch (error) {
            console.error('Error while creating order:', error);
            await res.send({
                statusCode: StatusCode.InternalServerError,
                template: 'ErrorView',
                message: 'Error while creating order',
                payload: { error: 'Error while creating order' },
            });
        }
    };

    getOrder = async (req: Request, res: Response) => {
        try {
            const orderId = req.getId();
            const order = await Order.read(this.sql, orderId);
            if (!order) {
                await res.send({
                    statusCode: StatusCode.NotFound,
                    template: 'ErrorView',
                    message: 'Order not found',
                });
                return;
            }
            await res.send({
                statusCode: StatusCode.OK,
                message: 'Order retrieved successfully!',
                template: 'OrderView',
                payload: { order: order.props },
            });
        } catch (error) {
            console.error('Error while retrieving order:', error);
            await res.send({
                statusCode: StatusCode.InternalServerError,
                template: 'ErrorView',
                message: 'Error while retrieving order',
                payload: { error: 'Error while retrieving order' },
            });
        }
    };

    getOrderList = async (req: Request, res: Response) => {
        try {
            const orders = await Order.readAll(this.sql);
            let orderList = orders.map((order) => {
				return {...order.props};
			});	
            await res.send({
                statusCode: StatusCode.OK,
                message: 'Order list retrieved successfully!',
                template: 'OrderListView',
                payload: { orders: orderList},
            });
        } catch (error) {
            console.error('Error while retrieving order list:', error);
            await res.send({
                statusCode: StatusCode.InternalServerError,
                template: 'ErrorView',
                message: 'Error while retrieving order list',
                payload: { error: 'Error while retrieving order list' },
            });
        }
    };

    updateOrder = async (req: Request, res: Response) => {
        try {
            const orderId = req.getId();
            const orderProps: Partial<OrderProps> = { };
			if (req.body.order_date) {
				orderProps.orderDate = req.body.order_date;
			  } 
			if (req.body.total_price) {
				orderProps.totalPrice = req.body.total_price;
			}
			if (req.body.customer_id) {
				orderProps.customerId = req.body.customer_id;
			}
			if (req.body.address_id) {
				orderProps.addressId = req.body.address_id;
			}
            if (req.body.status) {
				orderProps.status = req.body.status;
			}
            if (req.body.completed_at) {
				orderProps.completedAt = req.body.completed_at;
			}

            const order = await Order.read(this.sql, orderId);
            if (!order) {
                await res.send({
                    statusCode: StatusCode.NotFound,
                    template: 'ErrorView',
                    message: 'Order not found',
                });
                return;
            }

            await order.update(orderProps);

            await res.send({
                statusCode: StatusCode.OK,
                message: 'Order updated successfully!',
                redirect: `/orders/${order.props.id}`,
                payload: { order: order.props },
            });
        } catch (error) {
            console.error('Error while updating order:', error);
            await res.send({
                statusCode: StatusCode.InternalServerError,
                template: 'ErrorView',
                message: 'Error while updating order',
                payload: { error: 'Error while updating order' },
            });
        }
    };

    completeOrder = async (req: Request, res: Response) => {
        try {
            const orderId = req.getId();
            const order = await Order.read(this.sql, orderId);
            if (!order) {
                await res.send({
                    statusCode: StatusCode.NotFound,
                    template: 'ErrorView',
                    message: 'Order not found',
                });
                return;
            }

            await order.markComplete();

            await res.send({
                statusCode: StatusCode.OK,
                message: 'Order marked as complete!',
                redirect: `/orders/${order.props.id}`,
                payload: { order: order.props },
            });
        } catch (error) {
            console.error('Error while marking order as complete:', error);
            await res.send({
                statusCode: StatusCode.InternalServerError,
                template: 'ErrorView',
                message: 'Error while marking order as complete',
                payload: { error: 'Error while marking order as complete' },
            });
        }
    };

    deleteOrder = async (req: Request, res: Response) => {
        try {
            const orderId = req.getId();
            const order = await Order.read(this.sql, orderId);
            if (!order) {
                await res.send({
                    statusCode: StatusCode.NotFound,
                    template: 'ErrorView',
                    message: 'Order not found',
                });
                return;
            }

            await order.delete();

            await res.send({
                statusCode: StatusCode.NoContent,
                message: 'Order deleted successfully!',
                redirect: "/orders"
            });
        } catch (error) {
            console.error('Error while deleting order:', error);
            await res.send({
                statusCode: StatusCode.InternalServerError,
                template: 'ErrorView',
                message: 'Error while deleting order',
                payload: { error: 'Error while deleting order' },
            });
        }
    };
}
