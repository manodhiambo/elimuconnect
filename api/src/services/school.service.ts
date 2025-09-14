// api/src/services/school.service.ts
import { BaseService } from './base.service';
import { School, SchoolDocument } from '../models/School';

export class SchoolService extends BaseService<SchoolDocument> {
  constructor() {
    super(School);
  }

  protected getSearchFields(): string[] {
    return ['name', 'code', 'county', 'district'];
  }

  async findByCode(code: string): Promise<SchoolDocument | null> {
    return await this.model.findOne({ code: code.toUpperCase() });
  }

  async findByCounty(county: string): Promise<SchoolDocument[]> {
    return await this.model.find({ county }).sort({ name: 1 });
  }

  async getVerifiedSchools(): Promise<SchoolDocument[]> {
    return await this.model.find({ verified: true }).sort({ name: 1 });
  }

  async verifySchool(schoolId: string): Promise<SchoolDocument | null> {
    return await this.model.findByIdAndUpdate(
      schoolId,
      { verified: true },
      { new: true }
    );
  }

  async getCounties(): Promise<string[]> {
    const counties = await this.model.distinct('county');
    return counties.sort();
  }

  async getSchoolsByLevel(level: string): Promise<SchoolDocument[]> {
    return await this.model.find({ level: level }).sort({ name: 1 });
  }
}
