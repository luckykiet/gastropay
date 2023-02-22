import React from 'react';
import { Form } from 'react-bulma-components';

export default function SearchBar({ handleSearch, width }) {
    const { Input } = Form;
    return (
        <Input style={{ width: width }} type={"search"} onChange={handleSearch} size={"medium"} rounded placeholder="Hledejte restauraci..."></Input>
    );
}

