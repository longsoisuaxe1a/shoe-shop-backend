const { bucketName, s3 } = require("../config/aws.config");
const { ProductRepository } = require("../repositories/index");

const path = require('path');
// create product
const addProduct = async (req, res) => {
  try {
    const {
      name,
      quantity,
      category,
      price,
      description,
      color,
      material,
      design,
      size
    } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const imageURLs = [];

    // Loop through each file and upload to S3
    for (const file of req.files) {
      const fileType = path.extname(file.originalname).toLowerCase();
      const filePath = `${Date.now().toString()}_${file.originalname}`; // Ensure unique file name

      const paramsS3 = {
        Bucket: bucketName,
        Key: filePath,
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      try {
        const data = await s3.upload(paramsS3).promise();
        imageURLs.push(data.Location);
      } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error uploading images" });
      }
    }

    // Log imageURLs to debug
    console.log('Image URLs:', imageURLs);

    // Add product with image URLs array
    const product = await ProductRepository.addProduct(
      name,
      quantity,
      category,
      price,
      description,
      color,
      material,
      design,
      size,
      imageURLs // pass the array of image URLs
    );

    res.status(201).json({
      message: "Product added successfully!",
      data: product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Cannot add product!",
    });
  }
};

// delete product by id
const deleteProductById = async (req, res) => {
  try {
    const _id = req.params;
    const product = await ProductRepository.deleteProductById(_id);
    res.status(200).json({
      message: "Delete product successfully!",
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      message: "Cannot delete product because ID not found",
    });
  }
};
// update product by _id
const updateProduct = async (req, res) => {
  try {
    const { _id } = req.params;
    const {
      name,
      quantity,
      category,
      price,
      description,
      color,
      material,
      design,
    } = req.body;
    const productNew = {
      name,
      quantity,
      category,
      price,
      description,
      color,
      material,
      design,
    };
    const product = await ProductRepository.updateProduct(_id, productNew);
    res.status(200).json({
      message: "Update product successfully!",
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      message: "Cannot update product!",
      error: error.message,
    });
  }
};
// find product by id
const findProductById = async (req, res) => {
  try {
    const { _id } = req.body;
    const product = await ProductRepository.findProductById(_id);
    if (product == null) {
      throw new Error("Not found product by id!");
    }
    res.status(200).json({
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      message: "Cannot found product by id!",
    });
  }
};
// find all product
const findAllProduct = async (req, res) => {
  try {
    const products = await ProductRepository.findAllProduct();
    res.status(200).json({
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      message: "null!",
    });
  }
};
// find all product by category
const findAllProuctByCategory = async (req, res) => {
  try {
    const { categoryId } = req.body;
    const products = await ProductRepository.findAllProuctByCategory(
      categoryId
    );
    res.status(200).json({
      message: "Successfully!",
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      message: "Null!",
    });
  }
};
// upload images
const uploadImages = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const image = req.file.originalname.split(".");
    const fileType = image[image.length - 1];
    const filePath = `${Date.now().toString()}.${fileType}`; // Bạn có thể thêm studentId nếu cần thiết

    const paramsS3 = {
      Bucket: bucketName,
      Key: filePath,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };

    s3.upload(paramsS3, (err, data) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Error uploading image" });
      }
      const imageURL = data.Location; // URL của hình ảnh sau khi được upload lên S3
      res.status(200).json({
        message: "Image uploaded successfully!",
        imageURL,
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error!");
  }
};
module.exports = {
  addProduct,
  deleteProductById,
  updateProduct,
  findProductById,
  findAllProduct,
  findAllProuctByCategory,
  uploadImages,
};
