const express = require('express');
const { BlobServiceClient } = require('@azure/storage-blob');
const { QueueServiceClient } = require('@azure/storage-queue');
const { ClientSecretCredential } = require('@azure/identity');

// Set up the credentials
const tenantId = 'numberOfTenantId';
const clientId = 'numberOfClientId';
const clientSecret = 'ACC_key';
const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);

// Create a BlobServiceClient or QueueServiceClient instance
const blobAccountUrl = 'https://trainersapl.blob.core.windows.net/';
const queueAccountUrl = 'https://trainersapl.blob.core.windows.net/';
const blobServiceClient = new BlobServiceClient(blobAccountUrl, credential);
const queueServiceClient = new QueueServiceClient(queueAccountUrl, credential);

// Set up the express app
const app = express();
const port = process.env.PORT || 3000;
app.get('/', async (req, res) => {
    try {
        const containerName = 'containerfordemo';
        const containerClient = blobServiceClient.getContainerClient(containerName);

        // List blobs in the container
        const blobs = [];
        const textFiles = [];
        const base64 = [];
        for await (const blob of containerClient.listBlobsFlat()) {
            const blobClient = containerClient.getBlobClient(blob.name);
            const buffer = await blobClient.downloadToBuffer();
            if (blob.name.lastIndexOf(".jpg") > -1) {
                base64.push(buffer.toString("base64"));
            } else if (blob.name.lastIndexOf(".txt") > -1) {
                const content = buffer.toString("utf-8");
                textFiles.push({ name: blob.name, content });
            }
            blobs.push(blob.name);
        }
        // const imagehtml = `<img src="data:image/jpg;base64,${base64}" />`;
        res.send(`
<h1>Azure Storage AD integration example</h1>
<h2>Blobs in ${containerName} container:</h2>
<ul>
${blobs.map((blob) => `<li>${blob}</li>`).join("")}
</ul>
${base64.map((base) => `<img src="data:image/jpg;base64,${base}" />`).join("")}
<h2>Text Files:</h2>
${textFiles.map((txt) => `<h3>${txt.name}</h3> <p>${txt.content}</p>`).join("")}
`);

    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred");
    }
});
app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});