const hre = require("hardhat");

const {CRYPTODEVS_NFT_CONTRACT_ADDRESS} = require("../constrants")

async function main() {

  const cryptoDevsToken = await hre.ethers.getContractFactory("CryptoDevToken");
  const deployCryptoDevsToken = await cryptoDevsToken.deploy(
    CRYPTODEVS_NFT_CONTRACT_ADDRESS
    );

  await deployCryptoDevsToken.deployed();

  console.log("Crypto Devs Token deployed to:", deployCryptoDevsToken.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
