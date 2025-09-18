// Create: /home/manodhiambo/elimuconnect/api/src/services/base.service.ts

import { Model, Document, FilterQuery, UpdateQuery } from 'mongoose';

export class BaseService<T extends Document> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async create(data: Partial<T>): Promise<T> {
    const document = new this.model(data);
    return await document.save();
  }

  async findById(id: string): Promise<T | null> {
    return await this.model.findById(id);
  }

  async findOne(filter: FilterQuery<T>): Promise<T | null> {
    return await this.model.findOne(filter);
  }

  async find(filter: FilterQuery<T> = {}, options: any = {}): Promise<T[]> {
    let query = this.model.find(filter);
    
    if (options.sort) {
      query = query.sort(options.sort);
    }
    
    if (options.populate) {
      query = query.populate(options.populate);
    }
    
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    if (options.skip) {
      query = query.skip(options.skip);
    }

    return await query.exec();
  }

  async update(id: string, data: UpdateQuery<T>): Promise<T | null> {
    return await this.model.findByIdAndUpdate(id, data, { new: true });
  }

  async updateOne(filter: FilterQuery<T>, data: UpdateQuery<T>): Promise<T | null> {
    return await this.model.findOneAndUpdate(filter, data, { new: true });
  }

  async delete(id: string): Promise<T | null> {
    return await this.model.findByIdAndDelete(id);
  }

  async deleteOne(filter: FilterQuery<T>): Promise<T | null> {
    return await this.model.findOneAndDelete(filter);
  }

  async count(filter: FilterQuery<T> = {}): Promise<number> {
    return await this.model.countDocuments(filter);
  }

  async exists(filter: FilterQuery<T>): Promise<boolean> {
    const doc = await this.model.findOne(filter).select('_id');
    return !!doc;
  }

  async paginate(filter: FilterQuery<T> = {}, page: number = 1, limit: number = 10, options: any = {}) {
    const skip = (page - 1) * limit;
    const total = await this.count(filter);
    const totalPages = Math.ceil(total / limit);
    
    let query = this.model.find(filter).skip(skip).limit(limit);
    
    if (options.sort) {
      query = query.sort(options.sort);
    }
    
    if (options.populate) {
      query = query.populate(options.populate);
    }

    const data = await query.exec();

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }
}
