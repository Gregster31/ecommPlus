# Proposal 
Introducing "ECommPlus" - A Comprehensive E-commerce Platform

ECommercePlus is a robust and user-friendly e-commerce platform designed to provide a seamless online shopping experience for customers. The platform allows customers to browse and purchase products from various categories, manage their orders, and track their shipments. For administrators, ECommercePlus provides a comprehensive dashboard to manage products, customers, orders, and payments.

# Core Functionality
- **Product Management:** Administrators can create, edit, and delete products, including product details, pricing, and inventory management.
- **Category Management:** Administrators can create, edit, and delete product categories, and assign products to categories.
- **Customer Management:** Customers can create accounts, log in, and manage their profile information, including addresses and payment methods.
- **Order Management:** Customers can place orders, view order history, and track shipments. Administrators can manage orders, including order fulfillment and payment processing.
- **Payment Gateway Integration:** ECommercePlus integrates with various payment gateways to facilitate secure and convenient payment processing.

# Requirements
### Product Stories
- As an administrator, I want to create a new product so that I can add it to the catalog.
- As an administrator, I want to edit a product's details so that I can update its information.
- As an administrator, I want to delete a product so that I can remove it from the catalog.
- As a customer, I want to view product details so that I can make an informed purchasing decision.

### Category Stories
- As an administrator, I want to create a new category so that I can organize products.
- As an administrator, I want to edit a category's name so that I can update its information.
- As an administrator, I want to delete a category so that I can remove it from the catalog.

### Customer Stories
- As a customer, I want to create an account so that I can save my information for future purchases.
- As a customer, I want to log in to my account so that I can access my order history and profile information.
- As a customer, I want to update my profile information so that I can keep my account up-to-date.

### Order Stories
- As a customer, I want to place an order so that I can purchase products.
- As a customer, I want to view my order history so that I can track my purchases.
- As an administrator, I want to manage orders so that I can fulfill and process payments.

### Payment Stories
- As a customer, I want to select a payment method so that I can complete my purchase.
- As an administrator, I want to manage payment methods so that I can configure payment gateway integrations.

# Entity Relationships
![database](https://github.com/JAC-CS-Web-Programming-II-W24/project-ecommplus/assets/123277418/ebd2e96f-435c-4910-a2e2-95418383738e)


# API Routes
### Product Management
| Request | Action | Response | Description |
| ----------- | ----------- | ----------- | ----------- |
| POST /products | ProductController::createProduct | 201 /products/:id  | Create a new product |
| GET /products/:id | ProductController::getProduct | 200 ProductView | Retrieve a product by ID |
| GET /products | ProductController::getProductList | 200 ProductListView | Retrieve all products |
| PUT /products/:id | ProductController::updateProduct | 302 /products/:id | Update a product |
| DELETE /products/:id | ProductController::deleteProduct | 204 (No Content) | Delete a product |
| POST /products/:id/:id | ProductController::addProductCategory | 302 /products/:id  | Adds category to a product |
| PUT /products/:id/:id | ProductController::updateProductCategory | 302 /products/:id  | Updates category of a product |
| DELETE /products/:id/:id | ProductController::deleteProductCategory | 302 /products/:id  | deletes category of a product |
| PUT /products/:id | ProductController::updateProduct | 401 ErrorView | Unauthorized error if not logged in by admin |
| DELETE /products/:id/:id | ProductController::deleteProductCategory | 403 ErrorView  | Forbidden because not admin user |

### Category Management
| Request | Action | Response | Description |
| ----------- | ----------- | ----------- | ----------- |
| POST /categories | CategoryController::createCategory | 201 /categories | Create a new category |
| GET /categories/:id | CategoryController::getProductCategory | 302 /products/category/:id  | Retrieve a category by ID |
| PUT /categories/:id | CategoryController::updateCategory | 302 /categories | Update a category |
| DELETE /categories/:id | CategoryController::deleteCategory | 302 /categories | Delete a category |
| GET /categories | CategoryController::getCategoryList | 200 CategoryListView  | Retrieve list of category |
| PUT /categories/:id | CategoryController::updateCategory |  401 ErrorView | Unauthorized error if not logged in by admin  |
| DELETE /categories/:id | CategoryController::deleteCategory | 404 ErrorView | Category not found |

### Customer Management
| Request | Action | Response | Description |
| ----------- | ----------- | ----------- | ----------- |
| POST /customers | CustomerController::addCustomer | 201 /customers/:id | Create a new customer account |
| GET /customers/:id | CustomerController::getCustomer | 200 CustomerView | Retrieve a customer by ID |
| GET /customers | CustomerController::getAllCustomer | 200 CustomerListView | Retrieve a list of customers |
| PUT /customers/:id | CustomerController::updateCustomer | 302 /customers/:id | Update a customer's profile information |
| DELETE /customers/:id | CustomerController::deleteCustomer | 204 (No Content) | Delete a customer account |
| POST /customers | CustomerController::addCustomer | 400 ErrorView | Customer already exists |
| DELETE /customers/:id | CustomerController::deleteCustomer | 403 ErrorView | Admin user require to delete a customer |

### Order Management
| Request | Action | Response | Description |
| ----------- | ----------- | ----------- | ----------- |
| POST /orders | OrderController::addOrder | 201 /orders/:id | Create a new order |
| GET /orders/:id | OrderController::getOrder | 200 GetOrderView | Retrieve an order by ID |
| GET /orders | OrderController::getOrderList | 200 GetOrderListView | Retrieve order list |
| PUT /orders/:id | OrderController::updateOrder | 302 /orders/:id | Update an order |
| PUT /orders/:id/complete | OrderController::completeOrder | 302 /orders/:id | Mark an order as complete |
| DELETE /orders/:id | OrderController::deleteOrder | 204 (No Content) | Delete an order |
| GET /orders/:id | OrderController::getOrder | 404 ErrorView | Order not found |
| PUT /orders/:id | OrderController::updateOrder | 401 ErrorView | Cannot update an order while logged out or no user logged in |
# Wire Frames
![wireframe1](https://github.com/JAC-CS-Web-Programming-II-W24/project-ecommplus/assets/123277418/792856e4-e25a-4df8-8f48-0802eebc57c4)
![wireframe2](https://github.com/JAC-CS-Web-Programming-II-W24/project-ecommplus/assets/123277418/7c0c0de5-2ae9-4340-88c3-486935ddf91c)
![wireframe3](https://github.com/JAC-CS-Web-Programming-II-W24/project-ecommplus/assets/123277418/506b527f-283a-416b-8e1a-7dd264d18435)
