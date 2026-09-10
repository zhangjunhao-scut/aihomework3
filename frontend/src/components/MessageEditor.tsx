import { Box, IconButton, Stack, TextField, Typography, Button, MenuItem } from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { usePlayground } from '../stores/playground';
import type { ChatMessage } from '../api/types';

const ROLES: ChatMessage['role'][] = ['system', 'user', 'assistant'];

export default function MessageEditor() {
  const s = usePlayground();

  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2">System Prompt</Typography>
      <TextField
        size="small"
        multiline
        minRows={2}
        maxRows={6}
        placeholder="（可选）你是一个翻译助手..."
        value={s.systemPrompt}
        onChange={(e) => s.setSystemPrompt(e.target.value)}
      />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
        <Typography variant="subtitle2">消息列表（多轮对话）</Typography>
        <Button size="small" startIcon={<Add />} onClick={() => s.addMessage({ role: 'user', content: '' })}>
          添加消息
        </Button>
      </Box>

      <Stack spacing={1}>
        {s.messages.map((m, i) => (
          <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
            <TextField
              size="small"
              select
              value={m.role}
              onChange={(e) => s.updateMessage(i, { role: e.target.value as ChatMessage['role'] })}
              sx={{ width: 110 }}
            >
              {ROLES.map((r) => (
                <MenuItem key={r} value={r}>{r}</MenuItem>
              ))}
            </TextField>
            <TextField
              size="small"
              multiline
              minRows={1}
              maxRows={8}
              fullWidth
              value={m.content}
              onChange={(e) => s.updateMessage(i, { content: e.target.value })}
            />
            <IconButton size="small" onClick={() => s.removeMessage(i)} disabled={s.messages.length <= 1}>
              <Delete fontSize="small" />
            </IconButton>
          </Box>
        ))}
      </Stack>
    </Stack>
  );
}
