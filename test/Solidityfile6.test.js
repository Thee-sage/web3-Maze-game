const { network } = require("hardhat");
const {
  developmentChains,
  VERIFICATION_BLOCK_CONFIRMATIONS,
} = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const waitBlockConfirmations = developmentChains.includes(network.name)
    ? 1
    : VERIFICATION_BLOCK_CONFIRMATIONS;

  log("----------------------------------------------------");
  const nftFloorPriceConsumer = "<NFT_FLOOR_PRICE_CONSUMER_ADDRESS>";

  const arguments = [nftFloorPriceConsumer];
  const solidityFile6 = await deploy("SolidityFile6", {
    from: deployer,
    args: arguments,
    log: true,
    waitConfirmations: waitBlockConfirmations,
  });

  // Verify the deployment
  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    log("Verifying...");
    await verify(solidityFile6.address, arguments);
  }
  log("----------------------------------------------------");

  // Deployer stakes NFT
  const nftAddress = "<NFT_ADDRESS>";
  const tokenId = 1;

  const nftContract = await ethers.getContractAt("IERC721", nftAddress);
  await nftContract.approve(solidityFile6.address, tokenId);

  const stakingTx = await solidityFile6.stake(nftAddress, tokenId);
  const stakingReceipt = await stakingTx.wait();

  const stakingEvent = stakingReceipt.events.find(
    (event) => event.event === "ItemStaked"
  );
  const { args: stakingArgs } = stakingEvent;

  expect(stakingArgs.seller).to.equal(deployer);
  expect(stakingArgs.nftAddress).to.equal(nftAddress);
  expect(stakingArgs.tokenId).to.equal(tokenId);

  const staking = await solidityFile6.s_staking(nftAddress, tokenId);
  expect(staking.floorPrice).to.not.equal(0);

  // Deployer transfers NFT
  const recipient = "<RECIPIENT_ADDRESS>";
  const transferTx = await solidityFile6.transferNFT(
    nftAddress,
    tokenId,
    recipient
  );
  const transferReceipt = await transferTx.wait();

  const transferEvent = transferReceipt.events.find(
    (event) => event.event === "ItemTransferred"
  );
  const { args: transferArgs } = transferEvent;

  expect(transferArgs.from).to.equal(solidityFile6.address);
  expect(transferArgs.to).to.equal(recipient);
  expect(transferArgs.nftAddress).to.equal(nftAddress);
  expect(transferArgs.tokenId).to.equal(tokenId);

  const stakingAfterTransfer = await solidityFile6.s_staking(
    nftAddress,
    tokenId
  );
  expect(stakingAfterTransfer.floorPrice).to.equal(0);
};
