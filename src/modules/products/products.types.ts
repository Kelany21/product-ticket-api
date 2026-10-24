export interface Product {
  product_code: string;
  product_title: string;
  product_price: number;
}

interface ProductRow {
  product_code: string;
  product_title: string;
  product_price: string;
}

export function toProduct(row: ProductRow): Product {
  return {
    product_code: row.product_code,
    product_title: row.product_title,
    product_price: Number(row.product_price),
  };
}
