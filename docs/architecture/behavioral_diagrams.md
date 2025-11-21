# Behavioral Diagrams

This document captures the dynamic behavior of the system using UML diagrams.

---

## 1. Swimlane Diagram (Order Fulfillment)
**Scope**: Cross-functional process flow from Customer to Driver.

![Swimlane Diagram](images/swimlane.png)

```mermaid
%%{init: {'theme': 'neutral'}}%%
c4Context
    title Order Fulfillment Process

    Container_Boundary(c1, "Order Fulfillment") {
        Component(customer, "Customer", "Places Order")
        Component(system, "System", "Validates & Assigns")
        Component(kitchen, "Kitchen", "Prepares Food")
        Component(driver, "Driver", "Delivers")
    }
```
*Note: Mermaid doesn't support standard UML Swimlanes perfectly in all viewers, so we use a Sequence diagram with "participants" or a Flowchart with subgraphs to simulate it. Below is a Flowchart version representing Swimlanes.*

```mermaid
flowchart TD
    subgraph Customer
        A[Start: Place Order] --> B[Pay]
    end
    
    subgraph System
        B --> C{Payment Valid?}
        C -- No --> A
        C -- Yes --> D[Notify Kitchen]
        G --> H[Find Driver]
        H --> I[Assign Driver]
    end
    
    subgraph Kitchen
        D --> E[Prepare Food]
        E --> F[Mark Ready]
        F --> G[Notify System]
    end
    
    subgraph Driver
        I --> J[Pick Up Food]
        J --> K[Deliver to Customer]
    end
    
    K --> L[End]
```

---

## 2. Sequence Diagram (Order Placement)
**Scope**: Detailed interaction between objects during order placement.

![Sequence Diagram](images/sequence.png)

```mermaid
sequenceDiagram
    autonumber
    actor C as Customer
    participant FE as Frontend
    participant BE as Backend API
    participant DB as Database
    
    C->>FE: Clicks "Place Order"
    FE->>BE: POST /orders (Token, Items)
    activate BE
    
    BE->>BE: Validate Token
    BE->>DB: Check Menu Availability
    
    alt Item Not Available
        DB-->>BE: Error (Out of Stock)
        BE-->>FE: 400 Bad Request
        FE-->>C: Show Error Message
    else Item Available
        BE->>BE: Calculate Total Price
        BE->>DB: Insert Order (PENDING)
        activate DB
        DB-->>BE: Order ID: 123
        deactivate DB
        
        BE-->>FE: 201 Created (Order Details)
        FE-->>C: Show "Order Successful"
    end
    deactivate BE
```

---

## 3. Activity Diagram (Driver Delivery Flow)
**Scope**: The step-by-step workflow of a driver.

> **Note**: Image generation quota reached. Please refer to the Mermaid diagram below or generate manually.

```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> NewOrder: Notification Received
    
    state NewOrder {
        [*] --> ReviewDetails
        ReviewDetails --> Accept
        ReviewDetails --> Reject
    }
    
    NewOrder --> Idle: Reject
    NewOrder --> ToRestaurant: Accept
    
    state ToRestaurant {
        [*] --> Navigate
        Navigate --> Arrive
        Arrive --> PickUpFood
    }
    
    ToRestaurant --> ToCustomer: Food Picked Up
    
    state ToCustomer {
        [*] --> NavigateToDropoff
        NavigateToDropoff --> ArriveAtDropoff
        ArriveAtDropoff --> VerifyCustomer
        VerifyCustomer --> HandOver
    }
    
    ToCustomer --> Completed: Delivered
    Completed --> Idle
```
