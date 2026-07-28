import api from "./axios.js";

export function getAllMembers(params) {
  return api.get("/members", { params });
}

export function getMemberById(memberId) {
  return api.get(`/members/${memberId}`);
}

export function handleCreateMember(memberData) {
  return api.post("/members", memberData);
}

export function handleDeactivateMember(memberId) {
  return api.delete(`/members/${memberId}`);
}

export function handleReactivateMember(memberId) {
  return api.patch(`/members/${memberId}/reactivate`);
}
