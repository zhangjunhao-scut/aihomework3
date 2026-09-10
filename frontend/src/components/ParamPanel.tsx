import { Stack, TextField, Typography, FormControlLabel, Switch, Box } from '@mui/material';
import { usePlayground } from '../stores/playground';

function Slider({ label, value, min, max, step, onChange }: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{ flex: 1 }}
        />
        <TextField
          size="small"
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          sx={{ width: 90 }}
          inputProps={{ min, max, step }}
        />
      </Box>
    </Box>
  );
}

export default function ParamPanel() {
  const s = usePlayground();
  const p = s.providers.find((x) => x.name === s.provider);
  const bounds = p?.paramBounds;
  const supportsTopP = p?.supportsTopP !== false;

  // 动态边界，带默认兜底
  const tBounds = bounds?.temperature;
  const tMin = tBounds?.min ?? 0;
  const tMax = tBounds?.max ?? 2;
  const tStep = tMax <= 1 ? 0.01 : 0.1;

  const pBounds = bounds?.top_p;
  const pMin = pBounds?.min ?? 0;
  const pMax = pBounds?.max ?? 1;
  const pStep = 0.05;

  const mBounds = bounds?.max_tokens;
  const mMin = mBounds?.min ?? 1;
  const mMax = mBounds?.max ?? 32768;

  return (
    <Stack spacing={1.5}>
      <Slider
        label="temperature"
        value={s.params.temperature ?? 0.7}
        min={tMin}
        max={tMax}
        step={tStep}
        onChange={(v) => s.setParam('temperature', v)}
      />
      {supportsTopP && (
        <Slider
          label="top_p"
          value={s.params.top_p ?? 1}
          min={pMin}
          max={pMax}
          step={pStep}
          onChange={(v) => s.setParam('top_p', v)}
        />
      )}
      <Box>
        <Typography variant="caption" color="text.secondary">max_tokens</Typography>
        <TextField
          size="small"
          type="number"
          fullWidth
          value={s.params.max_tokens ?? 1024}
          onChange={(e) => s.setParam('max_tokens', Number(e.target.value))}
          inputProps={{ min: mMin, max: mMax }}
        />
      </Box>
      <FormControlLabel
        control={<Switch checked={s.stream} onChange={(e) => s.setStream(e.target.checked)} />}
        label="stream 流式"
      />
    </Stack>
  );
}
