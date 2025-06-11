# Critics

## Build Process

Consider implementing a Docker-based development environment to:
- Ensure consistent development environments across all machines
- Prevent dependency version conflicts

## DataBase

### Movies Table

The `title` should be a unique element to prevent duplicate movies in the system, which would compromise application consistency.

### Watchlist table

The relation table should contain a unique constraint combining user ID and movie ID to prevent duplicate movies in a user's watchlist.

### watchedlist table

Has a similar issue as the Watchlist table.

### User table

Uses a surrogate key as ID, but email could have been used as the primary key since it's already a unique element.

### increments id

Tables use incremental surrogate keys by default, but could implement UUIDs to remove security risks.

## Routes

### Validation type

Input validation for routes could be implemented using Zod, for example, to prevent inconsistent value inputs.

### UseCases

Could implement use cases as a design pattern to remove the dependency of use case functionality from the associated route, thus giving each component a well-defined responsibility in the system.

### Repository

Following the same idea as useCase, creating a repository layer could remove query duplications and allocate the sole responsibility of database communication to this layer.

### Serializer

In routes that serialize multiple objects, the list serialization responsibility could be removed from the route and allocated to the responsible serializer to enable reuse in the system. This would also place this responsibility in its proper serialization context.

## Tests

I noticed that only integration tests are used because the route has many responsibilities and high dependencies. The responsibilities of each component could be separated and tested accordingly. Additionally, to facilitate future test creation, factories could be implemented to create objects beforehand.


