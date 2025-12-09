import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';
import { Config } from '../../types';

/**
 * 配置服务，负责处理工具配置
 */
export class ConfigService {
  private configPath: string;
  private defaultConfig: Config = {
    templates: {
      proposal: 'default',
      tasks: 'default',
      spec: 'default'
    },
    validation: {
      strict: false
    },
    paths: {
      oksddDir: 'oksdd',
      changesDir: 'changes',
      specsDir: 'specs',
      archiveDir: 'changes/archive'
    }
  };

  /**
   * 构造函数
   */
  constructor() {
    this.configPath = join(process.cwd(), '.oksdd.yml');
  }

  /**
   * 加载配置
   */
  loadConfig(): Config {
    if (existsSync(this.configPath)) {
      try {
        const configContent = readFileSync(this.configPath, 'utf8');
        const userConfig = yaml.load(configContent) as Partial<Config>;
        // 合并默认配置和用户配置
        return { ...this.defaultConfig, ...userConfig };
      } catch (error) {
        console.warn('配置文件解析错误，使用默认配置');
        return this.defaultConfig;
      }
    }
    return this.defaultConfig;
  }

  /**
   * 保存配置
   * @param config 配置对象
   */
  saveConfig(config: Config): void {
    const configContent = yaml.dump(config);
    writeFileSync(this.configPath, configContent, 'utf8');
  }

  /**
   * 获取配置值
   * @param key 配置键
   * @param defaultValue 默认值
   */
  getConfigValue<T>(key: string, defaultValue?: T): T {
    const config = this.loadConfig();
    const keys = key.split('.');
    let value: any = config;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k as keyof typeof value];
      } else {
        return defaultValue as T;
      }
    }

    return value as T;
  }

  /**
   * 设置配置值
   * @param key 配置键
   * @param value 配置值
   */
  setConfigValue(key: string, value: any): void {
    const config = this.loadConfig();
    const keys = key.split('.');
    let current: any = config;

    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!current[k]) {
        current[k] = {};
      }
      current = current[k];
    }

    current[keys[keys.length - 1]] = value;
    this.saveConfig(config);
  }
}

// 单例实例
export const configService = new ConfigService();