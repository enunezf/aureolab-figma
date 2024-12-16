const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');

class FileVerifier {
    constructor(keyPath) {
        this.keyPath = keyPath;
    }

    async loadKey() {
        try {
            const keyContent = await fs.readFile(this.keyPath, 'utf8');
            this.key = keyContent.trim();
        } catch (error) {
            throw new Error(`Error loading key file: ${error.message}`);
        }
    }

    async verifyFile(filePath, signaturePath) {
        try {
            // Verificar que tenemos la clave cargada
            if (!this.key) {
                throw new Error('No key loaded. Call loadKey() first');
            }

            // Leer el archivo y su firma
            const fileBuffer = await fs.readFile(filePath);
            const expectedSignature = (await fs.readFile(signaturePath, 'utf8')).trim();

            // Calcular la firma del archivo
            const hmac = crypto.createHmac('sha256', this.key);
            hmac.update(fileBuffer);
            const calculatedSignature = hmac.digest('hex');

            // Comparar las firmas
            const isValid = calculatedSignature === expectedSignature;

            return {
                isValid,
                calculatedSignature,
                expectedSignature,
                fileName: path.basename(filePath)
            };
        } catch (error) {
            throw new Error(`Error verifying file: ${error.message}`);
        }
    }

    async simulateFileUpload(filePath, signaturePath) {
        try {
            const verificationResult = await this.verifyFile(filePath, signaturePath);
            
            if (verificationResult.isValid) {
                // Simular subida del archivo
                console.log(`✅ File "${verificationResult.fileName}" verified successfully`);
                console.log('Uploading file...');
                
                // Simular un delay de red
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                console.log('File uploaded successfully');
                return true;
            } else {
                console.log(`❌ File "${verificationResult.fileName}" verification failed`);
                console.log('Expected signature:', verificationResult.expectedSignature);
                console.log('Calculated signature:', verificationResult.calculatedSignature);
                return false;
            }
        } catch (error) {
            console.error('Error during upload process:', error.message);
            return false;
        }
    }
}

// Función principal que ejecuta el proceso
function runVerification() {
    const verifier = new FileVerifier('./signing_key.txt');
    
    verifier.loadKey()
        .then(() => {
            console.log('✅ Signing key loaded successfully');
            return verifier.simulateFileUpload('./example.txt', './example.txt.sig');
        })
        .then(result => {
            if (result) {
                console.log('✅ Process completed successfully');
            } else {
                console.log('❌ Process failed');
            }
        })
        .catch(error => {
            console.error('Error:', error.message);
        });
}

// Ejecutar el ejemplo si se llama directamente
if (require.main === module) {
    runVerification();
}

module.exports = FileVerifier;