const { V4 } = require("paseto");

async function generateKeys() {
  // Generate a key pair
  const keyPair = await V4.generateKey("public", { format: "paserk" });

  // The keyPair object contains both the public and private keys
  console.log("Public Key:", keyPair.publicKey);
  console.log("Private Key:", keyPair.secretKey);
}

generateKeys();
