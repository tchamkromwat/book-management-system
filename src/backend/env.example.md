# Environment Variables Configuration

Create a `.env` file in the backend directory with the following variables:

```env
# Application
NODE_ENV=development
BACKEND_PORT=3001
FRONTEND_URL=http://localhost:3000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=admin
DB_PASSWORD=password
DB_NAME=book_management

# JWT Configuration
JWT_SECRET=your-jwt-secret-key-change-this-in-production
JWT_EXPIRES_IN=1d

# CORS
CORS_ORIGIN=http://localhost:3000
```

## Important Notes:
1. Change the `JWT_SECRET` to a secure random string in production
2. Update database credentials as needed
3. Adjust CORS settings for production deployment 