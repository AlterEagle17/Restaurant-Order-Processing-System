import { api } from './api'
import type { MenuCategoryDto, MenuItemDto, PageResponse } from '../types/api'

export async function listMenuCategories() {
  return (await api.get<MenuCategoryDto[]>('/api/menu/categories')).data
}

export async function listMenuItems(params: { categoryId?: string; query?: string; page?: number; size?: number } = {}) {
  return (await api.get<PageResponse<MenuItemDto>>('/api/menu/items', { params })).data
}

export async function getMenuItem(id: string) {
  return (await api.get<MenuItemDto>(`/api/menu/items/${id}`)).data
}

export async function createMenuCategory(payload: { name: string; description?: string }) {
  return (await api.post<MenuCategoryDto>('/api/menu/categories', payload)).data
}

export async function updateMenuCategory(id: string, payload: { name: string; description?: string | null; active: boolean }) {
  return (await api.put<MenuCategoryDto>(`/api/menu/categories/${id}`, payload)).data
}

export async function createMenuItem(payload: { name: string; description?: string | null; categoryId: string; price: number; imageUrl?: string | null }) {
  return (await api.post<MenuItemDto>('/api/menu/items', payload)).data
}

export async function updateMenuItem(id: string, payload: { name: string; description?: string | null; categoryId: string; price: number; imageUrl?: string | null }) {
  return (await api.put<MenuItemDto>(`/api/menu/items/${id}`, payload)).data
}

export async function setMenuItemActive(id: string, active: boolean) {
  return (await api.patch<MenuItemDto>(`/api/menu/items/${id}/status`, { active })).data
}

export async function listAdminMenuCategories() {
  return (await api.get<MenuCategoryDto[]>('/api/admin/menu/categories')).data
}

export async function listAdminMenuItems(params: { categoryId?: string; query?: string; active?: boolean; page?: number; size?: number } = {}) {
  return (await api.get<PageResponse<MenuItemDto>>('/api/admin/menu/items', { params })).data
}