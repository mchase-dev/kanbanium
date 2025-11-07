import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { attachmentsApi } from '../api/attachments'
import { taskKeys } from './useTasks'

// Query Keys
export const attachmentKeys = {
  all: ['attachments'] as const,
  lists: () => [...attachmentKeys.all, 'list'] as const,
  byTask: (taskId: string) => [...attachmentKeys.all, 'task', taskId] as const,
}

// Fetch attachments by task
export function useAttachmentsByTask(taskId: string) {
  return useQuery({
    queryKey: attachmentKeys.byTask(taskId),
    queryFn: () => attachmentsApi.getAttachmentsByTask(taskId),
    enabled: !!taskId,
  })
}

// Upload attachment
export function useUploadAttachment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, file }: { taskId: string; file: File }) =>
      attachmentsApi.uploadAttachment(taskId, file),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: attachmentKeys.byTask(taskId) })
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) })
      toast.success('File uploaded successfully')
    },
  })
}

// Delete attachment
export function useDeleteAttachment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }: { id: string; taskId: string }) =>
      attachmentsApi.deleteAttachment(id),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: attachmentKeys.byTask(taskId) })
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) })
      toast.success('Attachment deleted')
    },
  })
}
