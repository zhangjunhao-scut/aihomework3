import { Injectable } from '@nestjs/common';
import { LlmAdapter } from './adapter.interface';
import { DeepSeekAdapter } from './deepseek.adapter';
import { ZhipuAdapter } from './zhipu.adapter';
import { KimiAdapter } from './kimi.adapter';
import { QwenAdapter } from './qwen.adapter';
import { ErnieAdapter } from './ernie.adapter';
import { SparkAdapter } from './spark.adapter';
import { HunyuanAdapter } from './hunyuan.adapter';
import { DoubaoAdapter } from './doubao.adapter';
import { MinimaxAdapter } from './minimax.adapter';

/**
 * 厂商注册表。
 * 新增一个厂商：实现 LlmAdapter，在构造函数里注入并 register，
 * 并在 ProvidersModule 的 providers 里加一行。
 */
@Injectable()
export class ProviderRegistry {
  private readonly adapters: Map<string, LlmAdapter> = new Map();

  constructor(
    private readonly deepseek: DeepSeekAdapter,
    private readonly zhipu: ZhipuAdapter,
    private readonly kimi: KimiAdapter,
    private readonly qwen: QwenAdapter,
    private readonly ernie: ErnieAdapter,
    private readonly spark: SparkAdapter,
    private readonly hunyuan: HunyuanAdapter,
    private readonly doubao: DoubaoAdapter,
    private readonly minimax: MinimaxAdapter,
  ) {
    this.register(deepseek);
    this.register(zhipu);
    this.register(kimi);
    this.register(qwen);
    this.register(ernie);
    this.register(spark);
    this.register(hunyuan);
    this.register(doubao);
    this.register(minimax);
  }

  register(adapter: LlmAdapter) {
    this.adapters.set(adapter.name, adapter);
  }

  get(name: string): LlmAdapter | undefined {
    return this.adapters.get(name);
  }

  list(): LlmAdapter[] {
    return Array.from(this.adapters.values());
  }
}
