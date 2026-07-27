import api from "./axios.js";

export function getAllBooks(params) {
  return api.get("/books", { params });
}

export function getBookByIsbn(isbn) {
  return api.get(`/books/${isbn}`);
}

export function addNewBook(book) {
  return api.post("/books", book);
}

export function deactivateBook(bookId) {
  return api.patch(`books/${bookId}/deactivate`);
}

export function reactivateBook(bookId, totalCopies) {
  return api.patch(`books/${bookId}/reactivate`, { totalCopies });
}

export function updateBook(bookId, updates) {
  return api.patch(`books/${bookId}/update`, updates);
}
