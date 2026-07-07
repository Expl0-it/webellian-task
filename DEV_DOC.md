# SafeHaven Insurance - Developer Documentation

This document provides a detailed technical overview of the SafeHaven Insurance Admin catalog project. It is written to guide developers, including those who may be new to Spring Boot (Java) or React (JavaScript), through the architecture, design patterns, and code implementations used in this project.

---

## 1. Backend Architecture (Spring Boot & Java)

The backend is built using the **Spring Boot** framework. Spring Boot simplifies Java web development by providing automatic configuration, embedded servers (Tomcat), and starter packages.

### 1.1 The Layered Architecture Pattern
The project uses a standard layered web architecture:
```text
[ Client (React UI) ]
         │ (HTTP REST requests)
         ▼
[ Controller Layer ]   <-- Handles HTTP routing, request validation, CORS
         │
         ▼
[ Service Layer ]      <-- Coordinates business logic and transactional safety
         │
         ▼
[ Repository Layer ]   <-- Translates Java object queries to SQLite SQL queries
         │
         ▼
[ Database (SQLite) ]  <-- Persists tables (insurance_products & covers)
```

1. **Controller Layer (REST Controller)**: Exposes HTTP endpoints. Receives data from the client, validates it, and forwards it to the service layer.
2. **Service Layer**: Implements business rules. This is where transactions are managed. If an operation fails, the transaction is rolled back.
3. **Repository Layer (JPA)**: Abstracts database operations (Insert, Update, Delete, Select) using Spring Data JPA.
4. **Model/Entity Layer**: Represents the database tables as Java objects (POJOs).

---

### 1.2 Key Java & Spring Framework Annotations Explained

#### **Lombok Annotations**
Lombok reduces boilerplate code (like writing getters, setters, and constructors manually):
- `@Data`: Automatically generates getters, setters, `toString()`, `equals()`, and `hashCode()` methods at compile time.
- `@NoArgsConstructor` & `@AllArgsConstructor`: Generates constructors with no parameters and all parameters.
- `@Builder`: Implements the Builder Pattern, allowing clean instantiation (e.g., `InsuranceProduct.builder().name("Plan").build()`).

#### **JPA / Hibernate (Database Mapping)**
- `@Entity`: Tells Hibernate that this class represents a database table.
- `@Table(name = "...")`: Explicitly names the database table.
- `@Id` & `@GeneratedValue(strategy = GenerationType.IDENTITY)`: Marks the field as the primary key and configures it to auto-increment.
- `@OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)`: Defines a 1-to-Many relationship. `cascade = CascadeType.ALL` means actions (like deleting the product) cascade to the covers. `orphanRemoval = true` means if a cover is removed from the product list, it is deleted from the database.
- `@ManyToOne`: Defines the child side of the relationship (many covers belong to one product).
- `@JoinColumn(name = "product_id")`: Configures the foreign key column name in the database.
- `@PrePersist`: A lifecycle hook method that runs automatically right before the record is inserted into the database (e.g. to set creation time).

#### **Spring MVC & REST**
- `@RestController`: Tells Spring that this class defines endpoints that return data directly as JSON (rather than rendering HTML pages).
- `@RequestMapping("/api/products")`: Sets the base URL path for all endpoints in the class.
- `@CrossOrigin(origins = "*")`: Allows web clients running on different ports/domains (such as React on port `5173`) to call the API, avoiding CORS (Cross-Origin Resource Sharing) blockages.
- `@Valid`: Triggers bean validation on incoming request bodies.
- `@RequestBody`: Deserializes the incoming JSON payload into a Java object.
- `@PathVariable`: Extracts values from the URL path (e.g. `{id}`).

---

### 1.3 Database Setup & Schema
We use an SQLite database (`safehaven.db`).
- Configuration is located in [application.properties](./backend/src/main/resources/application.properties).
- `spring.jpa.hibernate.ddl-auto=update` tells Hibernate to automatically generate and adjust database tables based on our entity classes on startup.

#### **Entities:**
1. **`InsuranceProduct`**: Defines `id`, `name`, `type` (Enum), `description`, `basePremium` (BigDecimal), `active` (Boolean), and `creationDatetime` (LocalDateTime).
2. **`Cover`**: Defines `id`, `name`, `coverType` (Enum), `coverageLimit` (BigDecimal), `description`, and a foreign key `product_id`.

---

### 1.4 REST Response Serialization (Avoiding Infinite Loops)
Because `InsuranceProduct` has a list of `Cover`s, and each `Cover` points back to its parent `InsuranceProduct`, a naive JSON serializer would get stuck in a recursive loop (`Product -> Covers -> Product -> Covers...`).
To prevent this, we use Jackson annotations:
- `@JsonManagedReference` on `InsuranceProduct.covers`: Tells the JSON serializer to output the list of covers.
- `@JsonBackReference` on `Cover.product`: Tells the JSON serializer to ignore the parent field when serializing covers, breaking the loop.

---

### 1.5 Exception Handling
A global controller advice [GlobalExceptionHandler.java](file:///home/expl0it/Documents/job_search/webellian-task/backend/src/main/java/com/jobsearch/webelliantask/exception/GlobalExceptionHandler.java) is annotated with `@RestControllerAdvice`.
If an error occurs anywhere:
- Validation fails: Returns `400 Bad Request` with a map of field-specific error messages.
- Resource not found: Returns `404 Not Found`.
- Database error: Returns `500 Internal Server Error`.

---

## 2. Frontend Architecture (React & JavaScript)

The frontend is built using **React 19** and compiled with **Vite**.

### 2.1 React Concepts for Beginners
- **Single Page Application (SPA)**: The browser loads a single HTML file (`index.html`) once. Subsequent UI changes are handled dynamically by React altering the Document Object Model (DOM) without reloading the page.
- **State (`useState`)**: Variables that React tracks. When a state variable changes, React automatically re-renders the components affected by that data.
- **Effects (`useEffect`)**: A hook to run side-effects. In our code, `useEffect` runs once on page load to fetch the catalog from the backend API.
- **JSX**: A syntax extension to JavaScript that looks like HTML. It allows us to write UI layouts directly inside JavaScript code.

---

### 2.2 Material-UI (MUI) Integration
We use **Material-UI** (MUI) for styled components.
- **`ThemeProvider` & `createTheme`**: Standardizes colors, typography, and styles across the entire application (e.g. defining Indigo as primary).
- **`CssBaseline`**: Normalizes default browser margins and styles.
- **MUI Icons**: Vector icons (`Shield`, `Add`, `Edit`, `Delete`, `Visibility`) imported from `@mui/icons-material`.

---

### 2.3 Fetch API & Async Operations
We communicate with the backend using the browser's native `fetch` API.
All requests use `async/await` syntax to run asynchronously, preventing the browser interface from freezing while waiting for a server response.

#### Example Fetch Request (Create Product):
```javascript
const res = await fetch('http://localhost:8080/api/products', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(formData)
});
```

---

## 3. Step-by-Step Flow of an API Request

To help understand how the backend and frontend interact, here is what happens when you create a new product in the browser:

```text
[Browser Form UI] 
   │ 1. User clicks "Save Product". React validates inputs.
   ▼
[Fetch Request]
   │ 2. POST to http://localhost:8080/api/products with JSON body.
   ▼
[Spring Controller]
   │ 3. Intercepts request. Checks @Valid annotations. 
   │    If validation fails, returns 400 JSON error.
   ▼
[Spring Service]
   │ 4. Receives validated entity. Invokes save() inside a Transaction.
   ▼
[SQLite DB]
   │ 5. SQL INSERT statement executed. Row added.
   ▼
[Response API]
   │ 6. Controller returns 201 Created with saved JSON object (including ID).
   ▼
[React UI]
   │ 7. React receives success response, shows toast alert, and re-fetches list.
```

---

## 4. Troubleshooting and Tips for Beginners

### Port Conflicts
- **Problem**: Port `8080` or `5173` is already in use.
- **Fix**: Check running processes in terminal (`lsof -i :8080` or `netstat -ano`) and kill the blocking process, or change ports in `backend/src/main/resources/application.properties` (`server.port=8081`) or `frontend/package.json` (`"dev": "vite --port 3000"`).

### SQLite Locking
- **Problem**: Database file is locked.
- **Fix**: Make sure you don't have multiple database viewers or applications writing to `safehaven.db` simultaneously. Hibernate manages SQLite connections safely when running the Spring Boot app.
