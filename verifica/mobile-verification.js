const FileVerifier = require('./FileVerifier');

async function run() {
    const verifier = new FileVerifier('../signing_key.txt');
    await verifier.loadKey();
    await verifier.simulateFileUpload('../ejemplo.xlsx', '../ejemplo.xlsx.sig');
}

run().catch(error => {
    console.error('Error:', error.message);
});