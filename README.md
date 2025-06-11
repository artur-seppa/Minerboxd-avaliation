# Challenge

https://gist.github.com/henriqueinonhe/2f0abffbf34826c266f87390e6c6fd0e

# Backend Evaluation 2025-01 - Minerboxd - Recognition

## Guidelines

During the Recognition Phase of the technical evaluation, you are expected to focus exclusively on setting up the project environment and understanding the project. Please adhere to the following guidelines:

**Avoid Refactoring During This Phase:**
Refactoring during the recognition phase is discouraged, especially if it risks breaking any existing functionality in the provided codebase.

**Focus on Relevance:**
Modifying or refactoring parts of the code that will not be directly used in the challenge on the execution day will not yield additional review points. Excessive changes to the original code may also complicate the review process.

**Approach Recognition as an Onboarding Process:**
Treat this phase as if you were onboarding at a client project. In real-world scenarios, significant refactoring during onboarding is not standard practice and can hinder understanding of the existing codebase.

## Given Scenario

**Minerboxd** is a movie-centered social media app, just like [Letterboxd](https://letterboxd.com/).

Currently, the app has the following features already implemented:

- Authentication (`POST /login`)
- Listing Movies (`GET /movies`)
- Showing Movie Details (`GET /movies/:id`)
- Displaying Logged User Watchedlist (`GET /watchedlist`)
- Displaying Logged User Watchlist (`GET /watchlist`)
- Adding Movie to Watchedlist (`PATCH /watchedlist/:movieId`)
- Adding Movie to Watchlist (`PATCH /watchlist/:movieId`)
- Removing Movie from WatchedList (`DELETE /watchedlist/:movieId`)
- Removing Movie from Watchlist (`DELETE /watchlist/:movieId`)

## Critics to the original code

In addition to a Merge Request for each task, it's expected from you to write a document criticizing the original code provided, where you can mention things that you would change or refactor if it was a real client project. Use the setup and code exploration phase to pay attention to informations that you would add to this document.

The document should be provided in a file called critics.md in the Merge Request.

## Development

The project uses [tsx](https://tsx.is/) to run TypeScript. All the necessary npm scripts are in package.json, but feel free to add any other if needed. To interact with Knex, use `npm run knex` instead of using `npx knex` because of the usage of the tsx library.

### Setup

To setup the project, first run the Docker container:

```sh
docker compose up
```

Then, create the development database, migrate it and seed it

```sh
npm run dev:db:create && npm run dev:db:migrate && npm run dev:db:seed
```

Then run the web app

```sh
npm run dev
```

### Testing

First, setup the test database:

```sh
npm run test:db:create && npm run test:db:migrate
```

Then run the tests:

```sh
npm test
```

If you have any trouble running the app or the tests, try to run the command again. If the problem persists, inform your evaluator.
