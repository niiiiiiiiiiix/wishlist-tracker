const Wishlist = require("../models/wishlist.model");

const createNewWishlistItem = async (wishlistItem, next) => {
  try {
    const newWishlistItem = new Wishlist(wishlistItem);
    await newWishlistItem.save();
    return newWishlistItem;
  } catch (err) {
    next(err);
  }
};

const getAllWishlistItems = async (next) => {
  try {
    const allWishlistItems = await Wishlist.find();
    return allWishlistItems;
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createNewWishlistItem,
  getAllWishlistItems,
};