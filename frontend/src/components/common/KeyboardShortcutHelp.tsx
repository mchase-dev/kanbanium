import { Modal, Typography, Space, Tag, Divider } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useKeyboardShortcutContext, formatShortcut } from '../../contexts/KeyboardShortcutContext';
import type { ShortcutRegistration } from '../../contexts/KeyboardShortcutContext';

const { Title, Text } = Typography;

export default function KeyboardShortcutHelp() {
  const { isHelpVisible, hideHelp, shortcuts } = useKeyboardShortcutContext();

  // Group shortcuts by category
  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    const category = shortcut.category || 'General';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(shortcut);
    return acc;
  }, {} as Record<string, ShortcutRegistration[]>);

  return (
    <Modal
      title={
        <Space>
          <QuestionCircleOutlined />
          <span>Keyboard Shortcuts</span>
        </Space>
      }
      open={isHelpVisible}
      onCancel={hideHelp}
      footer={null}
      width={600}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
          <div key={category}>
            <Title level={5} style={{ marginBottom: 12 }}>
              {category}
            </Title>
            <Space direction="vertical" style={{ width: '100%' }} size="small">
              {categoryShortcuts.map((shortcut) => (
                <div
                  key={shortcut.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    background: '#fafafa',
                    borderRadius: 4,
                  }}
                >
                  <Text>{shortcut.description}</Text>
                  <Tag
                    style={{
                      fontFamily: 'monospace',
                      fontSize: 13,
                      padding: '4px 12px',
                      background: '#fff',
                      border: '1px solid #d9d9d9',
                      borderRadius: 4,
                    }}
                  >
                    {formatShortcut(shortcut)}
                  </Tag>
                </div>
              ))}
            </Space>
            <Divider style={{ margin: '16px 0' }} />
          </div>
        ))}

        {shortcuts.length === 0 && (
          <Text type="secondary">No keyboard shortcuts registered</Text>
        )}
      </Space>
    </Modal>
  );
}
