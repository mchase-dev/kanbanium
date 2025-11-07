import { useState } from 'react'
import {
  List,
  Button,
  Space,
  Typography,
  Popconfirm,
  Upload,
  Progress,
} from 'antd'
import EmptyState from '../common/EmptyState'
import {
  UploadOutlined,
  DeleteOutlined,
  DownloadOutlined,
  FileOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FileImageOutlined,
  FileZipOutlined,
  FileTextOutlined,
} from '@ant-design/icons'
import { useAuth } from '../../contexts/AuthContext'
import {
  useAttachmentsByTask,
  useUploadAttachment,
  useDeleteAttachment,
} from '../../hooks/useAttachments'
import { attachmentsApi } from '../../api/attachments'
import type { AttachmentDto } from '../../types/api'

const { Text } = Typography

interface TaskAttachmentsProps {
  taskId: string
}

export function TaskAttachments({ taskId }: TaskAttachmentsProps) {
  const { user } = useAuth()
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)

  const { data: attachments, isLoading } = useAttachmentsByTask(taskId)
  const uploadAttachment = useUploadAttachment()
  const deleteAttachment = useDeleteAttachment()

  const handleFileSelect = async (file: File) => {
    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      alert('File size exceeds 10MB limit')
      return
    }

    try {
      setUploadProgress(0)
      await uploadAttachment.mutateAsync({ taskId, file })
      setUploadProgress(null)
    } catch (error) {
      setUploadProgress(null)
    }
  }

  const handleDownload = async (attachment: AttachmentDto) => {
    try {
      await attachmentsApi.downloadAttachment(attachment.id, attachment.fileName)
    } catch (error) {
      // Error handled by global interceptor
    }
  }

  const handleDelete = async (attachmentId: string) => {
    try {
      await deleteAttachment.mutateAsync({ id: attachmentId, taskId })
    } catch (error) {
      // Error handled by global interceptor
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()

    switch (extension) {
      case 'pdf':
        return <FilePdfOutlined style={{ fontSize: 24, color: '#ff4d4f' }} />
      case 'doc':
      case 'docx':
        return <FileWordOutlined style={{ fontSize: 24, color: '#1890ff' }} />
      case 'xls':
      case 'xlsx':
        return <FileExcelOutlined style={{ fontSize: 24, color: '#52c41a' }} />
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
        return <FileImageOutlined style={{ fontSize: 24, color: '#722ed1' }} />
      case 'zip':
      case 'rar':
        return <FileZipOutlined style={{ fontSize: 24, color: '#fa8c16' }} />
      case 'txt':
        return <FileTextOutlined style={{ fontSize: 24, color: '#8c8c8c' }} />
      default:
        return <FileOutlined style={{ fontSize: 24, color: '#8c8c8c' }} />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffHours < 24) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    })
  }

  const isAttachmentOwner = (attachment: AttachmentDto) => {
    return user?.id === attachment.uploadedBy
  }

  return (
    <div style={{ width: '100%' }}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* Upload Area */}
        <Upload.Dragger
          beforeUpload={(file) => {
            handleFileSelect(file)
            return false // Prevent default upload
          }}
          showUploadList={false}
          disabled={uploadAttachment.isPending}
          style={{ padding: '20px' }}
        >
          <p className="ant-upload-drag-icon">
            <UploadOutlined style={{ fontSize: 48, color: '#1890ff' }} />
          </p>
          <p className="ant-upload-text">Click or drag file to upload</p>
          <p className="ant-upload-hint">
            Maximum file size: 10MB. Supported formats: PDF, Word, Excel, Images, ZIP, Text
          </p>
        </Upload.Dragger>

        {/* Upload Progress */}
        {uploadProgress !== null && (
          <div>
            <Text>Uploading...</Text>
            <Progress percent={uploadProgress} status="active" />
          </div>
        )}

        {/* Attachments List */}
        {isLoading ? (
          <Text type="secondary">Loading attachments...</Text>
        ) : !attachments || attachments.length === 0 ? (
          <EmptyState
            title="No attachments yet"
            description="Upload files to share with your team"
            icon={<UploadOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
          />
        ) : (
          <List
            dataSource={attachments}
            renderItem={(attachment) => {
              const isOwner = isAttachmentOwner(attachment)

              return (
                <List.Item
                  key={attachment.id}
                  style={{
                    padding: '16px 0',
                    alignItems: 'flex-start',
                  }}
                  actions={[
                    <Button
                      key="download"
                      type="text"
                      size="small"
                      icon={<DownloadOutlined />}
                      onClick={() => handleDownload(attachment)}
                    >
                      Download
                    </Button>,
                    isOwner && (
                      <Popconfirm
                        key="delete"
                        title="Delete attachment"
                        description="Are you sure you want to delete this attachment?"
                        onConfirm={() => handleDelete(attachment.id)}
                        okText="Delete"
                        cancelText="Cancel"
                        okButtonProps={{ danger: true }}
                      >
                        <Button
                          type="text"
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          loading={deleteAttachment.isPending}
                        >
                          Delete
                        </Button>
                      </Popconfirm>
                    ),
                  ].filter(Boolean)}
                >
                  <List.Item.Meta
                    avatar={getFileIcon(attachment.fileName)}
                    title={
                      <Space direction="vertical" size={0}>
                        <Text strong style={{ fontSize: 14 }}>
                          {attachment.fileName}
                        </Text>
                        <Space size={4} split="\u00B7">
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {formatFileSize(attachment.fileSize)}
                          </Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {formatDate(attachment.uploadedAt)}
                          </Text>
                          {isOwner && (
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              (You)
                            </Text>
                          )}
                        </Space>
                      </Space>
                    }
                  />
                </List.Item>
              )
            }}
          />
        )}
      </Space>
    </div>
  )
}
