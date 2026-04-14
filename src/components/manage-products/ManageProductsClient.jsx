"use client";

import { Plus, RefreshCcw } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";

import CreateProductComponent from "./CreateProductComponent";
import ModalComponent from "./ModalComponent";
import ProductCardComponent from "./ProductCardComponent";
import SortProductComponent from "./SortProductComponent";
import {
  createManageProduct,
  deleteManageProduct,
  getManageProducts,
  updateManageProduct,
} from "../../service/manage-product.service";

function compareValues(left, right, direction) {
  if (left === right) {
    return 0;
  }

  if (direction === "desc") {
    return left > right ? -1 : 1;
  }

  return left > right ? 1 : -1;
}

export default function ManageProductsClient({ initialProducts = [], categories = [] }) {
  const [products, setProducts] = useState(initialProducts);
  const [sortBy, setSortBy] = useState("name-asc");
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalMode, setModalMode] = useState("create");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const refreshProducts = async () => {
    const nextProducts = await getManageProducts();
    setProducts(nextProducts);
  };

  const sortedProducts = useMemo(() => {
    const items = [...products];

    items.sort((left, right) => {
      const leftName = String(left?.productName ?? left?.name ?? "").toLowerCase();
      const rightName = String(right?.productName ?? right?.name ?? "").toLowerCase();

      return sortBy === "name-desc"
        ? compareValues(leftName, rightName, "desc")
        : compareValues(leftName, rightName, "asc");
    });

    return items;
  }, [products, sortBy]);

  const handleCreateClick = () => {
    setSelectedProduct(null);
    setModalMode("create");
    setIsProductModalOpen(true);
  };

  const handleEditClick = (product) => {
    setSelectedProduct(product);
    setModalMode("edit");
    setIsProductModalOpen(true);
  };

  const handleDeleteClick = (product) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  const handleSubmitProduct = async (payload) => {
    try {
      setIsSubmitting(true);
      setStatusMessage("");

      if (modalMode === "edit" && selectedProduct?.productId) {
        await updateManageProduct(selectedProduct.productId, payload);
      } else {
        await createManageProduct(payload);
      }

      await refreshProducts();
      setIsProductModalOpen(false);
      setSelectedProduct(null);
      setStatusMessage(modalMode === "edit" ? "" : "Product created successfully.");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Failed to save product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedProduct?.productId) {
      return;
    }

    try {
      setIsDeleting(true);
      setStatusMessage("");
      await deleteManageProduct(selectedProduct.productId);
      await refreshProducts();
      setIsDeleteModalOpen(false);
      setSelectedProduct(null);
      setStatusMessage("Product deleted successfully.");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Failed to delete product.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-gray-900">Manage Products</h1>
          <p className="mt-2 text-sm text-gray-500">
            Create, update, and delete products in this demo( Local sTate only)
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SortProductComponent value={sortBy} onChange={setSortBy} />
        </div>
      </div>

      
      <section className="rounded-[28px] border border-gray-200 bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.04)]">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-gray-900">Products</h2>
          <button
            type="button"
            onClick={handleCreateClick}
            className="inline-flex h-11 items-center cursor-pointer justify-center gap-2 rounded-full bg-lime-400 px-5 text-sm font-semibold text-lime-950 shadow-[0_10px_20px_rgba(132,204,22,0.35)] transition hover:bg-lime-300"
          >
            <Plus className="size-4" />
            Create product
          </button>
        </div>

        {sortedProducts.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {sortedProducts.map((product) => (
              <ProductCardComponent
                key={product.productId ?? product.id}
                product={{
                  ...product,
                  categoryName:
                    categories.find((category) => String(category.categoryId) === String(product.categoryId))
                      ?.categoryName ?? "Uncategorized",
                }}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        ) : (
          <div className="flex min-h-80 items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-gray-50 text-sm text-gray-500">
            <Image src="https://www.lifeneedsstore.in/Img/Noproduct.png" alt="No products found" width={400} height={350} />
          </div>
        )}
      </section>

      <CreateProductComponent
        key={`${isProductModalOpen ? "open" : "closed"}-${modalMode}-${selectedProduct?.productId ?? "new"}`}
        isOpen={isProductModalOpen}
        mode={modalMode}
        product={selectedProduct}
        categories={categories}
        isSubmitting={isSubmitting}
        onClose={() => setIsProductModalOpen(false)}
        onSubmit={handleSubmitProduct}
      />

      <ModalComponent
        isOpen={isDeleteModalOpen}
        product={selectedProduct}
        isDeleting={isDeleting}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}