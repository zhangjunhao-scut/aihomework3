import { Box, Tabs, Tab, Typography, Chip, Stack, Alert } from '@mui/material';
import { useState } from 'react';
import { usePlayground, estimateCost } from '../stores/playground';

function fmtMs(ms?: number) {
  if (ms === undefined || ms === null) return '-';
  return ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(2)} s`;
}

export default function ResultViewer() {
  const s = usePlayground();
  const [tab, setTab] = useState(0);

  const currentProvider = s.providers.find((p) => p.name === s.provider);
  const cost = estimateCost(s.usage, currentProvider?.pricing);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tab label="可视化" />
        <Tab label="原始 JSON" />
      </Tabs>

      {s.error && (
        <Alert severity="error" sx={{ m: 1 }}>
          {s.error}
        </Alert>
      )}

      <Box sx={{ flex: 1, overflow: 'auto', p: 2, minHeight: 0 }}>
        {tab === 0 ? (
          <Box
            sx={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontFamily: 'inherit',
              lineHeight: 1.7,
              minHeight: 60,
            }}
          >
            {s.content || (s.sending ? <Typography color="text.secondary">等待响应...</Typography> : '点击「发送」查看结果')}
            {s.sending && s.stream && <span className="cursor">▋</span>}
          </Box>
        ) : (
          <Box
            component="pre"
            sx={{
              fontFamily: 'ui-monospace, monospace',
              fontSize: 12,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              m: 0,
            }}
          >
            {s.raw ? JSON.stringify(s.raw, null, 2) : '（原始响应会在这里展示）'}
          </Box>
        )}
      </Box>

      <Stack direction="row" spacing={1} sx={{ p: 1, borderTop: 1, borderColor: 'divider', flexWrap: 'wrap' }}>
        {s.timing && (
          <>
            <Chip size="small" label={`首token ${fmtMs(s.timing.firstTokenMs)}`} />
            <Chip size="small" label={`总耗时 ${fmtMs(s.timing.totalMs)}`} />
          </>
        )}
        {s.usage && (
          <>
            <Chip size="small" label={`prompt ${s.usage.prompt_tokens}`} />
            <Chip size="small" label={`completion ${s.usage.completion_tokens}`} />
            <Chip size="small" label={`total ${s.usage.total_tokens}`} />
          </>
        )}
        {cost !== null && (
          <Chip size="small" color="warning" label={`预估费用 ¥${cost}`} />
        )}
        <Chip size="small" label={`${s.provider} / ${s.model}`} variant="outlined" />
      </Stack>
    </Box>
  );
}
