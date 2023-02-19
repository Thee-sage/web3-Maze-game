const { expect } = require("chai");

describe("SolidityFile6"),
  function () {
    let contract;
    let owner;
    let addr1;
    let addr2;

    beforeEach(async function () {
      const SolidityFile6 = await ethers.getContractFactory("SolidityFile6");
      const NFTFloorPriceConsumerV3 = await ethers.getContractFactory(
        "NFTFloorPriceConsumerV3"
      );
      const nftFloorPriceConsumer = await NFTFloorPriceConsumerV3.deploy();
      await nftFloorPriceConsumer.deployed();
      contract = await SolidityFile6.deploy(nftFloorPriceConsumer.address);
      await contract.deployed();

      [owner, addr1, addr2] = await ethers.getSigners();
    });

    describe("stake()", function () {
      it("should stake an NFT with a floor price and emit an ItemStaked event", async function () {
        const nftAddress = "0x1"; // example NFT address
        const tokenId = 1;
        const approvedAddress = contract.address;

        const nft = await ethers.getContractAt("IERC721", nftAddress);
        await nft.connect(owner).approve(approvedAddress, tokenId);

        const tx = await contract.connect(owner).stake(nftAddress, tokenId);
        const receipt = await tx.wait();

        expect(receipt.events[0].event).to.equal("ItemStaked");
        expect(receipt.events[0].args.seller).to.equal(owner.address);
        expect(receipt.events[0].args.nftAddress).to.equal(nftAddress);
        expect(receipt.events[0].args.tokenId).to.equal(tokenId);
        expect(receipt.events[0].args.floorPrice).to.be.a("BigNumber");
      });

      it("should revert when staking an already staked NFT", async function () {
        const nftAddress = "0x1"; // example NFT address
        const tokenId = 1;
        const approvedAddress = contract.address;

        const nft = await ethers.getContractAt("IERC721", nftAddress);
        await nft.connect(owner).approve(approvedAddress, tokenId);
        await contract.connect(owner).stake(nftAddress, tokenId);

        await expect(
          contract.connect(owner).stake(nftAddress, tokenId)
        ).to.be.revertedWith("AlreadyStaked");
      });

      it("should revert when staking an NFT that has not been approved for transfer", async function () {
        const nftAddress = "0x1"; // example NFT address
        const tokenId = 1;

        const nft = await ethers.getContractAt("IERC721", nftAddress);

        await expect(
          contract.connect(owner).stake(nftAddress, tokenId)
        ).to.be.revertedWith("NotApprovedForStaking");
      });

      it("should revert when staking an NFT as a non-owner", async function () {
        const nftAddress = "0x1"; // example NFT address
        const tokenId = 1;
        const approvedAddress = contract.address;

        const nft = await ethers.getContractAt("IERC721", nftAddress);
        await nft.connect(owner).approve(approvedAddress, tokenId);

        await expect(
          contract.connect(addr1).stake(nftAddress, tokenId)
        ).to.be.revertedWith("NotOwner");
      });
    });

    describe("transferNFT()", function () {
      it("should transfer a staked NFT to another address", async function () {
        const nftAddress = "0x1"; // example NFT address
        const tokenId = 1;
        const approvedAddress = contract.address;

        const nft = await ethers.getContractAt("IERC721", nftAddress);
        await nft.connect(owner).approve(approvedAddress, tokenId);

        await contract.connect(owner).stake(nftAddress, tokenId);
        await contract
          .connect(owner)
          .transferNFT(addr1.address, nftAddress, tokenId);

        const ownerOfNFT = await nft.ownerOf(tokenId);
        expect(ownerOfNFT).to.equal(addr1.address);

        const nftInfo = await contract.getStakedItem(nftAddress, tokenId);
        expect(nftInfo.seller).to.equal(addr1.address);
      });

      it("should revert when transferring a staked NFT that is not owned by the caller", async function () {
        const nftAddress = "0x1"; // example NFT address
        const tokenId = 1;

        const nft = await ethers.getContractAt("IERC721", nftAddress);
        await nft.connect(owner).approve(contract.address, tokenId);
        await contract.connect(owner).stake(nftAddress, tokenId);

        await expect(
          contract
            .connect(addr1)
            .transferNFT(addr2.address, nftAddress, tokenId)
        ).to.be.revertedWith("NotOwner");
      });

      it("should revert when transferring a staked NFT that is not approved for transfer", async function () {
        const nftAddress = "0x1"; // example NFT address
        const tokenId = 1;

        const nft = await ethers.getContractAt("IERC721", nftAddress);
        await nft.connect(owner).approve(contract.address, tokenId);
        await contract.connect(owner).stake(nftAddress, tokenId);

        await expect(
          contract
            .connect(addr1)
            .transferNFT(addr2.address, nftAddress, tokenId)
        ).to.be.revertedWith("NotApprovedForTransfer");
      });
    });
  };
