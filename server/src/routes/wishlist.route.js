const express = require("express");
const wishlist = express.Router({ mergeParams: true });
const protectRoute = require("../middleware/protectRoute");
const User = require("../models/user.model");
const axios = require("axios");
const cheerio = require("cheerio");
const ObjectId = require("mongodb").ObjectId;

let dateFormat = {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "numeric",
  // second: "2-digit",
};

wishlist.post("/", protectRoute, async (req, res, next) => {
  try {
    let results = [];
    let SCRAPING_URL = req.body.url;
    const response = await axios
      .get(SCRAPING_URL)
      .then((res) => res.data)
      .catch((err) => err);
    const $ = cheerio.load(response);
    let date = new Date(Date.now() + 8 * 60 * 60 * 1000);
    let lastUpdated = date.toLocaleString("en-GB", dateFormat);
    let productID = ObjectId();
    let productLink = SCRAPING_URL;
    let productName = $(".product-name").text();

    if ($(".bv-rating-summary").text() === "") {
      throw "Invalid URL";
    } else {
      if ($(".price-standard").text().trim() === "") {
        let originalPrice = $(".price-sales").text().trim();
        let salesPrice = "N/A";
        results.push({
          _id: productID,
          productLink: productLink,
          productName: productName,
          originalPrice: originalPrice,
          salesPrice: salesPrice,
          lastUpdated: lastUpdated,
        });
      } else {
        let originalPrice = $(".price-standard").text().trim();
        let salesPrice = $(".price-sales").text().trim();
        results.push({
          _id: productID,
          productLink: productLink,
          productName: productName,
          originalPrice: originalPrice,
          salesPrice: salesPrice,
          lastUpdated: lastUpdated,
        });
      }

      await User.updateOne(
        { username: req.user.username },
        {
          $addToSet: {
            wishlist: results,
          },
        }
      );
      res.status(201).json(results);
    }
  } catch (err) {
    err.statusCode = 400;
    next(err);
  }
});

wishlist.delete("/:id", protectRoute, async (req, res, next) => {
  try {
    const wishlist = await User.updateOne(
      { username: req.user.username, "wishlist._id": req.params.id },
      {
        $pull: {
          wishlist: { _id: req.params.id },
        },
      }
    );
    if (wishlist === null) {
      const error = new Error("Item does not exist");
      error.statusCode = 400;
      next(error);
    } else {
      res.status(200).json(wishlist);
    }
  } catch (error) {
    next(error);
  }
});

wishlist.get("/", protectRoute, async (req, res, next) => {
  let aggregateArray = await [
    {
      $match: {
        username: req.user.username,
      },
    },
    {
      $unwind: "$wishlist",
    },
    {
      $project: {
        _id: "$wishlist._id",
        productLink: "$wishlist.productLink",
        productName: "$wishlist.productName",
        originalPrice: "$wishlist.originalPrice",
        salesPrice: "$wishlist.salesPrice",
        lastUpdated: "$wishlist.lastUpdated",
      },
    },
  ];

  try {
    const wishlistItems = await User.aggregate(aggregateArray);
    let results = [];
    for (let i = 0; i < wishlistItems.length; i++) {
      let SCRAPING_URL = wishlistItems[i].productLink;
      const response = await axios
        .get(SCRAPING_URL)
        .then((res) => res.data)
        .catch((err) => console.log(err));

      const $ = cheerio.load(response);

      let date = new Date();
      // let date = new Date(Date.now() + 8 * 60 * 60 * 1000);
      let lastUpdated = date.toLocaleString("en-SG", dateFormat);

      let productLink = SCRAPING_URL;
      let productName = $(".product-name").text();
      if ($(".price-standard").text().trim() === "") {
        let originalPrice = $(".price-sales").text().trim();
        let salesPrice = "N/A";
        results.push({
          productLink: productLink,
          productName: productName,
          originalPrice: originalPrice,
          salesPrice: salesPrice,
          lastUpdated: lastUpdated,
        });
      } else {
        let originalPrice = $(".price-standard").text().trim();
        let salesPrice = $(".price-sales").text().trim();
        results.push({
          productLink: productLink,
          productName: productName,
          originalPrice: originalPrice,
          salesPrice: salesPrice,
          lastUpdated: lastUpdated,
        });
      }
    }

    await User.updateOne(
      { username: req.user.username },
      {
        $set: {
          wishlist: results,
        },
      }
    );

    const updatedWishlist = await User.aggregate(aggregateArray);
    res.status(200).json(updatedWishlist);
  } catch (err) {
    next(err);
  }
});

module.exports = wishlist;
