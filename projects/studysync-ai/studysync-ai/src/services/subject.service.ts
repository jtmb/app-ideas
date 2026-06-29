import { Subject } from '../models/subject.model';
import SubjectRepository from '../repositories/subject.repository';

class SubjectService {
  private repository: SubjectRepository;

  constructor() {
    this.repository = new SubjectRepository();
  }

  /**
   * Update a subject by ID
   */
  async updateSubject(id: string, data: Partial<Pick<Subject, 'name' | 'description' | 'color'>>): Promise<Subject> {
    const existingSubject = await this.repository.findById(id);
    
    if (!existingSubject) {
      throw new Error('Subject not found');
    }

    return this.repository.update(id, data);
  }

  /**
   * Delete a subject by ID
   */
  async deleteSubject(id: string): Promise<void> {
    const existingSubject = await this.repository.findById(id);
    
    if (!existingSubject) {
      throw new Error('Subject not found');
    }

    await this.repository.delete(id);
  }
}

export default SubjectService;