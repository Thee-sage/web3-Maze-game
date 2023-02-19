Moralis.Cloud.afterSave("ItemStaked", async (request) => {
  const confirmed = request.object.get("confirmed");
  const logger = Moralis.Cloud.getLogger();
  logger.info("Looking for confirmed TX...");
  if (confirmed) {
    logger.info("Found Item!");
    const ActiveItem = Moralis.Object.extend("StakedItem");

    // In case of listing update, search for already listed ActiveItem and delete
    const query = new Moralis.Query(ActiveItem);
    query.equalTo("nftAddress", request.object.get("nftAddress"));
    query.equalTo("tokenId", request.object.get("tokenId"));
    query.equalTo("marketplaceAddress", request.object.get("address"));
    query.equalTo("seller", request.object.get("seller"));
    logger.info(`Marketplace | Query: ${query}`);
    const alreadyStakedItem = await query.first();
    console.log(`alreadyStakedItem ${JSON.stringify(alreadyStakedItem)}`);
    if (alreadyListedItem) {
      logger.info(`Deleting ${alreadyListedItem.id}`);
      await alreadyListedItem.destroy();
      logger.info(
        `Deleted item with tokenId ${request.object.get(
          "tokenId"
        )} at address ${request.object.get(
          "address"
        )} since the listing is being updated. `
      );
    }

    // Add new ActiveItem
    const activeItem = new ActiveItem();
    activeItem.set("marketplaceAddress", request.object.get("address"));
    activeItem.set("nftAddress", request.object.get("nftAddress"));
    activeItem.set("price", request.object.get("price"));
    activeItem.set("tokenId", request.object.get("tokenId"));
    activeItem.set("seller", request.object.get("seller"));
    logger.info(
      `Adding Address: ${request.object.get(
        "address"
      )} TokenId: ${request.object.get("tokenId")}`
    );
    logger.info("Saving...");
    await activeItem.save();
  }
});
