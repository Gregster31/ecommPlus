<p align="center">
  <img width="600" alt="banner" src="https://github.com/JAC-CS-Web-Programming-II-W24/project-ecommplus/assets/123277418/176329a2-4d1e-4abb-9756-a78eec715148">
</p>

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
```mermaid
erDiagram
    PRODUCT {
        int ProductId PK
        string(50) Title
        string(100) Author
        string(100) Description
        date DatePublished
        string(100) Publisher
        decimal Price
        char(13) Isbn
        int Inventory
        int CategoryId FK
    }

    CATEGORY {
        int CategoryId PK
        string(50) CategoryName
    }

    CUSTOMER {
        int CustomerId PK
        string(50) Email
        string(50) FirstName
        string(50) Lastname
        date DateOfBirth
        char(10) PhoneNumber
        string Password
        string(20) UserName
        bool isAdmin
    }
    
    ADDRESS {
        int AddressId PK
        int StreetNumber
        int CivicNumber
        string(50) StreetName
        string(50) City
        char(2) Province
        char(2) Country
        char(6) PostalCode
        int CustomerId FK
    }

    ORDER {
        int OrderId PK
        date OrderDate
        decimal TotalPrice
        int CustomerId FK
        int AddressId FK
    }

    ORDERDETAIL {
        int OrderId PK, FK
        int ProductId PK, FK
        decimal UnitPrice
    }

    PAYMENT {
        int CreditCardNumber PK
        int CustomerId FK
        int OrderId FK
    }

    CUSTOMER ||--}| ADDRESS : has
    PRODUCT }o--|| CATEGORY : "belongs to"
    CUSTOMER ||--}o ORDER : places
    ORDER }o--|| ADDRESS : has
    ORDERDETAIL }o--|| ORDER : has
    ORDERDETAIL }|--|| PRODUCT : has
    ORDER ||--|| PAYMENT : has
    CUSTOMER ||--}| PAYMENT : has
```


# API Routes
### Product Management
| Request | Action | Response | Description |
| ----------- | ----------- | ----------- | ----------- |
| POST /products | ProductController::createProduct | 201 /products/:id  | Create a new product |
| GET /products/:id | ProductController::getProduct | 200 ProductView | Retrieve a product by ID |
| GET /products | ProductController::getProductList | 200 ProductListView | Retrieve all products |
| PUT /products/:id | ProductController::updateProduct | 302 /products/:id | Update a product |
| DELETE /products/:id | ProductController::deleteProduct | 204 (No Content) | Delete a product |
| POST /products/:id/categories/:id | ProductController::addProductCategory | 302 /products/:id  | Adds category to a product |
| PUT /products/:id/categories/:id | ProductController::updateProductCategory | 302 /products/:id  | Updates category of a product |
| DELETE /products/:id/categories/:id | ProductController::deleteProductCategory | 302 /products/:id  | deletes category of a product |
| PUT /products/:id | ProductController::updateProduct | 401 ErrorView | Unauthorized error if not logged in by admin |
| DELETE /products/:id/categories/:id | ProductController::deleteProductCategory | 403 ErrorView  | Forbidden because not admin user |

### Category Management
| Request | Action | Response | Description |
| ----------- | ----------- | ----------- | ----------- |
| POST /categories | CategoryController::createCategory | 201 /categories | Create a new category |
| GET /categories/:id | CategoryController::getProductCategory | 302 /products/category/:id  | Retrieve all products from a specific category |
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
![customer-product-view](https://github.com/JAC-CS-Web-Programming-II-W24/project-ecommplus/assets/123277418/d6754667-356d-4177-b084-6fa5d25d1ad5)
![customer-shopping-cart-view](https://github.com/JAC-CS-Web-Programming-II-W24/project-ecommplus/assets/123277418/fe351424-634c-414e-a058-99cc57f682c3)

