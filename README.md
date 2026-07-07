# SafeHaven Insurance - Catalog Admin Panel

SafeHaven Insurance is an internal admin panel designed for the product management team to manage the company's insurance products catalog and associated coverages. This repository is split into two separate projects: a Java/Spring Boot backend and a React/Material-UI frontend.

---

## Repository Structure

```text
webellian-task/
├── backend/                  # Java 21 + Spring Boot 4.1.0 Backend
│   ├── src/                  # Source files (main application and tests)
│   ├── pom.xml               # Maven configuration
│   └── mvnw                  # Maven wrapper script
├── frontend/                 # React 19 + Material-UI + Vite Frontend
│   ├── src/                  # Source React components and styles
│   ├── package.json          # Node dependencies and scripts
│   └── vite.config.js        # Vite build configuration
└── README.md                 # This file
```

---

## 1. Backend (Java + Spring Boot)

The backend is built with **Spring Boot 4.1.0** and **Java 21**, using a local relational **SQLite** database (`safehaven.db` in the backend root) or an in memory database solution. It features full CRUD operations for `InsuranceProduct` and its associated `Cover`s.

> [!IMPORTANT]
> The `Technical Requirements` specified the need to use a relational in-memory
> database but in `backend/src/main/resources/application.properties` there is
> also a commented configuration for persistent db using SQLite .db file.

### Features

- **Relational Persistence**: Uses SQLite with Hibernate and Spring Data JPA.
- **Cascading Deletions**: Deleting an insurance product automatically deletes all nested covers (one-to-many cascading).
- **Validation**: Full validation rules applied to entities (e.g., base premium and cover limits must be > 0; names cannot be blank).
- **Global Error Handling**: Custom REST exception mapping returning structured RFC-7807/JSON errors.
- **CORS Support**: Configured to allow incoming calls from the frontend server.
- **Database Seeder**: Detects if the database is empty on startup and seeds 4 realistic insurance products with detailed covers.

### How to Run the Backend

1. Navigate to the `backend` directory:

   ```bash
   cd backend
   ```

2. Build and run the Spring Boot application using Maven:

   ```bash
   ./mvnw spring-boot:run
   ```

   *The server will start on port `8080`. SQLite database file `safehaven.db` will be updated/created automatically.*

### How to Run Tests

To run unit and integration tests (JUnit 5 + Mockito + MockMvc):

```bash
./mvnw test
```

---

## 2. Frontend (React + Material-UI)

The frontend is a modern Single Page Application (SPA) built with **React**, **Material-UI (MUI)**, and **Vite**.

### Features

- **Clean Admin Layout**: Utilizes MUI components (`Card`, `Table`, `Dialog`, `Switch`, `IconButton`, etc.) with a professional Indigo-Teal design system.
- **Stats Dashboard**: Dynamic top metrics cards showing:
  - Total Catalog Products
  - Active Policies Count
  - Inactive Policies Count
- **Catalog list**: Displays all insurance products with their type, premium, and covers count. Includes inline switch buttons to quickly activate/deactivate a product.
- **Detailed Product Page**: Clicking on a product shows its full description, price details, and a dedicated covers management table where admins can **Add**, **Edit**, or **Remove** specific covers.
- **CRUD Operations**: Interactive forms for creating/editing products and a modal dialog for cover parameters.
- **Validation feedback**: Form fields highlight red and display helper text for validation issues (e.g., negative premiums or empty names).
- **Visual indicators**: User feedback via loaders and snackbar notifications for all success/error actions.

### How to Run the Frontend

1. Navigate to the `frontend` directory:

   ```bash
   cd frontend
   ```

2. Install npm packages:

   ```bash
   npm install
   ```

3. Run the development server:

   ```bash
   npm run dev
   ```

   *The client will start on port `5173` (or the next available port) and print a local URL (e.g. `http://localhost:5173/`). Open it in your browser.*

---

## REST API Endpoints Cheat Sheet

| HTTP Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/api/products` | Retrieve all products in the catalog |
| **GET** | `/api/products/{id}` | Retrieve a specific product's details and covers |
| **POST** | `/api/products` | Create a new insurance product |
| **PUT** | `/api/products/{id}` | Update product details |
| **DELETE** | `/api/products/{id}` | Delete a product (cascades to covers) |
| **GET** | `/api/products/{id}/covers` | Retrieve all covers for a specific product |
| **POST** | `/api/products/{id}/covers` | Add a cover to a product |
| **PUT** | `/api/products/{id}/covers/{coverId}` | Update an existing cover |
| **DELETE** | `/api/products/{id}/covers/{coverId}` | Remove a cover |
