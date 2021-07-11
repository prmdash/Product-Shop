const path = require("path");
const express = require("express");

const fileDir = require("../util/path");

const router = express.Router();

const products = [];

router.get("/add-product", (req, res) => {
  res.render("add-product", {pageTitle: "Add Product"});
});

router.post("/add-product", (req, res) => {
  products.push({title: req.body.title});
  res.redirect("/");
});


exports.routes = router;
exports.products = products;