# Employee Management App

This project is a web application that allows users to log in, and perform operations on employees and companies. Users can log in using Google Sign-In, and only logged-in users can add, edit, and delete employees and companies.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Installation](#installation)
3. [Usage](#usage)
4. [Google Sign-In Integration](#google-sign-in-integration)
5. [Project Structure](#project-structure)

## Getting Started

This project is developed with Angular and uses IndexedDB to store data. Additionally, Google Sign-In is implemented for user authentication. The app allows the relationship between employees and companies.

### Requirements

- Node.js (v16 or higher)
- Angular CLI (v18)
- Google Developer Console account (for Google Sign-In integration)
- Web browser (for testing Google Sign-In)

## Installation

To run the project locally, follow these steps:

1. Clone the repository:

    ```bash
    git clone https://github.com/orsoyku/CompanyBoard.git
    cd CompanyBoard
    ```

2. Install the required dependencies:

    ```bash
    npm install
    ```

3. Start the Angular development server:

    ```bash
    ng serve
    ```

    You can view the application by going to `http://localhost:4200` in your browser.

## Usage

- You can log in using **Google Sign-In** to access the application.
- After logging in, you can visit the "Company" and "Employee" pages to add, edit, or delete data.
- If the user is not logged in, only the login page will be accessible.

## Google Sign-In Integration

Google Sign-In is implemented in this project for user authentication. To make this work correctly, follow these steps:

### 1. Google API Console Settings

To use Google Sign-In, you need to create a project in the [Google Developer Console](https://console.developers.google.com/).

- Navigate to **APIs & Services > Credentials**.
- Create **OAuth 2.0 Client IDs** and configure the necessary settings.
  - Add your app's URL in the **Authorized JavaScript Origins** (e.g., `http://localhost:4200`).
  - Add the necessary **Authorized Redirect URIs** for Google Sign-In.

### 2. Enabling Third-Party Sign-In

For Google Sign-In to work, the "Third-party sign-in" feature must be enabled in the Google API Console. To enable this:

- Go to the OAuth 2.0 client ID page in the Google Developer Console.
- Navigate to **APIs & Services > OAuth consent screen**.
- Choose **"External"** or **"Internal"** and fill in the necessary fields.
- Enable the **"Third-party sign-in"** option and approve the necessary permissions.

### 3. Application Configuration

For Google Sign-In to work in your app, follow these steps:

1. Configure `login.component.ts` correctly.
2. Include the `social-login` module and related dependencies in your app.

## Project Structure

- `src/app/`: Main application directory
  - `app-routing.module.ts`: Application routes (including the 404 page)
  - `login/`: Component for Google Sign-In operations
  - `home-page/`: Main page component
  - `employee/`: Component for employee-related operations
  - `company/`: Component for company-related operations
  - `models/`: Data models used in the project (e.g., `IEmployee`, `ICompany`)
  - `services/`: Services for database operations and API calls

