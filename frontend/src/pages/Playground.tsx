import { useEffect } from 'react';
import { Box, Button, Divider, Paper, Stack, Typography, Tooltip } from '@mui/material';
import { PlayArrow, ContentCopy, CleaningServices } from '@mui/icons-material';
import { usePlayground, buildRequest } from '../stores/playground';
import { chat, chatStream, saveHistory } from '../api/chat';
import { errMsg } from '../api/client';
import ProviderSelect from '../components/ProviderSelect';
import ParamPanel from '../components/ParamPanel';
import MessageEditor from '../components/MessageEditor';
import ResultViewer from '../components/ResultViewer';
import type { ChatResponse } from '../api/types';

export default function Playground() {
  const s = usePlayground();

  useEffect(() => {
    s.loadProviders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const send = async () => {
    s.resetResult();
    s.setError('');
    s.setSending(true);
    const req = buildRequest(s);
    const start = performance.now();
    try {
      if (s.stream) {
        let agg = '';
        const usage = { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
        const timing: any = {};
        let raw: any = null;
        await chatStream(
          req,
          (t) => {
            agg += t;
            s.appendDelta(t);
          },
          (info) => {
            if (info.usage) Object.assign(usage, info.usage);
            if (info.timing) Object.assign(timing, info.timing);
            if (info.raw) raw = info.raw;
          },
          (msg) => s.setError(msg),
        );
        // 流式结束后保存历史（聚合结果）
        const resp: ChatResponse = {
          ok: true,
          provider: req.provider,
          model: req.model,
          content: agg,
          raw: raw,
          usage,
          timing,
        };
        usePlayground.setState({ usage, timing, raw });
        try {
          await saveHistory({
            title: req.messages.find((m) => m.role === 'user')?.content?.slice(0, 30) || 'stream',
            request: req,
            response: resp,
            durationMs: Math.round(performance.now() - start),
          });
        } catch {}
      } else {
        const resp = await chat(req);
        s.applyResult(resp);
        try {
          await saveHistory({
            title: req.messages.find((m) => m.role === 'user')?.content?.slice(0, 30) || 'chat',
            request: req,
            response: resp,
            durationMs: resp.timing?.totalMs ?? Math.round(performance.now() - start),
          });
        } catch {}
      }
    } catch (e) {
      s.setError(errMsg(e));
    } finally {
      s.setSending(false);
    }
  };

  const copyJson = () => {
    const req = buildRequest(s);
    navigator.clipboard.writeText(JSON.stringify(req, null, 2));
  };

  const copyCurl = () => {
    const req = buildRequest(s);
    const baseUrl = req.baseUrl || s.providers.find((p) => p.name === req.provider)?.defaultBaseUrl || '';
    const url = `${baseUrl.replace(/\/$/, '')}/chat/completions`;
    const headers = [`-H 'Authorization: Bearer ${req.apiKey || '$API_KEY'}'`, `-H 'Content-Type: application/json'`];
    const body = {
      model: req.model,
      messages: req.messages,
      stream: !!req.params.stream,
      ...(req.params.temperature !== undefined ? { temperature: req.params.temperature } : {}),
      ...(req.params.top_p !== undefined ? { top_p: req.params.top_p } : {}),
      ...(req.params.max_tokens !== undefined ? { max_tokens: req.params.max_tokens } : {}),
    };
    const cmd = `curl -X POST '${url}' \\\n  ${headers.join(' \\\n  ')} \\\n  -d '${JSON.stringify(body)}'`;
    navigator.clipboard.writeText(cmd);
  };

  const clear = () => {
    s.resetResult();
  };

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
      {/* 左侧：参数 + 消息 */}
      <Box sx={{ width: 460, minWidth: 360, borderRight: 1, borderColor: 'divider', overflow: 'auto', p: 2 }}>
        <Stack spacing={2}>
          <ProviderSelect />
          <Divider />
          <Box>
            <Typography variant="subtitle2" gutterBottom>参数</Typography>
            <ParamPanel />
          </Box>
          <Divider />
          <MessageEditor />
        </Stack>
      </Box>

      {/* 右侧：结果 + 操作 */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box sx={{ display: 'flex', gap: 1, p: 1, borderBottom: 1, borderColor: 'divider' }}>
          <Button variant="contained" startIcon={<PlayArrow />} onClick={send} disabled={s.sending}>
            {s.sending ? '发送中...' : '发送'}
          </Button>
          <Tooltip title="复制等价 curl 命令">
            <Button startIcon={<ContentCopy />} onClick={copyCurl}>cURL</Button>
          </Tooltip>
          <Button startIcon={<ContentCopy />} onClick={copyJson}>请求 JSON</Button>
          <Button startIcon={<CleaningServices />} onClick={clear}>清空结果</Button>
        </Box>
        <Paper variant="outlined" sx={{ flex: 1, m: 1, display: 'flex', overflow: 'hidden' }}>
          <ResultViewer />
        </Paper>
      </Box>
    </Box>
  );
}
