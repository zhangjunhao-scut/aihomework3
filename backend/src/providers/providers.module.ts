import { Module } from '@nestjs/common';
import { ProvidersController } from './providers.controller';
import { DeepSeekAdapter } from '../adapters/deepseek.adapter';
import { ZhipuAdapter } from '../adapters/zhipu.adapter';
import { KimiAdapter } from '../adapters/kimi.adapter';
import { QwenAdapter } from '../adapters/qwen.adapter';
import { ErnieAdapter } from '../adapters/ernie.adapter';
import { SparkAdapter } from '../adapters/spark.adapter';
import { HunyuanAdapter } from '../adapters/hunyuan.adapter';
import { DoubaoAdapter } from '../adapters/doubao.adapter';
import { MinimaxAdapter } from '../adapters/minimax.adapter';
import { ProviderRegistry } from '../adapters/provider.registry';

@Module({
  controllers: [ProvidersController],
  providers: [
    DeepSeekAdapter,
    ZhipuAdapter,
    KimiAdapter,
    QwenAdapter,
    ErnieAdapter,
    SparkAdapter,
    HunyuanAdapter,
    DoubaoAdapter,
    MinimaxAdapter,
    ProviderRegistry,
  ],
  exports: [ProviderRegistry],
})
export class ProvidersModule {}
