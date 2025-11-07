import { useState } from 'react'
import {
  List,
  Button,
  Input,
  Space,
  Typography,
  Popconfirm,
  Empty,
  Skeleton,
} from 'antd'
import {
  EditOutlined,
  DeleteOutlined,
  SendOutlined,
} from '@ant-design/icons'
import { useAuth } from '../../contexts/AuthContext'
import {
  useCommentsByTask,
  useCreateComment,
  useUpdateComment,
  useDeleteComment,
} from '../../hooks/useComments'
import { MentionText } from '../common/MentionText'
import { UserAvatar } from '../common/UserAvatar'
import type { CommentDto } from '../../types/api'

const { TextArea } = Input
const { Text, Paragraph } = Typography

interface TaskCommentsProps {
  taskId: string
}

export function TaskComments({ taskId }: TaskCommentsProps) {
  const { user } = useAuth()
  const [newComment, setNewComment] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')

  const { data: comments, isLoading } = useCommentsByTask(taskId)
  const createComment = useCreateComment()
  const updateComment = useUpdateComment()
  const deleteComment = useDeleteComment()

  const handleCreate = async () => {
    if (!newComment.trim()) return

    try {
      await createComment.mutateAsync({
        taskId,
        content: newComment.trim(),
      })
      setNewComment('')
    } catch (error) {
      // Error handled by mutation
    }
  }

  const startEdit = (comment: CommentDto) => {
    setEditingId(comment.id)
    setEditContent(comment.content)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditContent('')
  }

  const handleUpdate = async (commentId: string) => {
    if (!editContent.trim()) return

    try {
      await updateComment.mutateAsync({
        id: commentId,
        taskId,
        data: { id: commentId, content: editContent.trim() },
      })
      setEditingId(null)
      setEditContent('')
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleDelete = async (commentId: string) => {
    try {
      await deleteComment.mutateAsync({ id: commentId, taskId })
    } catch (error) {
      // Error handled by mutation
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    })
  }

  const isCommentAuthor = (comment: CommentDto) => {
    return user?.id === comment.userId
  }

  return (
    <div style={{ width: '100%' }}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* Add Comment Form */}
        <div>
          <TextArea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment... (Use @username to mention someone)"
            autoSize={{ minRows: 3, maxRows: 6 }}
            maxLength={2000}
            showCount
            disabled={createComment.isPending}
          />
          <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Tip: Use @username to mention team members
            </Text>
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleCreate}
              loading={createComment.isPending}
              disabled={!newComment.trim()}
            >
              Comment
            </Button>
          </div>
        </div>

        {/* Comments List */}
        {isLoading ? (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} style={{ padding: '16px 0' }}>
                <Skeleton avatar active paragraph={{ rows: 2 }} />
              </div>
            ))}
          </Space>
        ) : !comments || comments.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No comments yet. Be the first to comment!"
          />
        ) : (
          <List
            dataSource={comments}
            renderItem={(comment) => {
              const isAuthor = isCommentAuthor(comment)
              const isEditing = editingId === comment.id

              return (
                <List.Item
                  key={comment.id}
                  style={{
                    padding: '16px 0',
                    alignItems: 'flex-start',
                  }}
                >
                  <List.Item.Meta
                    avatar={<UserAvatar user={comment.user} />}
                    title={
                      <Space size={8}>
                        <Text strong>
                          {comment.user.firstName} {comment.user.lastName}
                        </Text>
                        {isAuthor && (
                          <Text type="secondary" style={{ fontSize: 12, fontWeight: 'normal' }}>
                            (You)
                          </Text>
                        )}
                        <Text type="secondary" style={{ fontSize: 12, fontWeight: 'normal' }}>
                          \u00B7
                        </Text>
                        <Text type="secondary" style={{ fontSize: 12, fontWeight: 'normal' }}>
                          {formatDate(comment.createdAt)}
                        </Text>
                        {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                          <>
                            <Text type="secondary" style={{ fontSize: 12, fontWeight: 'normal' }}>
                              \u00B7
                            </Text>
                            <Text type="secondary" style={{ fontSize: 12, fontWeight: 'normal' }}>
                              (edited)
                            </Text>
                          </>
                        )}
                      </Space>
                    }
                    description={
                      <div style={{ marginTop: 8 }}>
                        {isEditing ? (
                          <div>
                            <TextArea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              autoSize={{ minRows: 3, maxRows: 6 }}
                              maxLength={2000}
                              showCount
                            />
                            <Space style={{ marginTop: 8 }}>
                              <Button
                                type="primary"
                                size="small"
                                onClick={() => handleUpdate(comment.id)}
                                loading={updateComment.isPending}
                                disabled={!editContent.trim()}
                              >
                                Save
                              </Button>
                              <Button size="small" onClick={cancelEdit}>
                                Cancel
                              </Button>
                            </Space>
                          </div>
                        ) : (
                          <>
                            <Paragraph
                              style={{
                                whiteSpace: 'pre-wrap',
                                marginBottom: isAuthor ? 8 : 0,
                              }}
                            >
                              <MentionText content={comment.content} />
                            </Paragraph>
                            {isAuthor && (
                              <Space size="small">
                                <Button
                                  type="text"
                                  size="small"
                                  icon={<EditOutlined />}
                                  onClick={() => startEdit(comment)}
                                >
                                  Edit
                                </Button>
                                <Popconfirm
                                  title="Delete comment"
                                  description="Are you sure you want to delete this comment?"
                                  onConfirm={() => handleDelete(comment.id)}
                                  okText="Delete"
                                  cancelText="Cancel"
                                  okButtonProps={{ danger: true }}
                                >
                                  <Button
                                    type="text"
                                    danger
                                    size="small"
                                    icon={<DeleteOutlined />}
                                    loading={deleteComment.isPending}
                                  >
                                    Delete
                                  </Button>
                                </Popconfirm>
                              </Space>
                            )}
                          </>
                        )}
                      </div>
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
