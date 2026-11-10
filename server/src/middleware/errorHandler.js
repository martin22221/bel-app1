import { HttpError } from '../utils/httpError.js';

// Непознат маршрут
export function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Маршрутът не съществува' });
}

// Всички грешки минават оттук и се връщат като { error: "..." }.
// Express 5 праща тук и грешките от async функции, без try/catch.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Невалиден JSON' });
  }
  console.error(err);
  res.status(500).json({ error: 'Вътрешна грешка на сървъра' });
}
