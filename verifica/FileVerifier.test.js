const fs = require('fs/promises');
const crypto = require('crypto');
const FileVerifier = require('./FileVerifier');

jest.mock('fs/promises');

describe('FileVerifier', () => {
    const keyPath = '../signing_key.txt';
    const filePath = '../ejemplo.xlsx';
    const signaturePath = './ejemplo.xlsx.sig';
    const keyContent = 'testkey';
    const fileContent = 'file content';
    const signatureContent = crypto.createHmac('sha256', keyContent).update(fileContent).digest('hex');

    let verifier;

    beforeEach(() => {
        verifier = new FileVerifier(keyPath);
        fs.readFile.mockReset();
    });

    test('loadKey should load the key from the file', async () => {
        fs.readFile.mockResolvedValue(keyContent);

        await verifier.loadKey();

        expect(verifier.key).toBe(keyContent);
        expect(fs.readFile).toHaveBeenCalledWith(keyPath, 'utf8');
    });

    test('verifyFile should verify the file correctly', async () => {
        fs.readFile.mockResolvedValueOnce(fileContent).mockResolvedValueOnce(signatureContent);

        await verifier.loadKey();
        const result = await verifier.verifyFile(filePath, signaturePath);

        expect(result.isValid).toBe(true);
        expect(result.calculatedSignature).toBe(signatureContent);
        expect(result.expectedSignature).toBe(signatureContent);
        expect(result.fileName).toBe('example.txt');
    });

    test('simulateFileUpload should simulate the upload process', async () => {
        fs.readFile.mockResolvedValueOnce(fileContent).mockResolvedValueOnce(signatureContent);

        await verifier.loadKey();
        const result = await verifier.simulateFileUpload(filePath, signaturePath);

        expect(result).toBe(true);
    });
});