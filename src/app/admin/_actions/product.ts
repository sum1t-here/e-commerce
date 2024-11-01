"use server";

import { z } from "zod";
import fs from "fs/promises"; // Importing the fs module for file system operations
import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

// Schema to validate a File instance
const fileSchema = z.instanceof(File, { message: "Required" });

// Image schema to validate that the file is an image and not empty
const imageSchema = fileSchema.refine(
  (file) => file.size === 0 || file.type.startsWith("image/")
);

// Main schema to validate the product information
const addSchema = z.object({
  // Validating that the name is a non-empty string
  name: z.string().min(1),
  // Validating that the description is a non-empty string
  description: z.string().min(1),
  // Validating that the price is an integer greater than or equal to 1
  priceInRs: z.coerce.number().int().min(1),
  // Validating that the 'file' is a required file
  file: fileSchema.refine((file) => file.size > 0, "Required"),
  // Validating that the 'image' is a required image file
  image: imageSchema.refine((file) => file.size > 0, "Required"),
});

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

let imageUpload: UploadApiResponse;
let fileUpload: UploadApiResponse;

// Function to add a product using the validated form data
export async function addProduct(prevState: unknown, formData: FormData) {
  const result = addSchema.safeParse(Object.fromEntries(formData.entries()));
  if (result.success === false) {
    return result.error.formErrors.fieldErrors;
  }
  // If validation succeeds, extract validated data
  const data = result.data;

  // Create a unique image path for the uploaded image using a UUID
  const imagePath = `public/products/${crypto.randomUUID()}-${data.image.name}`;
  // Create a unique file path for the uploaded file using a UUID
  const filePath = `public/products/${crypto.randomUUID()}-${data.file.name}`;

  try {
    // Create a 'products' directory if it doesn't exist
    await fs.mkdir("public/products", { recursive: true });

    // Write the uploaded file to the file system
    await fs.writeFile(filePath, Buffer.from(await data.image.arrayBuffer()));

    // Create a 'public/products' directory if it doesn't exist for serving images
    await fs.mkdir("public/products", { recursive: true });

    // Write the uploaded image to the public directory
    await fs.writeFile(imagePath, Buffer.from(await data.file.arrayBuffer()));

    // Upload the image to Cloudinary
    imageUpload = await cloudinary.uploader.upload(imagePath, {
      folder: "products", // Optional: specify a folder in Cloudinary
    });

    fileUpload = await cloudinary.uploader.upload(filePath, {
      folder: "products",
    });
  } catch {
    await fs.unlink(imagePath);
    await fs.unlink(filePath);
  }

  // Save the product information to the database using Prisma
  await prisma?.product.create({
    data: {
      name: data.name,
      description: data.description,
      priceInRs: data.priceInRs,
      filePath: fileUpload?.secure_url || "",
      imagePath: imageUpload?.secure_url || "", // Path to the uploaded image
    },
  });

  await fs.unlink(imagePath);
  await fs.unlink(filePath);

  redirect("/admin/products");
}

const editSchema = addSchema.extend({
  file: fileSchema.optional(),
  image: imageSchema.optional(),
});

export async function updateProduct(
  id: string,
  prevState: unknown,
  formData: FormData
) {
  const result = editSchema.safeParse(Object.fromEntries(formData.entries()));
  if (result.success === false) {
    return result.error.formErrors.fieldErrors;
  }

  const data = result.data;

  const product = await prisma?.product.findUnique({ where: { id } });

  if (product == null) return notFound();

  let filePath = product.filePath;
  if (data.file != null && data.file.size > 0) {
    // await fs.unlink(product.filePath);
    filePath = `public/products/${crypto.randomUUID()}-${data.file.name}`;
    await fs.writeFile(filePath, Buffer.from(await data.file.arrayBuffer()));
  }
  fileUpload = await cloudinary.uploader.upload(filePath, {
    folder: "products",
  });

  let imagePath = product.imagePath;
  if (data.image != null && data.image.size > 0) {
    // await fs.unlink(`public${product.imagePath}`);
    imagePath = `public/products/${crypto.randomUUID()}-${data.image.name}`;
    await fs.writeFile(imagePath, Buffer.from(await data.image.arrayBuffer()));
  }
  imageUpload = await cloudinary.uploader.upload(imagePath, {
    folder: "products", // Optional: specify a folder in Cloudinary
  });

  await prisma?.product.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      priceInRs: data.priceInRs,
      filePath: fileUpload.secure_url || "",
      imagePath: imageUpload.secure_url || "",
    },
  });

  await fs.unlink(imagePath);
  await fs.unlink(filePath);

  revalidatePath("/");
  revalidatePath("/products");

  redirect("/admin/products");
}

export async function toggleProductAvailability(
  id: string,
  isAvailableForPurchase: boolean
) {
  await prisma.product.update({
    where: { id },
    data: { isAvailableForPurchase },
  });

  revalidatePath("/");
  revalidatePath("/products");
}

export async function deleteProduct(id: string) {
  const product = await prisma.product.findFirst({ where: { id } });

  if (product == null) return notFound();

  // Extract the public ID from the Cloudinary URL
  const publicId = product.imagePath.split("/").pop()?.split(".")[0]; // Adjust as needed based on URL structure

  if (publicId) {
    // Delete the image from Cloudinary
    await cloudinary.uploader.destroy(`products/${publicId}`);
  }

  // Delete the product record from the database
  await prisma.product.delete({ where: { id } });

  revalidatePath("/");
  revalidatePath("/products");
}
