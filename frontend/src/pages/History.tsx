import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Chip,
  Stack,
} from '@mui/material';
import { Delete, Refresh, Replay } from '@mui/icons-material';
import { listHistory, deleteHistory, clearHistory } from '../api/chat';
import { usePlayground } from '../stores/playground';
import { useNavigate } from 'react-router-dom';
import type { HistoryItem } from '../api/types';

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const loadFromHistory = usePlayground((s) => s.loadFromHistory);

  const load = async () => {
    setLoading(true);
    try {
      setItems(await listHistory());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const apply = (item: HistoryItem) => {
    loadFromHistory(item.request, item.response);
    navigate('/');
  };

  const remove = async (id: string) => {
    await deleteHistory(id);
    setItems(items.filter((i) => i.id !== id));
  };

  const clearAll = async () => {
    if (!confirm('确定清空所有历史记录吗？')) return;
    await clearHistory();
    setItems([]);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6">历史记录</Typography>
        <Stack direction="row" spacing={1}>
          <Button startIcon={<Refresh />} onClick={load} disabled={loading}>
            刷新
          </Button>
          <Button color="error" startIcon={<Delete />} onClick={clearAll} disabled={!items.length}>
            清空
          </Button>
        </Stack>
      </Stack>

      {items.length === 0 ? (
        <Typography color="text.secondary" align="center" sx={{ mt: 8 }}>
          暂无历史记录，去 Playground 发送一次请求吧
        </Typography>
      ) : (
        <List>
          {items.map((it) => (
            <ListItem
              key={it.id}
              divider
              sx={{ '&:hover': { bgcolor: 'action.hover' } }}
              secondaryAction={
                <ListItemSecondaryAction>
                  <IconButton edge="end" onClick={() => apply(it)} title="载入到 Playground">
                    <Replay />
                  </IconButton>
                  <IconButton edge="end" onClick={() => remove(it.id)}>
                    <Delete />
                  </IconButton>
                </ListItemSecondaryAction>
              }
            >
              <ListItemText
                primary={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography component="span" fontWeight={600}>{it.title || '(无标题)'}</Typography>
                    <Chip size="small" label={it.request?.provider} variant="outlined" />
                    <Chip size="small" label={it.request?.model} variant="outlined" />
                    {it.request?.params?.stream && <Chip size="small" label="stream" color="secondary" />}
                  </Stack>
                }
                secondary={
                  <Typography variant="body2" color="text.secondary">
                    {new Date(it.createdAt).toLocaleString()} · 耗时 {it.durationMs}ms
                    {it.response?.usage ? ` · total_tokens ${it.response.usage.total_tokens}` : ''}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}
