import { Test, TestingModule } from '@nestjs/testing';
import { ControllerGateway } from './controller.gateway';
import { ControllerService } from './controller.service';

describe('ControllerGateway', () => {
  let gateway: ControllerGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ControllerGateway, ControllerService],
    }).compile();

    gateway = module.get<ControllerGateway>(ControllerGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
