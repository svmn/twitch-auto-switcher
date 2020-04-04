import { NextTarget, NextTargetType, CommonOptionValue } from '@/types/next-target.interface';

export class UserSettings {
  public static async isEnabled(): Promise<boolean> {
    return (await this.get('enabled')) ?? true;
  }

  public static async setEnabled(value: boolean) {
    await this.set('enabled', value);
  }

  public static async getNextTarget(): Promise<NextTarget> {
    const defaultValue: NextTarget = {
      type: NextTargetType.Common,
      value: CommonOptionValue.Current,
    };

    return (await this.get('nextTarget')) ?? defaultValue;
  }

  public static async setNextTarget(value: NextTarget) {
    await this.set('nextTarget', value);
  }

  private static async get<T>(key: string): Promise<T> {
    const setting = await browser.storage.sync.get(key);
    return setting[key];
  }

  private static async set(key: string, value: any): Promise<void> {
    await browser.storage.sync.set({ [key]: value });
  }
}
