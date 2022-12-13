const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const encKey = process.env.AOC_KEY;
const op = process.env.AOC_OP;
const encryptFile = (filePath) => {
  const data = fs.readFileSync(filePath);
  if (!encKey) throw new Error('Encryption key is not set');
  const hash = crypto.createHash('sha256');
  hash.update(encKey);
  const key = hash.digest();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(data);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  const encryptedFilePath = `${filePath}.encrypted`;
  fs.writeFileSync(encryptedFilePath, encrypted);
};
const decryptFile = (filePath) => {
  if (!filePath.endsWith('.encrypted')) {
    throw new Error('File is not encrypted');
  }
  const data = fs.readFileSync(filePath);
  if (!encKey) throw new Error('Encryption key is not set');
  const hash = crypto.createHash('sha256');
  hash.update(encKey);
  const key = hash.digest();
  const iv = data.slice(0, 16);
  const encrypted = data.slice(16);
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  console.log(decrypted);
  const decryptedFilePath = filePath.replace('.encrypted', '');
  fs.writeFileSync(decryptedFilePath, decrypted);
};
const scanDirectories = (rootPath, targetFiles, operation) => {
  const files = fs.readdirSync(rootPath);
  for (const file of files) {
    const filePath = path.join(rootPath, file);
    if (fs.lstatSync(filePath).isDirectory()) {
      scanDirectories(filePath, targetFiles, operation);
    } else if (targetFiles.includes(file)) {
      if (operation === 'encrypt') {
        encryptFile(filePath);
      } else if (operation === 'decrypt') {
        decryptFile(filePath);
      } else if (operation === 'delete'){
        fs.unlinkSync(filePath)
      }
    }
  }
};


const rootPath = './';
const targetFiles = ['input'];
if(process.env.AOC_OP && process.env.AOC_KEY){
  if(op=="decrypt") targetFiles[0]='input.encrypted';
  scanDirectories(rootPath, targetFiles, op);
} else {
  throw new Error('Key or Operation not defined');
}