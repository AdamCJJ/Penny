const STORAGE_KEY = 'pennys_fairy_closet_v1';

const DEFAULTS = {
  outfit: 0,
  wings: 0,
  crown: 0,
  background: 0
};

export default class StorageManager {
  constructor() {
    this._state = { ...DEFAULTS };
    this._load();
  }

  _load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        this._state = { ...DEFAULTS, ...parsed };
      }
    } catch {
      this._state = { ...DEFAULTS };
    }
  }

  _save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._state));
    } catch {
      // storage not available – ignore
    }
  }

  get(key) {
    return this._state[key] ?? DEFAULTS[key] ?? 0;
  }

  set(key, value) {
    this._state[key] = value;
    this._save();
  }

  reset() {
    this._state = { ...DEFAULTS };
    this._save();
  }

  getAll() {
    return { ...this._state };
  }
}
