/**
 * Health Journal Entity Interface
 * 
 * Tracks symptoms, observations, and health notes for pets.
 * Supports categorization by type (symptom, observation, note) and severity levels.
 */

export interface HealthJournalEntry {
  id: string;
  petId: string;
  entryType: 'symptom' | 'observation' | 'note';
  title: string;
  description: string;
  symptom?: string;
  severity: number; // 1-5 scale, where 5 is most severe
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Health Journal DTOs for API operations
 */

export interface CreateHealthJournalDto {
  petId: string;
  entryType: 'symptom' | 'observation' | 'note';
  title: string;
  description: string;
  symptom?: string;
  severity: number; // 1-5 scale, where 5 is most severe
  tags: string[];
}

export interface UpdateHealthJournalDto {
  title?: string;
  description?: string;
  symptom?: string;
  severity?: number;
  tags?: string[];
}

/**
 * Health Journal Repository Interface
 */
export interface IHealthJournalRepository {
  findAllByPetId(petId: string): Promise<HealthJournalEntry[]>;
  findById(id: string): Promise<HealthJournalEntry | null>;
  findByPetIdAndDateRange(
    petId: string,
    startDate: Date,
    endDate: Date
  ): Promise<HealthJournalEntry[]>;
  create(entry: CreateHealthJournalDto): Promise<HealthJournalEntry>;
  update(id: string, dto: UpdateHealthJournalDto): Promise<HealthJournalEntry | null>;
  delete(id: string): Promise<void>;
}

/**
 * Health Journal Query Builder
 * 
 * Provides methods to construct complex queries for health journal data.
 */
export class HealthJournalQueryBuilder {
  private filters: {
    petId?: string;
    entryType?: 'symptom' | 'observation' | 'note';
    startDate?: Date;
    endDate?: Date;
    minSeverity?: number;
    maxSeverity?: number;
    tags?: string[];
  } = {};

  /**
   * Filter by pet ID
   */
  byPetId(petId: string): HealthJournalQueryBuilder {
    this.filters.petId = petId;
    return this;
  }

  /**
   * Filter by entry type
   */
  ofType(entryType: 'symptom' | 'observation' | 'note'): HealthJournalQueryBuilder {
    this.filters.entryType = entryType;
    return this;
  }

  /**
   * Filter by date range
   */
  betweenDates(startDate: Date, endDate: Date): HealthJournalQueryBuilder {
    this.filters.startDate = startDate;
    this.filters.endDate = endDate;
    return this;
  }

  /**
   * Filter by minimum severity (1-5)
   */
  withMinSeverity(minSeverity: number): HealthJournalQueryBuilder {
    if (minSeverity < 1 || minSeverity > 5) {
      throw new Error('Severity must be between 1 and 5');
    }
    this.filters.minSeverity = minSeverity;
    return this;
  }

  /**
   * Filter by maximum severity (1-5)
   */
  withMaxSeverity(maxSeverity: number): HealthJournalQueryBuilder {
    if (maxSeverity < 1 || maxSeverity > 5) {
      throw new Error('Severity must be between 1 and 5');
    }
    this.filters.maxSeverity = maxSeverity;
    return this;
  }

  /**
   * Filter by tags (AND logic - entry must have all specified tags)
   */
  withTags(tags: string[]): HealthJournalQueryBuilder {
    this.filters.tags = tags;
    return this;
  }

  /**
   * Get the final filter object
   */
  getFilters(): typeof this.filters {
    return this.filters;
  }

  /**
   * Build SQL WHERE clause from filters
   */
  buildWhereClause(): string {
    const conditions: string[] = [];
    const params: Record<string, any> = {};

    if (this.filters.petId) {
      conditions.push('pet_id = $1');
      params.$1 = this.filters.petId;
    }

    if (this.filters.entryType) {
      conditions.push('entry_type = $2');
      params.$2 = this.filters.entryType;
    }

    if (this.filters.startDate) {
      conditions.push('created_at >= $3');
      params.$3 = this.filters.startDate;
    }

    if (this.filters.endDate) {
      conditions.push('created_at <= $4');
      params.$4 = this.filters.endDate;
    }

    if (this.filters.minSeverity !== undefined) {
      conditions.push('severity >= $5');
      params.$5 = this.filters.minSeverity;
    }

    if (this.filters.maxSeverity !== undefined) {
      conditions.push('severity <= $6');
      params.$6 = this.filters.maxSeverity;
    }

    if (this.filters.tags && this.filters.tags.length > 0) {
      const placeholders = this.filters.tags.map((_, i) => `$${7 + i}`).join(', ');
      conditions.push(`tags ? ARRAY[${placeholders}]`);
      for (let i = 0; i < this.filters.tags.length; i++) {
        params[`$${7 + i}`] = this.filters.tags[i];
      }
    }

    return conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  }

  /**
   * Get parameter keys for query execution
   */
  getParamKeys(): string[] {
    return Object.keys(this.getFilters());
  }
}