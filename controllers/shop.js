const Product = require("../models/product");

exports.getProducts = (req, res) => {
  Product.findAll()
    .then((products) => {
      res.render("shop/product-list", {
        products: products,
        pageTitle: "All Products",
        path: "/product-list",
      });
    })
    .catch((e) => {
      console.log(e);
    });
};

exports.getProductById = (req, res) => {
  // An alternative way to retrieve the product with a specific id
  // Product.findAll({where: {id: req.params.productId}});
  // However, that returns an array of products

  Product.findByPk(req.params.productId)
    .then((product) => {
      res.render("shop/product-details", {
        product: product,
        pageTitle: product.title,
        path: "/product",
      });
    })
    .catch((e) => console.log(e));
};

exports.getIndex = (req, res) => {
  Product.findAll()
    .then((products) => {
      res.render("shop/index", {
        products: products,
        pageTitle: "Shop",
        path: "/",
      });
    })
    .catch((e) => {
      console.log(e);
    });
};

exports.getCart = (req, res) => {
  req.user
    .getCart()
    .then((cart) => {
      return cart.getProducts();
    })
    .then((products) => {
      res.render("shop/cart", {
        pageTitle: "Your Cart",
        path: "/cart",
        products: products,
      });
    })
    .catch((e) => console.log(e));
};

exports.postCart = (req, res) => {
  const productId = req.body.productId;
  let fetchedCart;
  let newQuantity = 1;
  req.user
    .getCart()
    .then((cart) => {
      fetchedCart = cart;
      return cart.getProducts({ where: { id: productId } });
    })
    .then((products) => {
      let product;
      if (products.length) {
        product = products[0];
      }

      if (product) {
        // Existing product
        const oldQty = product.cartItem.quantity;
        newQuantity = oldQty + 1;
        return product;
      }

      // When adding a new product
      return Product.findByPk(productId);
    })
    .then((product) => {
      return fetchedCart.addProduct(product, {
        through: { quantity: newQuantity },
      });
    })
    .then(() => {
      res.redirect("/cart");
    })
    .catch((e) => console.log(e));
};

exports.getOrders = (req, res) => {
  req.user
    .getOrders({include: ['products']})
    .then((orders) => {
      res.render("shop/orders", {
        pageTitle: "Your Orders",
        path: "/orders",
        orders: orders,
      });
    })
    .catch((e) => console.log(e));
};

exports.postOrder = (req, res) => {
  let fetchedCart;
  req.user
    .getCart()
    .then((cart) => {
      fetchedCart = cart;
      return cart.getProducts();
    })
    .then((products) => {
      return req.user
        .createOrder()
        .then((order) => {
          return order.addProduct(
            products.map((product) => {
              product.orderItem = { quantity: product.cartItem.quantity };
              return product;
            })
          );
        })
        .then(() => {
          return fetchedCart.setProducts(null);
        })
        .then(() => {
          res.redirect("/orders");
        })
        .catch((e) => console.log(e));
    })
    .catch();
};

exports.postCartDeleteProduct = (req, res) => {
  const productId = req.body.productId;
  req.user
    .getCart()
    .then((cart) => {
      return cart.getProducts({ where: { id: productId } });
    })
    .then((products) => {
      const product = products[0];
      return product.cartItem.destroy();
    })
    .then(() => {
      res.redirect("/cart");
    })
    .catch((e) => console.log(e));
};
