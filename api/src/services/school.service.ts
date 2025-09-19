import { School, SchoolDocument } from "../models/School";

export class SchoolService {
  async findById(id: string): Promise<SchoolDocument | null> {
    return await School.findById(id);
  }

  async findByNemisCode(nemisCode: string): Promise<SchoolDocument | null> {
    return await School.findOne({ nemisCode });
  }
}

export const schoolService = new SchoolService();
