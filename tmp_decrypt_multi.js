const crypto = require('crypto');

const secrets = [
    'aimstors_encryption_key_v1_secure_2026',
    '3da892381df8301084f6c10a7280fa621fcb8304e8bb50f3b5ba42ebf24c6150'
];
const salt = 'aimstors-salt';
const algorithm = 'aes-256-gcm';
const text = '564440de947c1048c0947e69:48c72e6e3ac28aa8bf597212dbe86a5b:0f7b59c251568d7ea34a9f2963b7d056d5fe3ce085cefa2da6c928672205c22a9a082350f2cfa1409ee02c3a46177644b511dd61502d20303a7b51aba48bfc9333ccee7af9180b1e9a89f8d16efb0ce64b795785d61157b78b1096e91eb70c34961d056d805ab1efadf6bb8cc974082da70881393db8b51c720ed1caf0e77aa51c814369f0567ec2f357092df7eab1fb4c27fc5f1ee4991e8a1212ee78bf596d08a233d52282ca419547630b776f4ab0b9f1dea66d4fc29ee81e56ee084abe9d2b65b44557e63b10efbcab2ce7e501c4680cc0e51b14b757c78b69fbf8baa8f582f76870f0d7101e56708c833d2935ed49131a311de05b120b35768f9430ed56d26b42ad953f74159e323528f01f0e5aa646aa7869f31dc2aec17008d25c6aedab035bf8ce17357b17cca92332995ba906efa8db60258fc86de21b806548f471cad126e2ecb04be8ff34d63ce3157ac22c0e2e1a1f743a9bd0336a42ce0a653fee80963b070671ca687e2856572a4bcdf5847e9be4b2e40daecae6d495d879978998cff2b2bbb90f25421c63f6aef493c8b7e7e249f7929b09bd033229901db9fbe9d5631771fc6a7afe768480a94bc02cf4b03db587d4c2c694886e7ef93aa9b5b2da502cf12f1be692daa33de9284e59c0e7ea819516cc417a1eb28debe6d9693ff829a741ab77';

function decrypt(text, secret) {
    const key = crypto.scryptSync(secret, salt, 32);
    const parts = text.split(':');
    const [ivHex, authTagHex, encrypted] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

for (const secret of secrets) {
    try {
        console.log(`Trying secret: ${secret}`);
        console.log('Decrypted Secret:', decrypt(text, secret));
        console.log('SUCCESS!');
        break;
    } catch (e) {
        console.error(`Decryption failed for secret ${secret}:`, e.message);
    }
}
