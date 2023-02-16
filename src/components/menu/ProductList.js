import React, { Fragment } from 'react';
import ProductCard from './ProductCard';

export default function ProductList({ group, content }) {
    console.log(group, content);
    const groupedProducts = content.filter((product) => product.group === group);
    return (
        <Fragment key={group}>
            {groupedProducts.map((product) => (
                <ProductCard key={product.ean} product={product} />
            ))}
        </Fragment>
    );
}