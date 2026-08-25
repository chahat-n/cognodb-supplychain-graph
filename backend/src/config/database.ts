import neo4j, { Driver, Session } from 'neo4j-driver';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from parent root directory or local dir
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

const uri = process.env.COGNO_DB_URI || 'bolt+s://localhost:7687';
const user = process.env.COGNO_DB_USER || 'cognodb';
const password = process.env.COGNO_DB_PASSWORD || '';

let driver: Driver | null = null;

export const getDriver = (): Driver => {
  if (!driver) {
    if (!password || password === 'YOUR_PASSWORD_HERE') {
      console.warn('⚠️ Warning: COGNO_DB_PASSWORD is not configured in .env file!');
    }
    driver = neo4j.driver(uri, neo4j.auth.basic(user, password), {
      maxConnectionPoolSize: 50,
      connectionTimeout: 10000,
    });
  }
  return driver;
};

export const getSession = (): Session => {
  const d = getDriver();
  return d.session();
};

export const testConnection = async (): Promise<{ connected: boolean; message: string; details?: any }> => {
  let session: Session | null = null;
  try {
    const d = getDriver();
    session = d.session();
    const result = await session.run('RETURN 1 AS test');
    const value = result.records[0].get('test').toNumber();
    if (value === 1) {
      return { connected: true, message: 'Successfully connected to CognoDB Cloud graph database.' };
    }
    return { connected: false, message: 'Unexpected query response from CognoDB Cloud.' };
  } catch (error: any) {
    console.error('Database connection test failed:', error.message);
    return {
      connected: false,
      message: `Failed to connect to CognoDB Cloud: ${error.message}. Please verify COGNO_DB_URI and COGNO_DB_PASSWORD in your .env file.`,
      details: error.message,
    };
  } finally {
    if (session) {
      await session.close();
    }
  }
};

export const closeDriver = async (): Promise<void> => {
  if (driver) {
    await driver.close();
    driver = null;
  }
};
