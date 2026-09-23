import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly PREFIX = 'shuttleops_';

  getItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(this.PREFIX + key);
      return item ? (JSON.parse(item) as T) : defaultValue;
    } catch (e) {
      console.warn(`Error reading localStorage key ${key}:`, e);
      return defaultValue;
    }
  }

  setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(this.PREFIX + key, JSON.stringify(value));
    } catch (e) {
      console.warn(`Error writing localStorage key ${key}:`, e);
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(this.PREFIX + key);
    } catch (e) {
      console.warn(`Error removing localStorage key ${key}:`, e);
    }
  }
}
