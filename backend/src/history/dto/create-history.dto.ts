import { IsNumber, IsObject, IsString } from 'class-validator';

export class CreateHistoryDto {
  @IsString()
  title: string;

  @IsObject()
  request: any;

  @IsObject()
  response: any;

  @IsNumber()
  durationMs: number;
}
