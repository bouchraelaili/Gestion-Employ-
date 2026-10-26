import api from './api'
import type { Employee } from '../types'

export const employeeService = {
  getAll: async (): Promise<Employee[]> => {
    const res = await api.get('/employees')
    return res.data
  },

  getById: async (id: number): Promise<Employee> => {
    const res = await api.get(`/employees/${id}`)
    return res.data
  },

  create: async (data: Partial<Employee>): Promise<Employee> => {
    const res = await api.post('/employees', data)
    return res.data
  },

  update: async (id: number, data: Partial<Employee>): Promise<Employee> => {
    const res = await api.put(`/employees/${id}`, data)
    return res.data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/employees/${id}`)
  },

  predict: async (data: {
    age: number
    anciennete: number
    salaire: number
    absences: number
    score_performance: number
    category_id: number
  }): Promise<{ risque_depart: boolean; probabilite?: number }> => {
    const res = await api.post('/predict', data)
    return res.data
  },

  exportExcel: async (): Promise<void> => {
    const res = await api.get('/export/excel', { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([res.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'employes.xlsx')
    document.body.appendChild(link)
    link.click()
    link.remove()
  },

  exportPDF: async (): Promise<void> => {
    const res = await api.get('/export/pdf', { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([res.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'employes.pdf')
    document.body.appendChild(link)
    link.click()
    link.remove()
  },
}