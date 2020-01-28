# Final Assignment for CSC 3221 Netcentric Computing
Films application with RESTful Backend and Frontend

## Instructions
Check Powerpoint file: CSC3221-888-Final-Assignment on this Repo
Submit through GitHub


## Backend

- `GET		/api/films`
- `GET		/api/films/:id`
- `GET		/api/categories`
- `GET		/api/categories/:id`
- `POST		/api/films`
- `POST		/api/categories`
- `PUT		/api/films`
- `DELETE	/api/films`
- `GET		/api/films-categories`

All resources return JSON.

## Frontend

- `index.html`
- `films.html`
- `show-film.html`
- `insert-film.html`
- `update-film.html`
- `delete-film.html`
- `categories.html`
- `show-category.html`
- `insert-category.html`

Frontend must use Bootstrap

## Requirements
- The program should not crash
- The front end must use bootstrap and be consistent
- Any error should be reported graciously
- The file names MUST be as instructed
- The file MUST reside in the instructed directories
- If the program is not found, or fails to start, the grade will be 0, so make sure that it works to at least get partial credit
- Your code must show good programming practices: meaningful identifier names, correct indentation, appropriate comments

## Two useful SQL Queries

Show all films with their category:
```
SELECT film_id, title, description, release_year, length, rating, name
FROM films
JOIN categories
	ON categories.category_id = films.category_id
```

Find film information for Film ID 100:
```
SELECT * FROM films WHERE film_id=100
```
