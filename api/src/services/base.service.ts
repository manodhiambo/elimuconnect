import { Document, Model, FilterQuery, UpdateQuery } from 'mongoose';

export interface QueryOptions {
  populate?: string | string[];
  select?: string;
  sort?: any;
  limit?: number;
  skip?: number;
}

export class BaseService<T extends Document> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findById(id).exec() as Promise<T | null>;
  }

  async create(data: Partial<T>): Promise<T> {
    return this.model.create(data) as Promise<T>;
  }

  async findByIdAndUpdate(id: string, update: UpdateQuery<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, update, { new: true }).exec() as Promise<T | null>;
  }

  async findByIdAndDelete(id: string): Promise<T | null> {
    return this.model.findByIdAndDelete(id).exec() as Promise<T | null>;
  }

  async find(filter: FilterQuery<T> = {}): Promise<T[]> {
    return this.model.find(filter).exec() as Promise<T[]>;
  }

  async findOne(filter: FilterQuery<T>): Promise<T | null> {
    return this.model.findOne(filter).exec() as Promise<T | null>;
  }

  async count(filter: FilterQuery<T> = {}): Promise<number> {
    return this.model.countDocuments(filter).exec();
  }

  async updateMany(filter: FilterQuery<T>, update: UpdateQuery<T>): Promise<any> {
    return this.model.updateMany(filter, update).exec();
  }

  async deleteMany(filter: FilterQuery<T>): Promise<any> {
    return this.model.deleteMany(filter).exec();
  }
}
