import ShopCardComponent from '../../../components/shop/ShopCardComponent'
import ShopFilterComponent from '../../../components/shop/ShopFilterComponent'
import React from 'react'
import { getAllCategories, getAllProducts } from '../../../service/shop.service'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth'
import SearchProductByName from '../../../components/shop/SearchProductByName'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

export default async function Page({ searchParams }) {
  const SearchParams = await searchParams;
  const session = await getServerSession(authOptions);
  const categories = await getAllCategories(session?.accessToken);
  const allProducts = await getAllProducts(session?.accessToken);
  const keyword = (SearchParams?.q ?? '').toString().trim().toLowerCase();
  const selectedMaxPrice = Number((SearchParams?.price ?? '').toString());
  const selectedCategoryIds = SearchParams?.categoryId
    ? Array.isArray(SearchParams.categoryId)
      ? SearchParams.categoryId
      : [SearchParams.categoryId]
    : [];
  const selectedCategorySet = new Set(selectedCategoryIds.map((id) => String(id)));

  const categoryMap = new Map(
    categories.map((category) => [category.categoryId, category.categoryName])
  );

  const productsWithCategoryName = allProducts.map((product) => ({
    ...product,
    categoryName: categoryMap.get(product.categoryId) ?? 'Uncategorized',
  }));

  const productDisplay = productsWithCategoryName.filter((product) => {
    const name = (product?.name ?? product?.productName ?? '').toLowerCase();
    const productCategoryId = String(product?.categoryId ?? '');
    const price = Number(product?.price ?? 0);

    const matchesName = !keyword || name.includes(keyword);
    const matchesCategory =
      selectedCategorySet.size === 0 || selectedCategorySet.has(productCategoryId);
    const matchesPrice =
      !Number.isFinite(selectedMaxPrice) || selectedMaxPrice <= 0 || price <= selectedMaxPrice;

    return matchesName && matchesCategory && matchesPrice;
  });

  console.log('ALL PRODUCT', productDisplay);
  
  return (
    <div className='max-w-7xl mx-auto my-8'>
        {/* <ShopCardComponent /> */}
        <div className='flex justify-between items-end '>
          <div>
            <h2 className='text-3xl font-semibold text-gray-900'>Luxury beauty products</h2>
            <p className='text-sm text-gray-600'>Use the filters to narrow by price and brand.</p>
          </div>
          <div>
            <SearchProductByName initialValue={SearchParams?.q ?? ''} />
          </div>
        </div>

        <div className="flex items-start py-14 gap-5">
          <div className="w-1/4 sticky top-20 self-start">
            <ShopFilterComponent />
          </div>
          <div>
            <p className='text-sm mb-3 text-gray-700'>showing <span className='text-lg font-semibold'>{productDisplay.length}</span> products.</p>
          {productDisplay.length > 0 ? (
            <div className='grid grid-cols-3 gap-5'>
              {productDisplay.map((product) => (
                <ShopCardComponent key={product.productId} product={product} />
              ))}
            </div>
          ) : (
            <div className=' mx-auto w-full px-75 mt-20'>
              <Image src="https://www.lifeneedsstore.in/Img/Noproduct.png" alt="No products found" width={400} height={350} />
            </div>
          )}
          </div>
        </div>
    </div>
  )
}
