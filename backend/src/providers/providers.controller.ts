import { Controller, Get, Param } from '@nestjs/common';
import { ProviderRegistry } from '../adapters/provider.registry';

@Controller('providers')
export class ProvidersController {
  constructor(private readonly registry: ProviderRegistry) {}

  @Get()
  list() {
    return this.registry.list().map((a) => ({
      name: a.name,
      defaultBaseUrl: a.defaultBaseUrl,
      models: a.models,
      paramBounds: a.paramBounds,
      supportsTopP: a.supportsTopP ?? true,
      keyHint: a.keyHint,
      keyFormat: a.keyFormat,
      pricing: a.pricing,
      supportsCustomModel: a.supportsCustomModel ?? false,
    }));
  }

  @Get(':id/models')
  models(@Param('id') id: string) {
    const a = this.registry.get(id);
    return { provider: id, models: a?.models ?? [] };
  }
}
