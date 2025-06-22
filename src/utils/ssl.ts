import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

export interface SSLConfig {
  keyPath: string;
  certPath: string;
  exists: boolean;
}

/**
 * Generate SSL certificates in the data directory
 */
export function generateSSLCertificates(dataDir: string): SSLConfig {
  // Check if SSL is disabled
  if (process.env.DISABLE_SSL === 'true') {
    console.log('🔓 SSL disabled via DISABLE_SSL environment variable');
    return { keyPath: '', certPath: '', exists: false };
  }

  const sslDir = path.join(dataDir, 'ssl');
  const keyPath = path.join(sslDir, 'server.key');
  const certPath = path.join(sslDir, 'server.crt');

  // Create SSL directory if it doesn't exist
  if (!fs.existsSync(sslDir)) {
    fs.mkdirSync(sslDir, { recursive: true });
    console.log('📁 Created SSL directory:', sslDir);
  }

  // Check if certificates already exist and are valid
  if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    try {
      // Basic validation - check if files are readable and not empty
      const keyStats = fs.statSync(keyPath);
      const certStats = fs.statSync(certPath);
      
      if (keyStats.size > 0 && certStats.size > 0) {
        console.log('🔒 SSL certificates already exist and appear valid');
        return { keyPath, certPath, exists: true };
      } else {
        console.log('⚠️  Existing SSL certificates appear corrupted, regenerating...');
      }
    } catch (error) {
      console.log('⚠️  Error reading existing SSL certificates, regenerating...');
    }
  }

  try {
    console.log('🔧 Generating self-signed SSL certificates...');

    // Check if OpenSSL is available
    try {
      execSync('openssl version', { stdio: 'pipe' });
    } catch (error) {
      throw new Error('OpenSSL is not available. Please install OpenSSL to use HTTPS.');
    }

    // Generate private key
    console.log('🔑 Generating private key...');
    execSync(`openssl genrsa -out "${keyPath}" 2048`, { stdio: 'pipe' });

    // Generate certificate with comprehensive subject alternative names
    console.log('📜 Generating certificate...');
    const opensslCmd = [
      'openssl req -new -x509',
      `-key "${keyPath}"`,
      `-out "${certPath}"`,
      '-days 365',
      '-subj "/C=US/ST=State/L=City/O=FyraEmailSender/OU=Self-Signed/CN=localhost"',
      '-addext "subjectAltName=DNS:localhost,DNS:*.localhost,DNS:fyraemailsender,DNS:*.fyraemailsender,IP:127.0.0.1,IP:0.0.0.0"'
    ].join(' ');

    execSync(opensslCmd, { stdio: 'pipe' });

    // Set appropriate permissions
    fs.chmodSync(keyPath, 0o600);
    fs.chmodSync(certPath, 0o644);

    console.log('✅ SSL certificates generated successfully');
    console.log(`🔑 Private key: ${keyPath}`);
    console.log(`📜 Certificate: ${certPath}`);
    console.log('ℹ️  Note: These are self-signed certificates. Your browser will show a security warning.');

    return { keyPath, certPath, exists: true };
  } catch (error) {
    console.error('❌ Failed to generate SSL certificates:', error instanceof Error ? error.message : error);
    console.warn('⚠️  Falling back to HTTP mode');
    console.warn('💡 To fix this: ensure OpenSSL is installed and the data directory is writable');
    return { keyPath: '', certPath: '', exists: false };
  }
}

/**
 * Get SSL configuration
 */
export function getSSLConfig(): SSLConfig {
  const dataDir = process.env.DATA_DIR || '/data';
  return generateSSLCertificates(dataDir);
}
