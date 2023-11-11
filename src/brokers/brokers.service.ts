import fs from 'fs';
import path from 'path';

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { CreateBrokerDto } from './dto/create-broker.dto';
import { UpdateBrokerDto } from './dto/update-broker.dto';
import { Broker } from './entities/broker.entity';
import { __data_dir } from '../consts';

@Injectable()
export class BrokersService implements OnModuleInit {
  private static readonly BROKERS_FILE = path.join(__data_dir, 'brokers.json');

  private readonly logger = new Logger(BrokersService.name);
  private readonly brokers: Map<number, Broker> = new Map();

  create(createBrokerDto: CreateBrokerDto) {
    const id = this.brokers.size;
    const broker = new Broker(id, createBrokerDto.login, 0);
    this.brokers.set(id, broker);
    return broker;
  }

  onModuleInit() {
    this.load();
  }

  findAll(): Broker[] {
    return [...this.brokers.values()];
  }

  findOne(id: number): Broker {
    return this.brokers.get(id);
  }

  findByLogin(login: string): Broker {
    return [...this.brokers.values()].find((broker) => {
      console.log(broker.login, login);
      return broker.login === login;
    });
  }

  update(id: number, updateBrokerDto: UpdateBrokerDto) {
    if (!this.brokers.has(id)) {
      return;
    }
    const broker = this.brokers.get(id);
    Object.assign(broker, updateBrokerDto);
    return broker;
  }

  remove(id: number) {
    this.brokers.delete(id);
    return id;
  }

  private load() {
    if (!fs.existsSync(BrokersService.BROKERS_FILE)) {
      this.logger.warn(`File ${BrokersService.BROKERS_FILE} not found.`);
      return;
    }
    const data = fs.readFileSync(BrokersService.BROKERS_FILE, 'utf8');
    const brokers: Broker[] = JSON.parse(data);

    for (const broker of brokers) {
      this.brokers.set(
        broker.id,
        new Broker(
          broker.id,
          broker.login,
          broker.money,
          new Map(broker.actives),
        ),
      );
    }
    this.logger.debug(`${brokers.length} brokers loaded.`);
  }
}
