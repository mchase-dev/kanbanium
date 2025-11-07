import { describe, it, expect, vi, beforeEach } from 'vitest';
import { waitFor } from '@testing-library/react';
import { renderHookWithClient } from '../test/hookTestUtils';
import {
  useAttachmentsByTask,
  useUploadAttachment,
  useDeleteAttachment,
} from './useAttachments';
import { attachmentsApi } from '../api/attachments';
import type { AttachmentDto } from '../types/api';

// Mock the API module
vi.mock('../api/attachments');

// Mock toast notifications
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useAttachments hooks', () => {
  const mockAttachment: AttachmentDto = {
    id: 'attachment-1',
    taskId: 'task-1',
    fileName: 'test-file.pdf',
    filePath: '/uploads/test-file.pdf',
    fileSize: 1024 * 100, // 100 KB
    contentType: 'application/pdf',
    uploadedBy: 'user-1',
    uploadedAt: '2025-01-01T00:00:00.000Z',
  };

  const mockImageAttachment: AttachmentDto = {
    id: 'attachment-2',
    taskId: 'task-1',
    fileName: 'test.png',
    filePath: '/uploads/test.png',
    fileSize: 1024 * 50,
    contentType: 'image/png',
    uploadedBy: 'user-1',
    uploadedAt: '2025-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useAttachmentsByTask', () => {
    it('fetches attachments by task successfully', async () => {
      vi.mocked(attachmentsApi.getAttachmentsByTask).mockResolvedValue([mockAttachment]);

      const { result } = renderHookWithClient(() => useAttachmentsByTask('task-1'));

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toHaveLength(1);
      expect(result.current.data?.[0]).toEqual(mockAttachment);
      expect(attachmentsApi.getAttachmentsByTask).toHaveBeenCalledWith('task-1');
    });

    it('returns empty array when no attachments found', async () => {
      vi.mocked(attachmentsApi.getAttachmentsByTask).mockResolvedValue([]);

      const { result } = renderHookWithClient(() => useAttachmentsByTask('task-1'));

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([]);
    });

    it('does not fetch when taskId is empty', () => {
      const { result } = renderHookWithClient(() => useAttachmentsByTask(''));

      expect(result.current.isFetching).toBe(false);
      expect(attachmentsApi.getAttachmentsByTask).not.toHaveBeenCalled();
    });

    it('handles fetch errors', async () => {
      const error = new Error('Network error');
      vi.mocked(attachmentsApi.getAttachmentsByTask).mockRejectedValue(error);

      const { result } = renderHookWithClient(() => useAttachmentsByTask('task-1'));

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeTruthy();
    });
  });

  describe('useUploadAttachment', () => {
    it('uploads an attachment successfully', async () => {
      const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });

      vi.mocked(attachmentsApi.uploadAttachment).mockResolvedValue(mockAttachment);

      const { result } = renderHookWithClient(() => useUploadAttachment());

      await result.current.mutateAsync({ taskId: 'task-1', file: mockFile });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(attachmentsApi.uploadAttachment).toHaveBeenCalledWith('task-1', mockFile);
      expect(result.current.data).toEqual(mockAttachment);
    });

    it('handles upload errors', async () => {
      const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      const error = new Error('Upload failed');

      vi.mocked(attachmentsApi.uploadAttachment).mockRejectedValue(error);

      const { result } = renderHookWithClient(() => useUploadAttachment());

      await expect(
        result.current.mutateAsync({ taskId: 'task-1', file: mockFile })
      ).rejects.toThrow('Upload failed');
    });

    it('uploads different file types successfully', async () => {
      const mockImageFile = new File(['image data'], 'test.png', { type: 'image/png' });

      vi.mocked(attachmentsApi.uploadAttachment).mockResolvedValue(mockImageAttachment);

      const { result } = renderHookWithClient(() => useUploadAttachment());

      await result.current.mutateAsync({ taskId: 'task-1', file: mockImageFile });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.fileName).toBe('test.png');
    });
  });

  describe('useDeleteAttachment', () => {
    it('deletes an attachment successfully', async () => {
      vi.mocked(attachmentsApi.deleteAttachment).mockResolvedValue(undefined);

      const { result } = renderHookWithClient(() => useDeleteAttachment());

      await result.current.mutateAsync({ id: 'attachment-1', taskId: 'task-1' });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(attachmentsApi.deleteAttachment).toHaveBeenCalledWith('attachment-1');
    });

    it('handles deletion errors', async () => {
      const error = new Error('Deletion failed');
      vi.mocked(attachmentsApi.deleteAttachment).mockRejectedValue(error);

      const { result } = renderHookWithClient(() => useDeleteAttachment());

      await expect(
        result.current.mutateAsync({ id: 'attachment-1', taskId: 'task-1' })
      ).rejects.toThrow('Deletion failed');
    });
  });
});
