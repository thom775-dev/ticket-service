# Ticket Service

## Setup

-
  ```sh
   git clone https://github.com/thom775-dev/ticket-service.git
   ```
-
   ```sh
   cd ticket-service/
   ```

-
    ```sh
   npm install
   ```

-
   ```sh
   cp .env.example .env
   ```

-   
   **Option 1**
   ```sh
   docker compose up
   npx prisma generate
   npx prisma migrate deploy
   ```
   
   **Option 2**
   ```sh
   npm run db:dev:restart
   ```

-
   ```sh
   npm run start:dev
   ```


