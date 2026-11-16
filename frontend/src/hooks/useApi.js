import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';

// ==================== ADMIN QUERIES ====================

export function useAdminAnalytics(enabled = true) {
  return useQuery({
    queryKey: ['admin', 'analytics'],
    queryFn: () => api.get('/admin/analytics'),
    enabled,
    staleTime: 10000,
  });
}

export function useAdminUsers(filter = 'all', search = '') {
  return useQuery({
    queryKey: ['admin', 'users', filter, search],
    queryFn: () => api.get(`/admin/users?filter=${filter}${search ? `&search=${search}` : ''}`),
    staleTime: 5000,
  });
}

export function useAdminAuditLogs() {
  return useQuery({
    queryKey: ['admin', 'auditLogs'],
    queryFn: () => api.get('/admin/audit-logs'),
    staleTime: 10000,
  });
}

// ==================== ADMIN MUTATIONS ====================

export function useVerifyUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId) => api.post(`/admin/users/${userId}/verify`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      qc.invalidateQueries({ queryKey: ['admin', 'analytics'] });
    },
  });
}

export function useBlockUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId) => api.post(`/admin/users/${userId}/block`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      qc.invalidateQueries({ queryKey: ['admin', 'analytics'] });
    },
  });
}

export function useUnblockUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId) => api.post(`/admin/users/${userId}/unblock`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      qc.invalidateQueries({ queryKey: ['admin', 'analytics'] });
    },
  });
}

export function useToggleUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId) => api.post(`/admin/users/${userId}/toggle-status`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

export function useAdjustBalance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, amount, reason }) =>
      api.post(`/admin/users/${userId}/adjust-balance`, { amount, reason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      qc.invalidateQueries({ queryKey: ['admin', 'analytics'] });
    },
  });
}

// ==================== GAME QUERIES ====================

export function useGameLobby() {
  return useQuery({
    queryKey: ['games', 'lobby'],
    queryFn: () => api.get('/games/lobby'),
    refetchInterval: 10000,
  });
}

export function useGameDetails(gameId) {
  return useQuery({
    queryKey: ['games', gameId],
    queryFn: () => api.get(`/games/${gameId}`),
    enabled: !!gameId,
  });
}

export function useMyBoard(gameId, isAuthenticated) {
  return useQuery({
    queryKey: ['boards', 'my', gameId],
    queryFn: () => api.get(`/boards/my/${gameId}`),
    enabled: !!gameId && isAuthenticated,
  });
}

export function useMyAllocationsHistory() {
  return useQuery({
    queryKey: ['boards', 'my-history'],
    queryFn: () => api.get('/boards/my-history'),
  });
}

export function useBoardSummary() {
  return useQuery({
    queryKey: ['boards', 'summary'],
    queryFn: () => api.get('/boards/summary'),
    staleTime: 30000,
  });
}

// ==================== GAME MUTATIONS ====================

export function useCreateGame() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/games/create', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['games'] });
      qc.invalidateQueries({ queryKey: ['admin', 'analytics'] });
    },
  });
}

export function useUpdateGame() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ gameId, data }) => api.put(`/games/${gameId}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['games'] });
      qc.invalidateQueries({ queryKey: ['admin', 'analytics'] });
    },
  });
}

export function useStartGame() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (gameId) => api.post(`/games/${gameId}/start`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['games'] });
      qc.invalidateQueries({ queryKey: ['admin', 'analytics'] });
    },
  });
}

export function usePauseGame() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (gameId) => api.post(`/games/${gameId}/pause`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['games'] }),
  });
}

export function useEndGame() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (gameId) => api.post(`/games/${gameId}/end`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['games'] });
      qc.invalidateQueries({ queryKey: ['admin', 'analytics'] });
    },
  });
}

export function useSpinBall() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (gameId) => api.post(`/games/${gameId}/spin`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['games'] }),
  });
}

export function useGenerateBoards() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (forceReset) => api.post('/boards/generate', { forceReset }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['boards'] });
      qc.invalidateQueries({ queryKey: ['admin', 'analytics'] });
    },
  });
}

// ==================== PAYMENT QUERIES ====================

export function useAdminPayments(status = 'pending') {
  return useQuery({
    queryKey: ['admin', 'payments', status],
    queryFn: () => api.get(`/payments/admin/all?status=${status}`),
    staleTime: 5000,
  });
}

export function useMyPayments() {
  return useQuery({
    queryKey: ['payments', 'my'],
    queryFn: () => api.get('/payments/my'),
  });
}

// ==================== PAYMENT MUTATIONS ====================

export function useVerifyPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ paymentId, action, adminNotes }) =>
      api.post(`/payments/admin/verify/${paymentId}`, { action, adminNotes }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'payments'] });
      qc.invalidateQueries({ queryKey: ['admin', 'analytics'] });
    },
  });
}
