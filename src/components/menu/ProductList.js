import React, { Fragment } from 'react';
import ProductCard from './ProductCard';

export default function ProductList({ groupId, content }) {
    const groupedProducts = content.filter((product) => product.group === groupId);
    return (
        <Fragment key={groupId}>
            {groupedProducts.map((product) => (
                <ProductCard key={product.ean} product={product} />
            ))}
        </Fragment>
    );
}