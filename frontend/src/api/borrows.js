import api from "./axios";

export function getMyBorrows(params) {
  return api.get("/borrows/my-borrows", {
    params,
  });
}

export function getAllMembersBorrows(params) {
  return api.get("/borrows/all-borrows", { params });
}

export function requestBook(data) {
  return api.post("/borrows/request", data);
}

export function cancelRequest(borrowId) {
  return api.patch(`/borrows/${borrowId}/cancel`);
}

export function approveRequest(borrowId) {
  return api.patch(`/borrows/${borrowId}/approve`);
}

export function rejectRequest(borrowId) {
  return api.patch(`/borrows/${borrowId}/reject`);
}

export function markReady(borrowId) {
  return api.patch(`/borrows/${borrowId}/ready`);
}

export function markCollected(borrowId) {
  return api.patch(`/borrows/${borrowId}/collected`);
}

export function markReturned(borrowId) {
  return api.patch(`/borrows/${borrowId}/returned`);
}
