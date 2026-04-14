import { getServerSession } from "next-auth";

import { authOptions } from "../../../auth";
import ManageProductsClient from "../../../components/manage-products/ManageProductsClient";
import { getAllCategories, getAllProducts } from "../../../service/shop.service";

export default async function Page() {
  const session = await getServerSession(authOptions);
  const accessToken = session?.accessToken;

  const [categories, products] = await Promise.all([
    getAllCategories(accessToken),
    getAllProducts(accessToken),
  ]);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8">
      <ManageProductsClient initialProducts={products} categories={categories} />
    </section>
  );
}
