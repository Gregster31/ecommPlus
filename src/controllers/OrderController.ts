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
        router.post('/orders', this.addOrder);
        router.get('/orders/:id', this.getOrder);
        router.get('/orders', this.getOrderList);
        router.put('/orders/:id', this.updateOrder);
        router.put('/orders/:id/complete', this.completeOrder);
        router.delete('/orders/:id', this.deleteOrder);
    }

    addOrder = async (req: Request, res: Response) => {
        try {
            const session = req.getSession();
            const userId = session.get('userId');
            if (!userId) {
                await res.send({
                    statusCode: StatusCode.Unauthorized,
                    message: 'Unauthorized',
                    redirect: '/login',
                });
                return;
            }

            const orderProps: OrderProps = {  orderDate: req.body.orderDate,
				totalPrice: req.body.totalPrice,
				customerId: req.body.customerId,
				addressId: req.body.addressId,
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
                template: 'GetOrderView',
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

            await res.send({
                statusCode: StatusCode.OK,
                message: 'Order list retrieved successfully!',
                template: 'GetOrderListView',
                payload: { orders: orders.map(order => order.props) },
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
			if (req.body.orderDate) {
				orderProps.orderDate = req.body.orderDate;
			  } 
			if (req.body.totalPrice) {
				orderProps.totalPrice = req.body.totalPrice;
			}
			if (req.body.customerId) {
				orderProps.customerId = req.body.customerId;
			}
			if (req.body.addressId) {
				orderProps.addressId = req.body.addressId;
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
