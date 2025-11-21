# Data Flow Diagrams (DFD)

This document visualizes how data moves through the Food Delivery System.

> **Note on Levels**:
> - **Level 0**: Context Diagram (The Big Picture).
> - **Level 1**: Main System Processes.
> - **Level 2**: Sub-processes (Detailed Breakdown).
> - **Level 3+**: Specific Logic/Algorithms (Code Level).

---

## Level 0: Context Diagram
**Scope**: Interaction between External Entities and the System.

![Level 0 Context Diagram](images/level0.png)

```mermaid
graph TD
    Customer[Customer] -->|Orders Food| System(Food Delivery System)
    Manager[Manager] -->|Updates Menu| System
    Driver[Driver] -->|Updates Location| System
    System -->|Notifications| Customer
    System -->|Order Details| Driver
    System -->|Sales Reports| Manager
```

---

## Level 1: System Overview
**Scope**: Major Functional Modules.

![Level 1 System Overview](images/level1.png)

```mermaid
graph TD
    %% Entities
    Customer[Customer]
    Manager[Manager]
    Driver[Driver]

    %% Processes
    P1(1.0 Auth Process)
    P2(2.0 Order Process)
    P3(3.0 Menu Process)
    P4(4.0 Delivery Process)

    %% Data Stores
    DB[(Database)]

    %% Flows
    Customer -->|Login Creds| P1
    Manager -->|Login Creds| P1
    Driver -->|Login Creds| P1
    P1 -->|Token| Customer
    P1 -->|Token| Manager
    P1 -->|Token| Driver

    Customer -->|Order Details| P2
    P2 -->|Save Order| DB
    DB -->|Order Status| P2
    P2 -->|Notify| Driver

    Manager -->|Menu Items| P3
    P3 -->|Update Menu| DB

    Driver -->|Accept Order| P4
    P4 -->|Update Status| DB
    P4 -->|Location Update| DB
```

---

## Level 2: Order Processing (Detailed)
**Scope**: Breakdown of Process 2.0 (Order Process).

![Level 2 Order Process](images/level2.png)

```mermaid
graph TD
    Input[Customer Order] --> P2_1(2.1 Validate Order)
    P2_1 -->|Valid| P2_2(2.2 Calculate Total)
    P2_1 -->|Invalid| Error[Return Error]
    
    P2_2 --> P2_3(2.3 Create Order Record)
    P2_3 -->|Insert| DB[(Orders Table)]
    
    P2_3 --> P2_4(2.4 Find Available Drivers)
    DB[(Users Table)] -->|Fetch Drivers| P2_4
    
    P2_4 --> P2_5(2.5 Assign Driver)
    P2_5 -->|Update| DB[(Driver Assignments)]
```

---

## Level 3: Driver Assignment Logic
**Scope**: Specific Algorithm for Process 2.4 & 2.5.

![Level 3 Assignment Logic](images/level3.png)

```mermaid
flowchart TD
    Start(Start Assignment) --> Check1{Is Driver Active?}
    Check1 -- No --> Skip[Skip Driver]
    Check1 -- Yes --> Check2{Has Active Order?}
    
    Check2 -- Yes --> Skip
    Check2 -- No --> Check3{Is within Range?}
    
    Check3 -- No --> Skip
    Check3 -- Yes --> Assign[Assign Order]
    Assign --> Notify[Send Notification]
    Notify --> End(End)
```

---

## Levels 4 & 5: Code Level Logic
At this level, DFDs become pseudocode or actual code.

### Level 4: Function Logic (Python)
**Process**: `calculate_total_price(items)`
1.  Initialize `total = 0`.
2.  Loop through each `item` in `items`.
3.  Fetch `price` from `menu_items` table.
4.  `total += price * quantity`.
5.  Return `total`.

### Level 5: Variable State (Memory)
**Process**: Inside the loop
-   `i=0`: `item_id=5`, `price=10.00`, `total=10.00`
-   `i=1`: `item_id=8`, `price=5.50`, `total=15.50`
