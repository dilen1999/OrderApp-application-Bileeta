# 📦 Order Management System – Full Stack Application

Clean Architecture-based Order Management System built with **ASP.NET Core 8**, **SQL Server**, **Redis (Docker)**, and **React (Vite + TypeScript)**.

This solution fulfills all assignment requirements and includes additional enhancements such as Redis caching and frontend deployment.
<img width="1049" height="682" alt="Image" src="https://github.com/user-attachments/assets/614d8710-cbd6-4a5d-9f33-43e77aae4448" />

---

## 🌐 Live Links

### 🔗 Frontend (Vercel)
[(https://order-app-application-bileeta.vercel.app/)](https://order-app-application-bileeta.vercel.app/)

### 🔗 Google Drive (Documentation & Additional Files):
[(https://drive.google.com/drive/folders/1vnFAaINUUwVleU4kayA1k6IP-F4zkmcH?usp=drive_link)](https://drive.google.com/drive/folders/1vnFAaINUUwVleU4kayA1k6IP-F4zkmcH?usp=drive_link)

### 📘 Swagger (API Documentation)
https://localhost:7189/swagger/index.html

---

# ✨ What’s Inside

## 🏗 Backend (Clean Architecture)

- ASP.NET Core 8 Web API
- Clean Architecture (Layered Design)
- Entity Framework Core
- SQL Server
- Redis caching (Docker)
- Swagger (OpenAPI)

## 🖥 Frontend

- React (Vite + TypeScript)
- Tailwind CSS
- ShadCN UI Components
- Hosted on Vercel
- Environment-based API configuration

## ⚡ Performance Enhancements

Redis caching implemented for:

- `GET /api/orders/{id}`
- `GET /api/customers/{code}`
- `GET /api/customers`



---

# 🧱 Tech Stack

### Backend
- ASP.NET Core 8
- Entity Framework Core
- SQL Server
- Redis (Docker)
- Swagger

### Frontend
- React (Vite)
- TypeScript
- TailwindCSS
- Vercel

### DevOps
- Docker (Redis)
- CORS configuration
- Environment variables

---

# 📌 Features

## Orders
- Create Order
- Update Order
- Delete Order
- Load Order by Order ID
- Multiple Order Items
- System-generated Order ID
- Backend-driven financial calculations

## Customers
- Master data table (seeded)
- Retrieve customer by code
- Display customer name
- Redis caching enabled

---


Domain layer does not depend on any external framework.

---

# 🗄 Database Structure

## Customers
- CustomerCode (Primary Key)
- CustomerName

## Orders
- Id (Identity Primary Key)
- CustomerCode (Foreign Key)
- TaxRate
- SubTotal
- DiscountTotal
- GrandTotal

## OrderItems
- Id (Primary Key)
- OrderId (Foreign Key)
- ProductCode
- Quantity
- UnitPrice
- Discount
- LineTotal

---

# 🚀 Quick Start (Backend + Redis)

## ✅ Prerequisites

- .NET 8 SDK
- SQL Server
- Docker Desktop

---

## 1️⃣ Clone Repository

```bash
[git clone https://github.com/your-username/order-management-system.git](https://github.com/dilen1999/OrderApp-application-Bileeta)
cd order-management-system

