import { Box, TextField, FormControl, InputLabel, Select, MenuItem, Stack, IconButton, Tooltip, Button, Switch, FormControlLabel, Typography } from '@mui/material';
import { Visibility, VisibilityOff, Save } from '@mui/icons-material';
import { useState } from 'react';
import { usePlayground } from '../stores/playground';
import { saveKey } from '../api/provider';
import { errMsg } from '../api/client';

export default function ProviderSelect() {
  const s = usePlayground();
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const currentProvider = s.providers.find((p) => p.name === s.provider);
  const keyHint = currentProvider?.keyHint;

  const onSave = async () => {
    if (!s.apiKey) return setMsg('请先输入 Key');
    setSaving(true);
    setMsg('');
    try {
      await saveKey(s.provider, s.apiKey);
      await s.loadKey();
      setMsg('已保存');
      s.setApiKey('');
    } catch (e) {
      setMsg(errMsg(e));
    } finally {
      setSaving(false);
    }
  };

  // 构造 Key 输入框 placeholder
  const keyPlaceholder = s.keySaved
    ? `已保存：${s.keyMasked}`
    : keyHint || '未保存';

  return (
    <Stack spacing={1.5}>
      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>厂商</InputLabel>
          <Select
            label="厂商"
            value={s.provider}
            onChange={(e) => s.setProvider(e.target.value)}
          >
            {s.providers.map((p) => (
              <MenuItem key={p.name} value={p.name}>
                {p.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>模型</InputLabel>
          <Select
            label="模型"
            value={s.model}
            onChange={(e) => s.setModel(e.target.value)}
          >
            {(currentProvider?.models || []).map((m) => (
              <MenuItem key={m} value={m}>
                {m}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={s.useCustomBaseUrl}
              onChange={(e) => s.setUseCustomBaseUrl(e.target.checked)}
            />
          }
          label="自定义 BaseURL"
        />
        {s.useCustomBaseUrl && (
          <TextField
            size="small"
            value={s.baseUrl}
            onChange={(e) => s.setBaseUrl(e.target.value)}
            sx={{ flex: 1 }}
            placeholder="https://..."
          />
        )}
        {!s.useCustomBaseUrl && (
          <Typography variant="body2" color="text.secondary">
            {s.baseUrl}
          </Typography>
        )}
      </Box>

      <Box>
        <TextField
          size="small"
          fullWidth
          label="API Key（一次性，可留空用已保存的）"
          type={show ? 'text' : 'password'}
          value={s.apiKey}
          onChange={(e) => s.setApiKey(e.target.value)}
          placeholder={keyPlaceholder}
          InputProps={{
            endAdornment: (
              <>
                <IconButton size="small" onClick={() => setShow((v) => !v)}>
                  {show ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                </IconButton>
                <Tooltip title="保存到账号（加密存储）">
                  <IconButton size="small" onClick={onSave} disabled={saving}>
                    <Save fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            ),
          }}
        />
        {keyHint && !s.apiKey && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            {keyHint}
          </Typography>
        )}
        {msg && <Typography variant="caption" color={msg.includes('失败') || msg.includes('请') ? 'error' : 'text.secondary'}>{msg}</Typography>}
      </Box>
    </Stack>
  );
}
