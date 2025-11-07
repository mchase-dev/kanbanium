import { apiClient } from '../lib/api-client'
import type { AttachmentDto, Result } from '../types/api'

export const attachmentsApi = {
  // Get attachments by task
  getAttachmentsByTask: async (taskId: string): Promise<AttachmentDto[]> => {
    const response = await apiClient.get<Result<AttachmentDto[]>>(`/attachments/task/${taskId}`)
    return response.data.data!
  },

  // Upload attachment
  uploadAttachment: async (taskId: string, file: File): Promise<AttachmentDto> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('taskId', taskId)

    const response = await apiClient.post<Result<AttachmentDto>>('/attachments', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data.data!
  },

  // Download attachment
  downloadAttachment: async (id: string, fileName: string): Promise<void> => {
    const response = await apiClient.get(`/attachments/${id}/download`, {
      responseType: 'blob',
    })

    // Create a temporary URL and trigger download
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  },

  // Delete attachment
  deleteAttachment: async (id: string): Promise<void> => {
    await apiClient.delete(`/attachments/${id}`)
  },
}
