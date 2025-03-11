# Thali Book

[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/Fu_pncF5)

Thali Book is an OpenTable-like restaurant reservation application. Customers can search for restaurants by date, time, party size, and location, then book a table online. Restaurant managers can list their restaurants, manage availability, and update details, while admins can approve or remove listings and view analytics.

---

## Table of Contents

1. [Features](#features)  
2. [Tech Stack](#tech-stack)  
3. [Project Structure](#project-structure)  
4. [Getting Started](#getting-started)  
5. [Running the Application](#running-the-application)  
6. [Environment Variables](#environment-variables)  
7. [API Endpoints (High-Level)](#api-endpoints-high-level)  
8. [Wireframes & Diagrams](#wireframes--diagrams)  
9. [Contributing](#contributing)  
10. [License](#license)  

---

## Features

### Customer
- Search Restaurants by date, time, party size, and optional location.
- View Details (cuisine, cost rating, location, reviews).
- Book a Table and receive confirmation via email/SMS.
- Cancel Bookings and view history.
- Register & Login securely.

### Restaurant Manager
- Create & Update Listings (name, address, contact, hours).
- Manage Table Availability (time slots, table size).
- (Optional) View reservations made.

### Admin
- Approve new restaurant listings.
- Remove listings that violate policies.
- View reservation analytics dashboard.

---

## Tech Stack

- **Backend**: Java Spring Boot  
- **Frontend**: React.js  
- **Database**: PostgreSQL  
- **Build Tools**: Maven or Gradle  
- **Deployment**: AWS EC2 + RDS + Load Balancer  
- **Optional**: Docker, GitHub Actions (CI/CD)

---

## Project Structure

```
thali-book/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/thalibook/
│   │   │   │   ├── controller/
│   │   │   │   ├── model/
│   │   │   │   ├── repository/
│   │   │   │   ├── service/
│   │   │   │   └── ThaliBookApplication.java
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       └── static/
│   │   └── test/java/com/thalibook/
│   └── pom.xml
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
├── docker/
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── docker-compose.yml
│
├── docs/
│   ├── wireframes/
│   └── diagrams/
│
├── .gitignore
├── README.md
```

---

## Getting Started

### Clone the repo

```bash
git clone https://github.com/your-team/thali-book.git
cd thali-book
```

### Install Prerequisites

- Java 17+  
- Maven
- Node.js (v16+)  
- PostgreSQL 13+  

### Setup PostgreSQL Database

- Create a database named `thalibook_db`
- Configure credentials in `application.properties`

---

## Running the Application

### 1. Start the Backend

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

or with Gradle:

```bash
./gradlew bootRun
```

### 2. Start the Frontend

```bash
cd frontend
npm install
npm start
```

App will be running at:  
Frontend → `http://localhost:3000`  
Backend → `http://localhost:8080`

---

## Environment Variables

### Backend (`application.properties`)

```properties
server.port=8080
spring.datasource.url=jdbc:postgresql://localhost:5432/thalibook_db
spring.datasource.username=postgres
spring.datasource.password=yourpassword
spring.jpa.hibernate.ddl-auto=update
```

### Frontend (`.env`)

```env
REACT_APP_API_URL=http://localhost:8080
```

Use via `process.env.REACT_APP_API_URL` in frontend code.

---

## API Endpoints (High-Level)

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

### Customer
- `GET /api/restaurants/search`
- `GET /api/restaurants/{id}`
- `POST /api/bookings`
- `DELETE /api/bookings/{id}`

### Restaurant Manager
- `POST /api/restaurants`
- `PUT /api/restaurants/{id}`
- `PUT /api/restaurants/{id}/availability`

### Admin
- `PUT /api/admin/restaurants/{id}/approve`
- `DELETE /api/admin/restaurants/{id}`
- `GET /api/admin/analytics?from=...&to=...`

---

## Wireframes & Diagrams

- UI Wireframes: `docs/wireframes/`  
- Architecture & Deployment Diagrams: `docs/diagrams/`  
- [AgileModeling.com UML Reference](http://agilemodeling.com/artifacts/deploymentDiagram.htm)

---

## Contributing

1. Fork the repo and create your branch:  
   `git checkout -b feature/YourFeature`
2. Commit your changes:  
   `git commit -m 'Add some feature'`
3. Push to the branch:  
   `git push origin feature/YourFeature`
4. Submit a pull request 🚀

---

## License

This project is for educational purposes only. Add a license if needed.

---

## Team Info

**Team Name**: Thali Devs  
**Team Members**:
- Member 1 – Backend / Auth
- Member 2 – Frontend / UI
- Member 3 – Restaurant Manager Module
- Member 4 – Admin Panel & Analytics

**📒 Project Journal**: [GitHub Wiki Link]  
**📊 Scrum Board & Backlog**: [Google Sheet / Trello Board Link]

---

Thanks for using **Thali Book**! 🍽️  
Happy dining 😄
