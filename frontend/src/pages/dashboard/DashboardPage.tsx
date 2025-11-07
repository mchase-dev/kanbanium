import { useState } from 'react'
import { Button, Card, Row, Col, Typography, Empty } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { DashboardLayout } from '../../layouts/DashboardLayout'
import { BoardCard } from '../../components/board/BoardCard'
import { CreateBoardModal } from '../../components/board/CreateBoardModal'
import BoardCardSkeleton from '../../components/board/BoardCardSkeleton'
import GlobalKeyboardShortcuts from '../../components/common/GlobalKeyboardShortcuts'
import { useBoards } from '../../hooks/useBoards'

const { Title, Text } = Typography

export function DashboardPage() {
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const { data: boards, isLoading } = useBoards()

  return (
    <DashboardLayout>
      <GlobalKeyboardShortcuts onCreateBoard={() => setCreateModalOpen(true)} />
      <div
        style={{
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Title level={2} style={{ margin: 0 }}>
          Your Boards
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={() => setCreateModalOpen(true)}
        >
          Create Board
        </Button>
      </div>

      {isLoading ? (
        <Row gutter={[16, 16]}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Col key={index} xs={24} sm={12} lg={8} xl={6}>
              <BoardCardSkeleton />
            </Col>
          ))}
        </Row>
      ) : boards && boards.length > 0 ? (
        <Row gutter={[16, 16]}>
          {boards.map((board) => (
            <Col key={board.id} xs={24} sm={12} lg={8} xl={6}>
              <BoardCard board={board} />
            </Col>
          ))}

          {/* Create Board Card */}
          <Col xs={24} sm={12} lg={8} xl={6}>
            <Card
              hoverable
              onClick={() => setCreateModalOpen(true)}
              style={{
                height: '100%',
                minHeight: 200,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderStyle: 'dashed',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <PlusOutlined style={{ fontSize: 32, color: '#999', marginBottom: 8 }} />
                <div>
                  <Text strong style={{ color: '#666' }}>
                    Create new board
                  </Text>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      ) : (
        <Empty
          description={
            <span>
              No boards yet. <a onClick={() => setCreateModalOpen(true)}>Create your first board</a>
            </span>
          }
          style={{ padding: '80px 0' }}
        />
      )}

      <CreateBoardModal open={createModalOpen} onCancel={() => setCreateModalOpen(false)} />
    </DashboardLayout>
  )
}
